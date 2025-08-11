/**
 * @module Lock
 */

import type { TimeSpan } from "@/utilities/_module-exports.js";
import {
    type IDeinitizable,
    type IInitizable,
} from "@/utilities/_module-exports.js";
import {
    LOCK_REFRESH_RESULT,
    type ILockAdapter,
    type LockRefreshResult,
} from "@/lock/contracts/_module-exports.js";
import type { Collection, CollectionOptions, Db } from "mongodb";
import type { ObjectId } from "mongodb";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/adapters"`
 * @group Adapters
 */
export type MongodbLockAdapterSettings = {
    database: Db;
    /**
     * @default "lock"
     */
    collectionName?: string;
    collectionSettings?: CollectionOptions;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/adapters"`
 * @group Adapters
 */
export type MongodbLockDocument = {
    _id: ObjectId;
    key: string;
    owner: string;
    expiration: Date | null;
};

/**
 * To utilize the `MongodbLockAdapter`, you must install the [`"mongodb"`](https://www.npmjs.com/package/mongodb) package.
 *
 * Note in order to use `MongodbLockAdapter` correctly, ensure you use a single, consistent database across all server instances.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/adapters"`
 * @group Adapters
 */
export class MongodbLockAdapter
    implements ILockAdapter, IDeinitizable, IInitizable
{
    private readonly database: Db;
    private readonly collection: Collection<MongodbLockDocument>;
    private readonly collectionName: string;

    /**
     * @example
     * ```ts
     * import { MongodbLockAdapter } from "@daiso-tech/core/lock/adapters";
     * import { MongoClient } from "mongodb";
     *
     * const client = await MongoClient.connect("YOUR_MONGODB_CONNECTION_STRING");
     * const database = client.db("database");
     * const lockAdapter = new MongodbLockAdapter({
     *   database
     * });
     * // You need initialize the adapter once before using it.
     * await lockAdapter.init()
     * ```
     */
    constructor(settings: MongodbLockAdapterSettings) {
        const {
            collectionName = "lock",
            collectionSettings,
            database,
        } = settings;
        this.collectionName = collectionName;
        this.database = database;
        this.collection = database.collection(
            collectionName,
            collectionSettings,
        );
    }

    /**
     * Creates all related indexes.
     * Note the `init` method needs to be called before using the adapter.
     */
    async init(): Promise<void> {
        // Should throw if the index already exists thats why the try catch is used.
        try {
            await this.collection.createIndex(
                {
                    key: 1,
                },
                {
                    unique: true,
                },
            );
        } catch {
            /* EMPTY */
        }

        // Should throw if the index already exists thats why the try catch is used.
        try {
            await this.collection.createIndex("expiration", {
                expireAfterSeconds: 0,
            });
        } catch {
            /* EMPTY */
        }
    }

    /**
     * Removes the collection where the lock keys are stored and all it's related indexes.
     * Note all lock data will be removed.
     */
    async deInit(): Promise<void> {
        // Should throw if the collection already does not exists thats why the try catch is used.
        try {
            await this.collection.dropIndexes();
        } catch {
            /* EMPTY */
        }

        // Should throw if the collection already does not exists thats why the try catch is used.
        try {
            await this.database.dropCollection(this.collectionName);
        } catch {
            /* EMPTY */
        }
    }

    async acquire(
        key: string,
        owner: string,
        ttl: TimeSpan | null,
    ): Promise<boolean> {
        const expiration = ttl?.toEndDate() ?? null;
        const isExpiredQuery = {
            $and: [
                {
                    $ne: ["$expiration", null],
                },
                {
                    $lte: ["$expiration", new Date()],
                },
            ],
        };
        const lockData = await this.collection.findOneAndUpdate(
            {
                key,
            },
            [
                {
                    $set: {
                        key,
                        owner: {
                            $ifNull: ["$owner", owner],
                        },
                        expiration: {
                            $ifNull: ["$expiration", expiration],
                        },
                    },
                },
                {
                    $set: {
                        owner: {
                            $cond: {
                                if: isExpiredQuery,
                                then: owner,
                                else: "$owner",
                            },
                        },
                        expiration: {
                            $cond: {
                                if: isExpiredQuery,
                                then: expiration,
                                else: "$expiration",
                            },
                        },
                    },
                },
            ],
            {
                upsert: true,
            },
        );
        if (lockData === null) {
            return true;
        }
        if (lockData.expiration === null) {
            return false;
        }
        return lockData.expiration <= new Date();
    }

    async release(key: string, owner: string): Promise<boolean> {
        const isUnexpirableQuery = {
            expiration: {
                $eq: null,
            },
        };
        const isUnexpiredQuery = {
            expiration: {
                $gt: new Date(),
            },
        };
        const lockData = await this.collection.findOneAndDelete({
            key,
            owner,
            $or: [isUnexpirableQuery, isUnexpiredQuery],
        });

        if (lockData === null) {
            return false;
        }

        const { expiration } = lockData;
        const hasNoExpiration = expiration === null;
        if (hasNoExpiration) {
            return true;
        }

        const { owner: currentOwner } = lockData;
        const isNotExpired = expiration > new Date();
        const isCurrentOwner = owner === currentOwner;
        return isNotExpired && isCurrentOwner;
    }

    async forceRelease(key: string): Promise<boolean> {
        const lockData = await this.collection.findOneAndDelete({ key });
        if (lockData === null) {
            return false;
        }
        if (lockData.expiration === null) {
            return true;
        }
        const isNotExpired = lockData.expiration >= new Date();
        return isNotExpired;
    }

    async refresh(
        key: string,
        owner: string,
        ttl: TimeSpan,
    ): Promise<LockRefreshResult> {
        const isUnexpiredQuery = {
            $and: [
                {
                    $ne: ["$expiration", null],
                },
                {
                    $gt: ["$expiration", new Date()],
                },
            ],
        };

        const lockData = await this.collection.findOneAndUpdate(
            {
                key,
            },
            [
                {
                    $set: {
                        expiration: {
                            $cond: {
                                if: isUnexpiredQuery,
                                then: ttl.toEndDate(),
                                else: "$expiration",
                            },
                        },
                    },
                },
            ],
        );

        if (lockData === null) {
            return LOCK_REFRESH_RESULT.UNOWNED_REFRESH;
        }

        if (lockData.owner !== owner) {
            return LOCK_REFRESH_RESULT.UNOWNED_REFRESH;
        }

        if (lockData.expiration === null) {
            return LOCK_REFRESH_RESULT.UNEXPIRABLE_KEY;
        }

        if (lockData.expiration <= new Date()) {
            return LOCK_REFRESH_RESULT.UNOWNED_REFRESH;
        }

        return LOCK_REFRESH_RESULT.REFRESHED;
    }
}
