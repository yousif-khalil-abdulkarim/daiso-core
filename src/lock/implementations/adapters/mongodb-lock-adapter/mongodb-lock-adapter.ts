/**
 * @module Lock
 */

import {
    type IDeinitizable,
    type IInitizable,
    simplifyOneOrMoreStr,
} from "@/utilities/_module-exports.js";
import type {
    IDatabaseLockAdapter,
    ILockData,
} from "@/lock/contracts/_module-exports.js";
import { UnexpectedLockError } from "@/lock/contracts/_module-exports.js";
import type { Collection, CollectionOptions, Db } from "mongodb";
import { ObjectId } from "mongodb";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/implementations/adapters"```
 * @group Adapters
 */
export type MongodbLockAdapterSettings = {
    database: Db;
    rootGroup: string;
    collectionName?: string;
    collectionSettings?: CollectionOptions;
};

/**
 * @internal
 */
type MongodbLockDocument = {
    _id: ObjectId;
    key: string;
    group: string;
    owner: string;
    expiresAt: Date | null;
};

/**
 * To utilize the <i>MongodbLockAdapter</i>, you must install the <i>"mongodb"</i> package.
 *
 * Note in order to use <i>MongodbLockAdapter</i> correctly, ensure you use a single, consistent database across all server instances.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/implementations/adapters"```
 * @group Adapters
 */
export class MongodbLockAdapter
    implements IDatabaseLockAdapter, IDeinitizable, IInitizable
{
    private readonly group: string;
    private readonly database: Db;
    private readonly collection: Collection<MongodbLockDocument>;
    private readonly collectionName: string;
    private readonly collectionSettings?: CollectionOptions;

    /**
     * @example
     * ```ts
     * import { MongodbLockAdapter } from "@daiso-tech/core/lock/implementations/adapters";
     * import { MongoClient } from "mongodb";
     *
     * (async () => {
     *   const client = await MongoClient.connect("YOUR_MONGODB_CONNECTION_STRING");
     *   const database = client.db("database");
     *   const lockAdapter = new MongodbLockAdapter({
     *     database,
     *     rootGroup: "@global"
     *   });
     *   await lockAdapter.init();
     * })();
     * ```
     */
    constructor({
        collectionName = "cache",
        collectionSettings,
        database,
        rootGroup,
    }: MongodbLockAdapterSettings) {
        this.collectionName = collectionName;
        this.database = database;
        this.collection = database.collection(
            collectionName,
            collectionSettings,
        );
        this.collectionSettings = collectionSettings;
        this.group = rootGroup;
    }

    async removeExpiredKeys(): Promise<void> {
        await this.collection.deleteMany({
            expiresAt: {
                $lte: new Date(),
            },
        });
    }

    /**
     * Creates all related indexes.
     * Note the <i>init</i> method needs to be called before using the adapter.
     */
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

    /**
     * Removes the collection where the cache values are stored and all it's related indexes.
     * Note all cache data will be removed.
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
            group: this.group,
            expiresAt: expiration,
        });
        if (!insertResult.acknowledged) {
            throw new UnexpectedLockError(
                "Mongodb insertion was not acknowledged",
            );
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
                group: this.group,

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
            throw new UnexpectedLockError(
                "Mongodb update was not acknowledged",
            );
        }
        return updateResult.modifiedCount; // > 0;
    }

    async remove(key: string, owner: string | null): Promise<void> {
        if (owner === null) {
            const deleteResult = await this.collection.deleteOne({
                key,
                group: this.group,
            });
            if (!deleteResult.acknowledged) {
                throw new UnexpectedLockError(
                    "Mongodb deletion was not acknowledged",
                );
            }
            return;
        }
        const deleteResult = await this.collection.deleteOne({
            key,
            group: this.group,
            owner,
        });
        if (!deleteResult.acknowledged) {
            throw new UnexpectedLockError(
                "Mongodb deletion was not acknowledged",
            );
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
                group: this.group,
                owner,
            },
            {
                $set: {
                    expiresAt: expiration,
                },
            },
        );
        if (!updateResult.acknowledged) {
            throw new UnexpectedLockError(
                "Mongodb update was not acknowledged",
            );
        }
        return updateResult.modifiedCount; // > 0;
    }

    async find(key: string): Promise<ILockData | null> {
        const document = await this.collection.findOne(
            {
                key: key,
                group: this.group,
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

    getGroup(): string {
        return this.group;
    }

    withGroup(group: string): IDatabaseLockAdapter {
        return new MongodbLockAdapter({
            database: this.database,
            collectionName: this.collectionName,
            collectionSettings: this.collectionSettings,
            rootGroup: simplifyOneOrMoreStr([this.group, group]),
        });
    }
}
