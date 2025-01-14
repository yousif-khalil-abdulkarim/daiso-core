/**
 * @module Cache
 */

import {
    TypeCacheError,
    UnexpectedCacheError,
} from "@/cache/contracts/cache.errors";
import { type ICacheAdapter } from "@/cache/contracts/cache-adapter.contract";
import type { TimeSpan } from "@/utilities/_module";
import type { IInitizable } from "@/_shared/types";
import type { ObjectId } from "mongodb";
import { MongoServerError, type Collection } from "mongodb";
import type { ISerializer } from "@/serializer/contracts/_module";
import {
    SuperJsonSerializer,
    MongodbSerializer,
} from "@/serializer/implementations/_module";
import escapeStringRegexp from "escape-string-regexp";

/**
 * @group Adapters
 */
export type MongodbCacheDocument = {
    _id: ObjectId;
    key: string;
    value: number | string;
    expiresAt: Date | null;
};

/**
 * @group Adapters
 */
export type MongodbCacheAdapterSettings = {
    serializer?: ISerializer<string>;
};

/**
 * @group Adapters
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

    private serializer: ISerializer<string | number>;

    constructor(
        private readonly collection: Collection<MongodbCacheDocument>,
        {
            serializer = new SuperJsonSerializer(),
        }: MongodbCacheAdapterSettings = {},
    ) {
        this.serializer = new MongodbSerializer(serializer);
    }

    async init(): Promise<void> {
        await this.collection.createIndex("key", {
            unique: true,
        });
        await this.collection.createIndex("expiresAt", {
            expireAfterSeconds: 0,
        });
    }

    async get(key: string): Promise<TType | null> {
        const document = await this.collection.findOne(
            { key },
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
            return await this.serializer.deserialize(value);
        }
        const hasExpired = expiresAt.getTime() <= new Date().getTime();
        if (hasExpired) {
            return null;
        }
        return await this.serializer.deserialize(value);
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
        const serializedValue = await this.serializer.serialize(value);
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
                $or: [
                    hasNoExpiration,
                    {
                        $and: [hasExpiration, hasNotExpired],
                    },
                ],
            },
            {
                $set: {
                    value: await this.serializer.serialize(value),
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
            },
            {
                $set: {
                    value: await this.serializer.serialize(value),
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

    async clear(prefix: string): Promise<void> {
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
