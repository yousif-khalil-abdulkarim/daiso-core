/**
 * @module Cache
 */

import {
    TypeCacheError,
    UnexpectedCacheError,
    type ICacheAdapter,
} from "@/cache/contracts/_module-exports.js";
import type { ISerde } from "@/serde/contracts/_module-exports.js";
import { MongodbCacheAdapterSerde } from "@/cache/implementations/adapters/mongodb-cache-adapter/mongodb-cache-adapter-serde.js";
import type {
    IDeinitizable,
    IInitizable,
    TimeSpan,
} from "@/utilities/_module-exports.js";
import { MongoServerError, type ObjectId } from "mongodb";
import {
    type Collection,
    type Filter,
    type CollectionOptions,
    type Db,
} from "mongodb";
import escapeStringRegexp from "escape-string-regexp";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/implementations/adapters"```
 * @group Adapters
 */
export type MongodbCacheAdapterSettings = {
    database: Db;
    serde: ISerde<string>;
    collectionName?: string;
    collectionSettings?: CollectionOptions;
};

/**
 * @internal
 */
type MongodbCacheDocument = {
    _id: ObjectId;
    key: string;
    value: number | string;
    expiration: Date | null;
};

/**
 * To utilize the <i>MongodbCacheAdapter</i>, you must install the <i>"mongodb"</i> package and supply a <i>{@link ISerde | ISerde<string> }</i>, with an adapter like <i>{@link SuperJsonSerdeAdapter}</i>.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/implementations/adapters"```
 * @group Adapters
 */
export class MongodbCacheAdapter<TType>
    implements ICacheAdapter<TType>, IInitizable, IDeinitizable
{
    private static filterUnexpiredKeys(
        keys: string[],
    ): Filter<MongodbCacheDocument> {
        const hasNoExpiration: Filter<MongodbCacheDocument> = {
            expiration: {
                $eq: null,
            },
        };
        const hasExpiration: Filter<MongodbCacheDocument> = {
            expiration: {
                $ne: null,
            },
        };
        const hasNotExpired: Filter<MongodbCacheDocument> = {
            expiration: {
                $gt: new Date(),
            },
        };
        const keysMatch = {
            key: {
                $in: keys,
            },
        };
        return {
            $and: [
                keysMatch,
                {
                    $or: [
                        hasNoExpiration,
                        {
                            $and: [hasExpiration, hasNotExpired],
                        },
                    ],
                },
            ],
        };
    }

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

    private readonly serde: ISerde<string | number>;
    private readonly collection: Collection<MongodbCacheDocument>;
    /**
     * @example
     * ```ts
     * import { MongodbCacheAdapter } from "@daiso-tech/core/cache/implementations/adapters";
     * import { Serde } from "@daiso-tech/core/serde/implementations/derivables";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/implementations/adapters"
     * import { MongoClient } from "mongodb";
     *
     * const client = await MongoClient.connect("YOUR_MONGODB_CONNECTION_STRING");
     * const database = client.db("database");
     * const serde = new Serde(new SuperJsonSerdeAdapter());
     * const cacheAdapter = new MongodbCacheAdapter({
     *   database,
     *   serde,
     * });
     * // You need initialize the adapter once before using it.
     * await cacheAdapter.init();
     * ```
     */
    constructor(settings: MongodbCacheAdapterSettings) {
        const {
            collectionName = "cache",
            collectionSettings,
            database,
            serde,
        } = settings;
        this.collection = database.collection(
            collectionName,
            collectionSettings,
        );
        this.serde = new MongodbCacheAdapterSerde(serde);
    }

    /**
     * Creates all related indexes.
     * Note the <i>init</i> method needs to be called before using the adapter.
     */
    async init(): Promise<void> {
        try {
            await this.collection.createIndex(
                {
                    key: 1,
                    group: 1,
                },
                {
                    unique: true,
                },
            );
            await this.collection.createIndex("expiration", {
                expireAfterSeconds: 0,
            });
        } catch {
            /* Empty */
        }
    }

    /**
     * Removes the collection where the cache values are stored and all it's related indexes.
     * Note all cache data will be removed.
     */
    async deInit(): Promise<void> {
        await this.collection.dropIndexes();
        await this.collection.drop();
    }

    private getDocValue(document: MongodbCacheDocument | null): TType | null {
        if (document === null) {
            return null;
        }
        const { expiration, value } = document;
        if (expiration === null) {
            return this.serde.deserialize(value);
        }
        const hasExpired = expiration.getTime() <= new Date().getTime();
        if (hasExpired) {
            return null;
        }
        return this.serde.deserialize(value);
    }

    async get(key: string): Promise<TType | null> {
        const document = await this.collection.findOne(
            {
                key,
            },
            {
                projection: {
                    _id: 0,
                    expiration: 1,
                    value: 1,
                },
            },
        );
        return this.getDocValue(document);
    }

    async getAndRemove(key: string): Promise<TType | null> {
        const document = await this.collection.findOneAndDelete(
            {
                key,
            },
            {
                projection: {
                    _id: 0,
                    expiration: 1,
                    value: 1,
                },
            },
        );
        return this.getDocValue(document);
    }

    private isDocExpired(document: MongodbCacheDocument | null): boolean {
        if (document === null) {
            return true;
        }
        const { expiration } = document;
        if (expiration === null) {
            return false;
        }
        const hasExpired = expiration.getTime() <= new Date().getTime();
        return hasExpired;
    }

    async add(
        key: string,
        value: TType,
        ttl: TimeSpan | null,
    ): Promise<boolean> {
        const hasExpirationQuery = {
            $ne: ["$expiration", null],
        };
        const hasExpiredQuery = {
            $lte: ["$expiration", new Date()],
        };
        const hasExpirationAndExpiredQuery = {
            $and: [hasExpirationQuery, hasExpiredQuery],
        };
        const serializedValue = this.serde.serialize(value);
        const document = await this.collection.findOneAndUpdate(
            {
                key,
            },
            [
                {
                    $set: {
                        value: {
                            $cond: {
                                if: hasExpirationAndExpiredQuery,
                                then: serializedValue,
                                else: "$value",
                            },
                        },
                        expiration: {
                            $cond: {
                                if: hasExpirationAndExpiredQuery,
                                then: ttl?.toEndDate() ?? null,
                                else: "$expiration",
                            },
                        },
                    },
                },
            ],
            {
                upsert: true,
                projection: {
                    _id: 0,
                    expiration: 1,
                },
            },
        );
        return this.isDocExpired(document);
    }

    async put(
        key: string,
        value: TType,
        ttl: TimeSpan | null,
    ): Promise<boolean> {
        const document = await this.collection.findOneAndUpdate(
            {
                key,
            },
            {
                $set: {
                    value: this.serde.serialize(value),
                    expiration: ttl?.toEndDate() ?? null,
                },
            },
            {
                upsert: true,
                projection: {
                    _id: 0,
                    expiration: 1,
                },
            },
        );
        return !this.isDocExpired(document);
    }

    async update(key: string, value: TType): Promise<boolean> {
        const updateResult = await this.collection.updateOne(
            MongodbCacheAdapter.filterUnexpiredKeys([key]),
            {
                $set: {
                    value: this.serde.serialize(value),
                },
            },
        );
        if (!updateResult.acknowledged) {
            throw new UnexpectedCacheError(
                "Mongodb update was not acknowledged",
            );
        }
        return updateResult.modifiedCount > 0;
    }

    async increment(key: string, value: number): Promise<boolean> {
        try {
            const updateResult = await this.collection.updateOne(
                MongodbCacheAdapter.filterUnexpiredKeys([key]),
                {
                    $inc: {
                        value,
                    } as Record<string, number>,
                },
            );
            if (!updateResult.acknowledged) {
                throw new UnexpectedCacheError(
                    "Mongodb update was not acknowledged",
                );
            }
            return updateResult.modifiedCount > 0;
        } catch (error: unknown) {
            if (MongodbCacheAdapter.isMongodbIncrementError(error)) {
                throw new TypeCacheError(
                    `Unable to increment or decrement none number type key "${key}"`,
                );
            }
            throw error;
        }
    }

    async removeMany(keys: string[]): Promise<boolean> {
        const deleteResult = await this.collection.deleteMany(
            MongodbCacheAdapter.filterUnexpiredKeys(keys),
        );
        if (!deleteResult.acknowledged) {
            throw new UnexpectedCacheError(
                "Mongodb deletion was not acknowledged",
            );
        }
        return deleteResult.deletedCount > 0;
    }

    async removeByKeyPrefix(prefix: string): Promise<void> {
        if (prefix === "") {
            const mongodbResult = await this.collection.deleteMany();
            if (!mongodbResult.acknowledged) {
                throw new UnexpectedCacheError(
                    "Mongodb deletion was not acknowledged",
                );
            }
            return;
        }
        const mongodbResult = await this.collection.deleteMany({
            key: {
                $regex: new RegExp(`^${escapeStringRegexp(prefix)}`),
            },
        });
        if (!mongodbResult.acknowledged) {
            throw new UnexpectedCacheError(
                "Mongodb deletion was not acknowledged",
            );
        }
    }
}
