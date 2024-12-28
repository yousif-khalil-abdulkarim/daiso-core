/**
 * @module Storage
 */

import { type ISerializer } from "@/serializer/contracts/_module";
import {
    MongodbSerializer,
    SuperJsonSerializer,
} from "@/serializer/implementations/_module";
import { type IInitizable, type RecordItem } from "@/_shared/types";
import {
    TypeStorageError,
    UnexpectedStorageError,
    type IStorageAdapter,
} from "@/storage/contracts/_module";
import escapeStringRegexp from "escape-string-regexp";
import type { MongoBulkWriteError } from "mongodb";
import { type Collection, MongoServerError, ObjectId } from "mongodb";

/**
 * @group Adapters
 */
export type MongodbStorageDocument = {
    _id: ObjectId;
    key: string;
    value: number | string;
};
/**
 * @group Adapters
 */
export type MongodbStorageAdapterSettings = {
    serializer?: ISerializer<string>;
};
/**
 * @group Adapters
 */
export class MongodbStorageAdapter<TType>
    implements IStorageAdapter<TType>, IInitizable
{
    private static isMongodbIncrementError(
        value: unknown,
    ): value is MongoServerError {
        return (
            value instanceof MongoServerError &&
            value.code !== undefined &&
            (typeof value.code === "string" ||
                typeof value.code === "number") &&
            String(value.code) === "14"
        );
    }

    private static isMongoDuplicateError(
        value: unknown,
    ): value is MongoBulkWriteError {
        return (
            value instanceof MongoServerError &&
            value.code !== undefined &&
            (typeof value.code === "string" ||
                typeof value.code === "number") &&
            String(value.code) === "11000"
        );
    }

    private serializer: ISerializer<string | number>;

    constructor(
        private readonly collection: Collection<MongodbStorageDocument>,
        {
            serializer = new SuperJsonSerializer(),
        }: MongodbStorageAdapterSettings = {},
    ) {
        this.serializer = new MongodbSerializer(serializer);
    }

    async init(): Promise<void> {
        await this.collection.createIndex("key", {
            unique: true,
        });
    }

    async existsMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>> {
        const mongodbResults = await this.collection
            .find<Pick<MongodbStorageDocument, "key">>(
                {
                    key: {
                        $in: keys,
                    },
                },
                {
                    projection: {
                        _id: 0,
                        key: 1,
                    },
                },
            )
            .toArray();

        const results = Object.fromEntries(keys.map((key) => [key, false]));
        for (const { key } of mongodbResults) {
            results[key] = true;
        }

        return results as Record<TKeys, boolean>;
    }

    async getMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, TType | null>> {
        const mongodbResults = await this.collection
            .find<Pick<MongodbStorageDocument, "key" | "value">>(
                {
                    key: {
                        $in: keys,
                    },
                },
                {
                    projection: {
                        _id: 0,
                    },
                },
            )
            .toArray();

        const results = Object.fromEntries(
            keys.map<RecordItem<string, TType | null>>((key) => [key, null]),
        );
        for (const { key, value } of mongodbResults) {
            results[key] = await this.serializer.deserialize(value);
        }

        return results as Record<TKeys, TType | null>;
    }

    async addMany<TKeys extends string>(
        values: Record<TKeys, TType>,
    ): Promise<Record<TKeys, boolean>> {
        const documents: MongodbStorageDocument[] = [];
        for (const key in values) {
            const { [key]: value } = values;
            documents.push({
                _id: new ObjectId(),
                key,
                value: await this.serializer.serialize(value),
            });
        }

        let mongodbIndexResults: string[];

        try {
            const mongodbResults = await this.collection.insertMany(documents, {
                ordered: false,
            });
            if (!mongodbResults.acknowledged) {
                throw new UnexpectedStorageError(
                    "Mongodb insertion was not acknowledged",
                );
            }
            mongodbIndexResults = Object.keys(mongodbResults.insertedIds);
        } catch (error: unknown) {
            if (!MongodbStorageAdapter.isMongoDuplicateError(error)) {
                throw error;
            }
            mongodbIndexResults = Object.keys(error.insertedIds);
        }

        const results = Object.fromEntries(
            Object.keys(values).map<RecordItem<string, boolean>>((key) => [
                key,
                false,
            ]),
        ) as Record<string, boolean>;
        for (const index of mongodbIndexResults) {
            const document = documents[Number(index)];
            if (document === undefined) {
                throw new UnexpectedStorageError("Array item is undefined");
            }
            const { key } = document;
            results[key] = true;
        }

        return results;
    }

    private async updateOne(key: string, value: unknown): Promise<boolean> {
        const mongodbResult = await this.collection.updateOne(
            { key },
            {
                $set: {
                    value: await this.serializer.serialize(value),
                },
            },
        );
        if (!mongodbResult.acknowledged) {
            throw new UnexpectedStorageError(
                "Mongodb update was not acknowledged",
            );
        }
        return mongodbResult.matchedCount > 0;
    }

    async updateMany<TKeys extends string>(
        values: Record<TKeys, TType>,
    ): Promise<Record<TKeys, boolean>> {
        const results = {} as Record<TKeys, boolean>;
        for (const key in values) {
            const { [key]: value } = values;
            results[key] = await this.updateOne(key, value);
        }
        return results;
    }

    private async putOne(key: string, value: unknown): Promise<boolean> {
        const mongodbResult = await this.collection.updateOne(
            { key },
            {
                $set: {
                    value: await this.serializer.serialize(value),
                },
            },
            { upsert: true },
        );
        if (!mongodbResult.acknowledged) {
            throw new UnexpectedStorageError(
                "Mongodb update was not acknowledged",
            );
        }
        return mongodbResult.upsertedCount <= 0;
    }

    async putMany<TKeys extends string>(
        values: Record<TKeys, TType>,
    ): Promise<Record<TKeys, boolean>> {
        const results = {} as Record<TKeys, boolean>;
        for (const key in values) {
            const { [key]: value } = values;
            results[key] = await this.putOne(key, value);
        }
        return results;
    }

    private async removeOne(key: string): Promise<boolean> {
        const mongodbResult = await this.collection.deleteOne({ key });
        if (!mongodbResult.acknowledged) {
            throw new UnexpectedStorageError(
                "Mongodb deletion was not acknowledged",
            );
        }
        return mongodbResult.deletedCount > 0;
    }

    async removeMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>> {
        const results = {} as Record<TKeys, boolean>;
        for (const key of keys) {
            results[key] = await this.removeOne(key);
        }
        return results;
    }

    async increment(key: string, value: number): Promise<boolean> {
        try {
            const mongodbResult = await this.collection.updateOne(
                {
                    key,
                },
                {
                    $inc: {
                        value,
                    } as Record<string, number>,
                },
            );
            if (!mongodbResult.acknowledged) {
                throw new UnexpectedStorageError(
                    "Mongodb update was not acknowledged",
                );
            }
            return mongodbResult.matchedCount > 0;
        } catch (error: unknown) {
            if (MongodbStorageAdapter.isMongodbIncrementError(error)) {
                throw new TypeStorageError(
                    `Unable to increment or decrement none number type key "${key}"`,
                );
            }
            throw error;
        }
    }

    async clear(prefix: string): Promise<void> {
        if (prefix === "") {
            await this.collection.deleteMany();
            return;
        }
        const mongodbResult = await this.collection.deleteMany({
            key: {
                $regex: new RegExp(`^${escapeStringRegexp(prefix)}`),
            },
        });
        if (!mongodbResult.acknowledged) {
            throw new UnexpectedStorageError(
                "Mongodb deletion was not acknowledged",
            );
        }
    }
}
