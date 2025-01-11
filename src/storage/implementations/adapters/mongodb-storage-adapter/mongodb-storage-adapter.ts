/**
 * @module Storage
 */

import { type ISerializer } from "@/serializer/contracts/_module";
import {
    MongodbSerializer,
    SuperJsonSerializer,
} from "@/serializer/implementations/_module";
import { type IInitizable } from "@/_shared/types";
import {
    TypeStorageError,
    UnexpectedStorageError,
    type IStorageAdapter,
} from "@/storage/contracts/_module";
import escapeStringRegexp from "escape-string-regexp";
import type { MongoBulkWriteError } from "mongodb";
import { ObjectId } from "mongodb";
import { type Collection, MongoServerError } from "mongodb";

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

    async get(key: string): Promise<TType | null> {
        const document = await this.collection.findOne(
            { key },
            {
                projection: {
                    _id: 0,
                    key: 0,
                },
            },
        );
        if (document === null) {
            return null;
        }
        return this.serializer.deserialize(document.value);
    }

    async add(key: string, value: TType): Promise<boolean> {
        try {
            await this.collection.insertOne({
                _id: new ObjectId(),
                key,
                value: await this.serializer.serialize(value),
            });
            return true;
        } catch (error: unknown) {
            if (MongodbStorageAdapter.isMongoDuplicateError(error)) {
                return false;
            }
            throw error;
        }
    }

    async update(key: string, value: unknown): Promise<boolean> {
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

    async put(key: string, value: unknown): Promise<boolean> {
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

    async remove(key: string): Promise<boolean> {
        const mongodbResult = await this.collection.deleteOne({ key });
        if (!mongodbResult.acknowledged) {
            throw new UnexpectedStorageError(
                "Mongodb deletion was not acknowledged",
            );
        }
        return mongodbResult.deletedCount > 0;
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
