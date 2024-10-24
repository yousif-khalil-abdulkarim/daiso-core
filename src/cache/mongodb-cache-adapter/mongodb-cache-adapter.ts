/**
 * @module Cache
 */

import { RecordItem } from "@/_shared/types";
import {
    type ValueWithTTL,
    type ICacheAdapter,
    UnexpectedCacheError,
    TypeCacheError,
} from "@/contracts/cache/_module";
import {
    MongoBulkWriteError,
    MongoServerError,
    ObjectId,
    type Collection,
} from "mongodb";
import escapeStringRegexp from "escape-string-regexp";

export type MongodbCacheDocument = {
    _id: ObjectId;
    key: string;
    value: unknown;
    expiresAt?: Date;
};
/**
 * @group Adapters
 */
export class MongodbCacheAdapter<TType> implements ICacheAdapter<TType> {
    private static isMongodbDuplicateKeyError(
        value: unknown,
    ): value is MongoBulkWriteError {
        return (
            value instanceof MongoBulkWriteError &&
            value.code !== undefined &&
            (typeof value.code === "number" ||
                typeof value.code === "string") &&
            String(value.code) === "11000"
        );
    }

    private static isMongodbIncOperationError(
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

    private static offsetDate(date: Date, timeInMs: number): Date {
        return new Date(date.getTime() + timeInMs);
    }

    constructor(
        private readonly collection: Collection<MongodbCacheDocument>,
    ) {}

    async init(): Promise<void> {
        await this.collection.createIndex("key", {
            unique: true,
        });
        await this.collection.createIndex("expiresAt", {
            expireAfterSeconds: 0,
        });
    }

    async hasMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>> {
        const currentDate = new Date();
        const mongodbResults = await this.collection
            .find<Pick<MongodbCacheDocument, "key">>(
                {
                    $or: [
                        {
                            key: {
                                $in: keys,
                            },
                            expiresAt: {
                                $exists: false,
                            },
                        },
                        {
                            key: {
                                $in: keys,
                            },
                            expiresAt: {
                                $exists: true,
                                $gte: currentDate,
                            },
                        },
                    ],
                },
                {
                    projection: {
                        _id: 0,
                        key: 1,
                    },
                },
            )
            .toArray();

        const results = Object.fromEntries(
            keys.map<RecordItem<string, boolean>>((key) => [key, false]),
        );
        for (const mongodbResult of mongodbResults) {
            const { key } = mongodbResult;
            results[key] = true;
        }
        return results as Record<TKeys, boolean>;
    }

    async getMany<TValues extends TType, TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, TValues | null>> {
        const currentDate = new Date();
        const mongodbResults = await this.collection
            .find<Pick<MongodbCacheDocument, "key" | "value">>({
                $or: [
                    {
                        key: {
                            $in: keys,
                        },
                        expiresAt: {
                            $exists: false,
                        },
                    },
                    {
                        key: {
                            $in: keys,
                        },
                        expiresAt: {
                            $exists: true,
                            $gte: currentDate,
                        },
                    },
                ],
            })
            .toArray();

        const results = Object.fromEntries(
            keys.map<RecordItem<string, TValues | null>>((key) => [key, null]),
        );
        for (const mongodbResult of mongodbResults) {
            const { key, value } = mongodbResult;
            results[key] = value;
        }
        return results as Record<TKeys, TValues | null>;
    }

    async addMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, Required<ValueWithTTL<TValues>>>,
    ): Promise<Record<TKeys, boolean>> {
        const documentsToInsert: MongodbCacheDocument[] = [];
        const currentDate = new Date();
        for (const key in values) {
            const {
                [key]: { value, ttlInMs },
            } = values;
            if (ttlInMs !== null) {
                documentsToInsert.push({
                    _id: new ObjectId(),
                    key,
                    value,
                    expiresAt: MongodbCacheAdapter.offsetDate(
                        currentDate,
                        ttlInMs,
                    ),
                });
            } else {
                documentsToInsert.push({
                    _id: new ObjectId(),
                    key,
                    value,
                });
            }
        }

        let insertedDocumentIndexes: string[];
        try {
            const mongodbResults =
                await this.collection.insertMany(documentsToInsert);
            insertedDocumentIndexes = Object.keys(mongodbResults.insertedIds);
        } catch (error: unknown) {
            if (!MongodbCacheAdapter.isMongodbDuplicateKeyError(error)) {
                throw error;
            }
            insertedDocumentIndexes = Object.keys(error.result.insertedIds);
        }

        const results = Object.fromEntries(
            Object.keys(values).map((key) => [key, false]),
        );
        for (const index of insertedDocumentIndexes) {
            const documentToInsert = documentsToInsert[Number(index)];
            if (documentToInsert === undefined) {
                throw new UnexpectedCacheError("!!__message__!!");
            }
            const { key } = documentToInsert;
            results[key] = true;
        }

        return results as Record<TKeys, boolean>;
    }

    async putMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, Required<ValueWithTTL<TValues>>>,
    ): Promise<Record<TKeys, boolean>> {
        let bulkOperation = this.collection.initializeOrderedBulkOp();
        const currentDate = new Date();
        for (const key in values) {
            const {
                [key]: { value, ttlInMs },
            } = values;
            const bulkFindOperation = bulkOperation.find({ key }).upsert();
            if (ttlInMs !== null) {
                bulkOperation = bulkFindOperation.updateOne({
                    $set: {
                        key,
                        value,
                        expiresAt: MongodbCacheAdapter.offsetDate(
                            currentDate,
                            ttlInMs,
                        ),
                    },
                });
            } else {
                bulkOperation = bulkFindOperation.updateOne({
                    $set: {
                        key,
                        value,
                    },
                });
            }
        }
        const mongodbResults = await bulkOperation.execute();

        const upsertedIds = Object.keys(mongodbResults.upsertedIds);
        const keys = Object.keys(values);
        const results = Object.fromEntries(keys.map((key) => [key, true]));
        for (const upsertedId of upsertedIds) {
            const key = keys[Number(upsertedId)];
            if (key === undefined) {
                throw new UnexpectedCacheError("!!__message__!!");
            }
            results[key] = false;
        }

        return results as Record<TKeys, boolean>;
    }

    async removeMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>> {
        const results = {} as Record<TKeys, boolean>;
        for (const key of keys) {
            const mongodbResult = await this.collection.deleteOne({ key });
            const hasRemoved = mongodbResult.deletedCount === 1;
            results[key] = hasRemoved;
        }
        return results;
    }

    async getAndRemove<TValue extends TType>(
        key: string,
    ): Promise<TValue | null> {
        const mongodbResult = (await this.collection.findOneAndDelete(
            {
                key,
            },
            {
                projection: {
                    _id: 0,
                    value: 1,
                },
            },
        )) as Pick<MongodbCacheDocument, "value"> | null;
        if (mongodbResult === null) {
            return null;
        }
        const { value } = mongodbResult;
        return value as TValue;
    }

    async getOrAdd<TValue extends TType, TExtended extends TType>(
        key: string,
        valueToAdd: TExtended,
        ttlInMs: number | null,
    ): Promise<TValue | TExtended> {
        let mongodbResult: Pick<MongodbCacheDocument, "value"> | null;

        if (ttlInMs !== null) {
            mongodbResult = (await this.collection.findOneAndUpdate(
                {
                    key,
                },
                {
                    $setOnInsert: {
                        value: valueToAdd,
                        expiresAt: MongodbCacheAdapter.offsetDate(
                            new Date(),
                            ttlInMs,
                        ),
                    },
                },
                {
                    upsert: true,
                    projection: {
                        _id: 0,
                        value: 1,
                    },
                },
            )) as Pick<MongodbCacheDocument, "value"> | null;
        } else {
            mongodbResult = (await this.collection.findOneAndUpdate(
                {
                    key,
                },
                {
                    $setOnInsert: {
                        value: valueToAdd,
                    },
                },
                {
                    upsert: true,
                    projection: {
                        _id: 0,
                        value: 1,
                    },
                },
            )) as Pick<MongodbCacheDocument, "value"> | null;
        }
        if (mongodbResult === null) {
            return valueToAdd;
        }
        const { value } = mongodbResult;
        return value as TValue;
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
                    },
                },
                {
                    upsert: false,
                },
            );
            const keyExists = mongodbResult.matchedCount === 1;
            return keyExists;
        } catch (error: unknown) {
            if (!MongodbCacheAdapter.isMongodbIncOperationError(error)) {
                throw error;
            }
            throw new TypeCacheError("!!__message__!!", error);
        }
    }

    async clear(prefix: string): Promise<void> {
        if (prefix === "") {
            await this.collection.deleteMany();
            return;
        }
        await this.collection.deleteMany({
            key: {
                $regex: new RegExp(`^${escapeStringRegexp(prefix)}`),
            },
        });
    }
}
