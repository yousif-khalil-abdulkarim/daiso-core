/**
 * @module Cache
 */

import {
    TypeCacheError,
    UnexpectedCacheError,
} from "@/cache/contracts/cache.errors";
import { type ICacheAdapter } from "@/cache/contracts/cache-adapter.contract";
import {
    type TimeSpan,
    type IInitizable,
    type OneOrMore,
    simplifyGroupName,
} from "@/utilities/_module";
import type { ObjectId } from "mongodb";
import { MongoServerError, type Collection } from "mongodb";
import type { ISerde } from "@/serde/contracts/_module";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { SuperJsonSerde } from "@/serde/implementations/_module";
import { MongodbSerde } from "@/serde/implementations/_module";

/**
 * @group Adapters
 */
export type MongodbCacheDocument = {
    _id: ObjectId;
    key: string;
    group: string;
    value: number | string;
    expiresAt: Date | null;
};

/**
 * @group Adapters
 */
export type MongodbCacheAdapterSettings = {
    serde: ISerde<string>;
    rootGroup: OneOrMore<string>;
};

/**
 * tis kl 9
 * To utilize the <i>MongodbCacheAdapter</i>, you must install the <i>"mongodb"</i> package and supply a <i>{@link ISerde | string serde}</i>, such as <i>{@link SuperJsonSerde}</i>.
 * @group Adapters
 * @example
 * ```ts
 * import { MongodbCacheAdapter, SuperJsonSerde } from "@daiso-tech/core";
 * import { MongoClient } from "mongodb";
 *
 * const client = new MongoClient("YOUR_MONGODB_CONNECTION_STRING");
 * const database = client.db("database");
 * const cacheCollection = database.collection("cache");
 * const serde = new SuperJsonSerde();
 * const cacheAdapter = new MongodbCacheAdapter(cacheCollection, {
 *   serde,
 *   rootGroup: "@global"
 * });
 *
 * (async () => {
 *   // You only need to call it once before using the adapter.
 *   await cacheAdapter.init();
 *   await cacheAdapter.add("a", 1);
 * })();
 * ```
 */
export class MongodbCacheAdapter<TType>
    implements ICacheAdapter<TType>, IInitizable
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

    private readonly mongodbSerde: ISerde<string | number>;
    private readonly group: string;
    private readonly baseSerde: ISerde<string>;

    constructor(
        private readonly collection: Collection<MongodbCacheDocument>,
        { serde, rootGroup }: MongodbCacheAdapterSettings,
    ) {
        this.baseSerde = serde;
        this.group = simplifyGroupName(rootGroup);
        this.mongodbSerde = new MongodbSerde(this.baseSerde);
    }

    getGroup(): string {
        return this.group;
    }

    withGroup(group: OneOrMore<string>): ICacheAdapter<TType> {
        return new MongodbCacheAdapter(this.collection, {
            serde: this.baseSerde,
            rootGroup: [this.group, simplifyGroupName(group)],
        });
    }

    async init(): Promise<void> {
        await this.collection.createIndex(
            {
                key: 1,
                group: 1,
            },
            {
                unique: true,
            },
        );
        await this.collection.createIndex("expiresAt", {
            expireAfterSeconds: 0,
        });
    }

    async exists(key: string): Promise<boolean> {
        const document = await this.collection.findOne(
            {
                key,
                group: this.group,
            },
            {
                projection: {
                    _id: 0,
                    expiresAt: 1,
                },
            },
        );
        if (document === null) {
            return false;
        }
        const { expiresAt } = document;
        if (expiresAt === null) {
            return true;
        }
        const hasExpired = expiresAt.getTime() <= new Date().getTime();
        if (hasExpired) {
            return false;
        }
        return true;
    }

    async get(key: string): Promise<TType | null> {
        const document = await this.collection.findOne(
            {
                key,
                group: this.group,
            },
            {
                projection: {
                    _id: 0,
                    expiresAt: 1,
                    value: 1,
                },
            },
        );
        if (document === null) {
            return null;
        }
        const { expiresAt, value } = document;
        if (expiresAt === null) {
            return await this.mongodbSerde.deserialize(value);
        }
        const hasExpired = expiresAt.getTime() <= new Date().getTime();
        if (hasExpired) {
            return null;
        }
        return await this.mongodbSerde.deserialize(value);
    }

    async add(
        key: string,
        value: TType,
        ttl: TimeSpan | null,
    ): Promise<boolean> {
        const hasExpirationQuery = {
            $ne: ["$expiresAt", null],
        };
        const hasExpiredQuery = {
            $lte: ["$expiresAt", new Date()],
        };
        const hasExpirationAndExpiredQuery = {
            $and: [hasExpirationQuery, hasExpiredQuery],
        };
        const serializedValue = this.mongodbSerde.serialize(value);
        const document = await this.collection.findOneAndUpdate(
            {
                key,
                group: this.group,
            },
            [
                {
                    $set: {
                        group: this.group,
                        value: {
                            $cond: {
                                if: hasExpirationAndExpiredQuery,
                                then: serializedValue,
                                else: "$value",
                            },
                        },
                        expiresAt: {
                            $cond: {
                                if: hasExpirationAndExpiredQuery,
                                then: ttl?.toEndDate() ?? null,
                                else: "$expiresAt",
                            },
                        },
                    },
                },
            ],
            {
                upsert: true,
                projection: {
                    _id: 0,
                    expiresAt: 1,
                },
            },
        );
        if (document === null) {
            return true;
        }
        const { expiresAt } = document;
        if (expiresAt === null) {
            return false;
        }
        const hasExpired = expiresAt.getTime() <= new Date().getTime();
        return hasExpired;
    }

    async update(key: string, value: TType): Promise<boolean> {
        const hasNoExpiration = {
            expiresAt: {
                $eq: null,
            },
        };
        const hasExpiration = {
            expiresAt: {
                $ne: null,
            },
        };
        const hasNotExpired = {
            expiresAt: {
                $lte: new Date(),
            },
        };
        const document = await this.collection.findOneAndUpdate(
            {
                key,
                group: this.group,
                $or: [
                    hasNoExpiration,
                    {
                        $and: [hasExpiration, hasNotExpired],
                    },
                ],
            },
            {
                $set: {
                    value: this.mongodbSerde.serialize(value),
                },
            },
            {
                projection: {
                    _id: 0,
                    expiresAt: 1,
                },
            },
        );
        if (document === null) {
            return false;
        }
        const { expiresAt } = document;
        if (expiresAt === null) {
            return true;
        }
        const hasExpired = expiresAt.getTime() <= new Date().getTime();
        return !hasExpired;
    }

    async put(
        key: string,
        value: TType,
        ttl: TimeSpan | null,
    ): Promise<boolean> {
        const document = await this.collection.findOneAndUpdate(
            {
                key,
                group: this.group,
            },
            {
                $set: {
                    group: this.group,
                    value: this.mongodbSerde.serialize(value),
                    expiresAt: ttl?.toEndDate() ?? null,
                },
            },
            {
                upsert: true,
                projection: {
                    _id: 0,
                    expiresAt: 1,
                },
            },
        );
        if (document === null) {
            return false;
        }
        const { expiresAt } = document;
        if (expiresAt === null) {
            return true;
        }
        const hasExpired = expiresAt.getTime() <= new Date().getTime();
        return !hasExpired;
    }

    async remove(key: string): Promise<boolean> {
        const document = await this.collection.findOneAndDelete(
            {
                key,
                group: this.group,
            },
            {
                projection: {
                    _id: 0,
                    expiresAt: 1,
                },
            },
        );
        if (document === null) {
            return false;
        }
        const { expiresAt } = document;
        if (expiresAt === null) {
            return true;
        }
        const hasExpired = expiresAt.getTime() <= new Date().getTime();
        return !hasExpired;
    }

    async increment(key: string, value: number): Promise<boolean> {
        try {
            const hasNoExpiration = {
                expiresAt: {
                    $eq: null,
                },
            };
            const hasExpiration = {
                expiresAt: {
                    $ne: null,
                },
            };
            const hasNotExpired = {
                expiresAt: {
                    $lte: new Date(),
                },
            };
            const document = await this.collection.findOneAndUpdate(
                {
                    key,
                    group: this.group,
                    $or: [
                        hasNoExpiration,
                        {
                            $and: [hasExpiration, hasNotExpired],
                        },
                    ],
                },
                {
                    $inc: {
                        value,
                    } as Record<string, number>,
                },
                {
                    projection: {
                        _id: 0,
                        expiresAt: 1,
                    },
                },
            );
            if (document === null) {
                return false;
            }
            const { expiresAt } = document;
            if (expiresAt === null) {
                return true;
            }
            const hasExpired = expiresAt.getTime() <= new Date().getTime();
            return !hasExpired;
        } catch (error: unknown) {
            if (MongodbCacheAdapter.isMongodbIncrementError(error)) {
                throw new TypeCacheError(
                    `Unable to increment or decrement none number type key "${key}"`,
                );
            }
            throw error;
        }
    }

    async clear(): Promise<void> {
        const mongodbResult = await this.collection.deleteMany({
            group: this.group,
        });
        if (!mongodbResult.acknowledged) {
            throw new UnexpectedCacheError(
                "Mongodb deletion was not acknowledged",
            );
        }
    }
}
