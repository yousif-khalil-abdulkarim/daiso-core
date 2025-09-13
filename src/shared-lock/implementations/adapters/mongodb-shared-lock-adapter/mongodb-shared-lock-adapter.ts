/**
 * @module SharedLock
 */

import type { TimeSpan } from "@/utilities/_module-exports.js";
import {
    type IDeinitizable,
    type IInitizable,
} from "@/utilities/_module-exports.js";
import type {
    ISharedLockAdapter,
    ISharedLockAdapterState,
    SharedLockAcquireSettings,
} from "@/shared-lock/contracts/_module-exports.js";
import type { Collection, CollectionOptions, Db } from "mongodb";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/adapters"`
 * @group Adapters
 */
export type MongodbSharedLockAdapterSettings = {
    database: Db;
    /**
     * @default "lock"
     */
    collectionName?: string;
    collectionSettings?: CollectionOptions;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/adapters"`
 * @group Adapters
 */
export type MongodbSharedLockDocument = {};

/**
 * To utilize the `MongodbSharedLockAdapter`, you must install the [`"mongodb"`](https://www.npmjs.com/package/mongodb) package.
 *
 * Note in order to use `MongodbSharedLockAdapter` correctly, ensure you use a single, consistent database across all server instances.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/adapters"`
 * @group Adapters
 */
export class MongodbSharedLockAdapter
    implements ISharedLockAdapter, IDeinitizable, IInitizable
{
    private readonly database: Db;
    private readonly collection: Collection<MongodbSharedLockDocument>;
    private readonly collectionName: string;

    /**
     * @example
     * ```ts
     * import { MongodbSharedLockAdapter } from "@daiso-tech/core/shared-lock/adapters";
     * import { MongoClient } from "mongodb";
     *
     * const client = await MongoClient.connect("YOUR_MONGODB_CONNECTION_STRING");
     * const database = client.db("database");
     * const lockAdapter = new MongodbSharedLockAdapter({
     *   database
     * });
     * // You need initialize the adapter once before using it.
     * await lockAdapter.init()
     * ```
     */
    constructor(settings: MongodbSharedLockAdapterSettings) {
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

    init(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    deInit(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    acquireWriter(
        key: string,
        lockId: string,
        ttl: TimeSpan | null,
    ): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    releaseWriter(key: string, lockId: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    forceReleaseWriter(key: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    refreshWriter(
        key: string,
        lockId: string,
        ttl: TimeSpan,
    ): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    acquireReader(settings: SharedLockAcquireSettings): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    releaseReader(key: string, slotId: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    forceReleaseAllReaders(key: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    refreshReader(
        key: string,
        slotId: string,
        ttl: TimeSpan,
    ): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    forceRelease(key: string, slotId: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    getState(key: string): Promise<ISharedLockAdapterState | null> {
        throw new Error("Method not implemented.");
    }
}
