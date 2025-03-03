/**
 * @module Lock
 */

import type {
    IDatabaseLockAdapter,
    ILockData,
} from "@/new-lock/contracts/_module-exports.js";
import {
    type IDeinitizable,
    type IInitizable,
    TimeSpan,
} from "@/utilities/_module-exports.js";
import { KyselyLockAdapter } from "@/new-lock/implementations/adapters/kysely-lock-adapter/_module.js";
import type { SqliteDatabase } from "kysely";
import { Kysely, SqliteDialect } from "kysely";
import { KyselyTableNameTransformerPlugin } from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/implementations/adapters"```
 * @group Adapters
 */
export type SqliteLockAdapterSettings = {
    database: SqliteDatabase;
    tableName?: string;
    expiredKeysRemovalInterval?: TimeSpan;
    shouldRemoveExpiredKeys?: boolean;
    rootGroup: string;
};

/**
 * To utilize the <i>SqliteLockAdapter</i>, you must install the <i>"better-sqlite3"</i> and <i>"@types/better-sqlite3"</i> packages.
 *
 * Note the <i>SqliteLockAdapter</i> is limited to single server usage and cannot be shared across multiple servers but it can be shared between different processes.
 * To use it correctly, ensure all process instances access the same consistent, persisted database.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/implementations/adapters"```
 * @group Adapters
 */
export class SqliteLockAdapter
    implements IDatabaseLockAdapter, IDeinitizable, IInitizable
{
    private databaseLockAdapter: KyselyLockAdapter;

    /**
     * @example
     * ```ts
     * import { SqliteLockAdapter } from "@daiso-tech/core/lock/implementations/adapters";
     * import Sqlite from "better-sqlite3";
     *
     * (async () => {
     *   const database = new Sqlite("local.db");
     *   const lockAdapter = new SqliteLockAdapter({
     *     database,
     *     rootGroup: "@global"
     *   });
     *   await lockAdapter.init();
     * })();
     * ```
     */
    constructor(settings: SqliteLockAdapterSettings) {
        const {
            database,
            tableName = "lock",
            shouldRemoveExpiredKeys = true,
            expiredKeysRemovalInterval = TimeSpan.fromMinutes(1),
            rootGroup,
        } = settings;

        this.databaseLockAdapter = new KyselyLockAdapter({
            database: new Kysely({
                dialect: new SqliteDialect({
                    database: database,
                }),
                plugins: [
                    new KyselyTableNameTransformerPlugin({
                        lock: tableName,
                    }),
                ],
            }),
            rootGroup,
            expiredKeysRemovalInterval,
            shouldRemoveExpiredKeys,
        });
    }

    async removeExpiredKeys(): Promise<void> {
        await this.databaseLockAdapter.removeExpiredKeys();
    }

    /**
     * Removes the table where the cache values are stored and removes the table indexes.
     * Note all cache data will be removed.
     */
    async deInit(): Promise<void> {
        await this.databaseLockAdapter.deInit();
    }

    /**
     * Creates the table where the cache values are stored and it's related indexes.
     * Note the <i>init</i> method needs to be called before using the adapter.
     */
    async init(): Promise<void> {
        await this.databaseLockAdapter.init();
    }

    async insert(
        key: string,
        owner: string,
        expiration: Date | null,
    ): Promise<void> {
        await this.databaseLockAdapter.insert(key, owner, expiration);
    }

    async update(
        key: string,
        owner: string,
        expiration: Date | null,
    ): Promise<number> {
        return await this.databaseLockAdapter.update(key, owner, expiration);
    }

    async remove(key: string, owner: string | null): Promise<void> {
        await this.databaseLockAdapter.remove(key, owner);
    }

    async refresh(
        key: string,
        owner: string,
        expiration: Date,
    ): Promise<number> {
        return await this.databaseLockAdapter.refresh(key, owner, expiration);
    }

    async find(key: string): Promise<ILockData | null> {
        return await this.databaseLockAdapter.find(key);
    }

    getGroup(): string {
        return this.databaseLockAdapter.getGroup();
    }

    withGroup(group: string): IDatabaseLockAdapter {
        return this.databaseLockAdapter.withGroup(group);
    }
}
