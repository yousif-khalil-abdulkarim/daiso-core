/**
 * @module Lock
 */

import type {
    IDatabaseLockAdapter,
    ILockData,
} from "@/lock/contracts/_module-exports.js";
import {
    type IDeinitizable,
    type IInitizable,
    type IPrunable,
    TimeSpan,
} from "@/utilities/_module-exports.js";
import { Kysely } from "kysely";
import { KyselyTableNameTransformerPlugin } from "@/utilities/_module-exports.js";
import type { LibsqlDialectConfig } from "@libsql/kysely-libsql";
import { LibsqlDialect } from "@libsql/kysely-libsql";
import { KyselyLockAdapter } from "@/lock/implementations/adapters/kysely-lock-adapter/_module.js";
import type { Client } from "@libsql/client";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/adapters"`
 * @group Adapters
 */
export type LibsqlLockAdapterSettings = {
    database: Client;
    tableName?: string;
    expiredKeysRemovalInterval?: TimeSpan;
    shouldRemoveExpiredKeys?: boolean;
};

/**
 * To utilize the `LibsqlLockAdapter`, you must install the `"@libsql/client"` package.
 *
 * Note in order to use `LibsqlLockAdapter` correctly, ensure you use a single, consistent database across all server instances.
 * This means you can't use libsql embedded replicas.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/adapters"`
 * @group Adapters
 */
export class LibsqlLockAdapter
    implements IDatabaseLockAdapter, IDeinitizable, IInitizable, IPrunable
{
    private databaseLockAdapter: KyselyLockAdapter;

    /***
     * @example
     * ```ts
     * import { LibsqlLockAdapter } from "@daiso-tech/core/lock/adapters";
     * import { createClient } from "@libsql/client";
     *
     * const database = createClient({ url: "file:local.db" });
     * const lockAdapter = new LibsqlLockAdapter({
     *     database,
     * });
     * // You need initialize the adapter once before using it.
     * await lockAdapter.init();
     * ```
     */
    constructor(settings: LibsqlLockAdapterSettings) {
        const {
            database,
            tableName = "lock",
            expiredKeysRemovalInterval = TimeSpan.fromMinutes(1),
            shouldRemoveExpiredKeys = true,
        } = settings;

        this.databaseLockAdapter = new KyselyLockAdapter({
            database: new Kysely({
                dialect: new LibsqlDialect({
                    client: database,
                } as LibsqlDialectConfig),
                plugins: [
                    new KyselyTableNameTransformerPlugin({
                        lock: tableName,
                    }),
                ],
            }),
            expiredKeysRemovalInterval,
            shouldRemoveExpiredKeys,
        });
    }

    async removeAllExpired(): Promise<void> {
        await this.databaseLockAdapter.removeAllExpired();
    }

    /**
     * Removes the table where the lock keys are stored and removes the table indexes.
     * Note all lock data will be removed.
     */
    async deInit(): Promise<void> {
        await this.databaseLockAdapter.deInit();
    }

    /**
     * Creates the table where the lock keys are stored and it's related indexes.
     * Note the `init` method needs to be called before using the adapter.
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
}
