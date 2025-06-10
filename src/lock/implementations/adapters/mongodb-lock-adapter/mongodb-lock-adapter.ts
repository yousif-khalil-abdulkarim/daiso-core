/**
 * @module Lock
 */

import {
    UnexpectedError,
    type IDeinitizable,
    type IInitizable,
    type IPrunable,
} from "@/utilities/_module-exports.js";
import type {
    IDatabaseLockAdapter,
    ILockData,
} from "@/lock/contracts/_module-exports.js";
import type { Collection, CollectionOptions, Db } from "mongodb";
import { ObjectId } from "mongodb";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/adapters"`
 * @group Adapters
 */
export type MongodbLockAdapterSettings = {
    database: Db;
    /**
     * @default {"lock"}
     */
    collectionName?: string;
    collectionSettings?: CollectionOptions;
};

/**
 * @internal
 */
type MongodbLockDocument = {
    _id: ObjectId;
    key: string;
    owner: string;
    expiresAt: Date | null;
};

/**
 * To utilize the `MongodbLockAdapter`, you must install the `"mongodb"` package.
 *
 * Note in order to use `MongodbLockAdapter` correctly, ensure you use a single, consistent database across all server instances.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/adapters"`
 * @group Adapters
 */
export class MongodbLockAdapter
    implements IDatabaseLockAdapter, IDeinitizable, IInitizable, IPrunable
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
    constructor({
        collectionName = "lock",
        collectionSettings,
        database,
    }: MongodbLockAdapterSettings) {
        this.collectionName = collectionName;
        this.database = database;
        this.collection = database.collection(
            collectionName,
            collectionSettings,
        );
    }

    async removeAllExpired(): Promise<void> {
        await this.collection.deleteMany({
            expiresAt: {
                $lte: new Date(),
            },
        });
    }

    /**
     * Creates all related indexes.
     * Note the `init` method needs to be called before using the adapter.
     */
    async init(): Promise<void> {
        await this.collection.createIndex(
            {
                key: 1,
            },
            {
                unique: true,
            },
        );
        await this.collection.createIndex("expiresAt", {
            expireAfterSeconds: 0,
        });
    }

    /**
     * Removes the collection where the lock keys are stored and all it's related indexes.
     * Note all lock data will be removed.
     */
    async deInit(): Promise<void> {
        await this.collection.dropIndexes();
        await this.database.dropCollection(this.collectionName);
    }

    async insert(
        key: string,
        owner: string,
        expiration: Date | null,
    ): Promise<void> {
        const insertResult = await this.collection.insertOne({
            _id: new ObjectId(),
            key,
            owner,
            expiresAt: expiration,
        });
        if (!insertResult.acknowledged) {
            throw new UnexpectedError("Mongodb insertion was not acknowledged");
        }
    }

    async update(
        key: string,
        owner: string,
        expiration: Date | null,
    ): Promise<number> {
        const updateResult = await this.collection.updateOne(
            {
                key,

                $and: [
                    {
                        expiresAt: {
                            $ne: null,
                        },
                    },
                    {
                        expiresAt: {
                            $lte: new Date(),
                        },
                    },
                ],
            },
            {
                $set: {
                    owner,
                    expiresAt: expiration,
                },
            },
        );
        if (!updateResult.acknowledged) {
            throw new UnexpectedError("Mongodb update was not acknowledged");
        }
        return updateResult.modifiedCount; // > 0;
    }

    async remove(key: string, owner: string | null): Promise<void> {
        if (owner === null) {
            const deleteResult = await this.collection.deleteOne({
                key,
            });
            if (!deleteResult.acknowledged) {
                throw new UnexpectedError(
                    "Mongodb deletion was not acknowledged",
                );
            }
            return;
        }
        const deleteResult = await this.collection.deleteOne({
            key,
            owner,
        });
        if (!deleteResult.acknowledged) {
            throw new UnexpectedError("Mongodb deletion was not acknowledged");
        }
    }

    async refresh(
        key: string,
        owner: string,
        expiration: Date,
    ): Promise<number> {
        const updateResult = await this.collection.updateOne(
            {
                key,
                owner,
            },
            {
                $set: {
                    expiresAt: expiration,
                },
            },
        );
        if (!updateResult.acknowledged) {
            throw new UnexpectedError("Mongodb update was not acknowledged");
        }
        return updateResult.modifiedCount; // > 0;
    }

    async find(key: string): Promise<ILockData | null> {
        const document = await this.collection.findOne(
            {
                key: key,
            },
            {
                projection: {
                    _id: 0,
                    owner: 1,
                    expiresAt: 1,
                },
            },
        );
        if (document === null) {
            return null;
        }
        return {
            owner: document.owner,
            expiration: document.expiresAt,
        };
    }
}
