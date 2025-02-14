/**
 * @module Lock
 */

import type { IDatabaseLockAdapter, ILockData } from "@/lock/contracts/_module";
import {
    type IDeinitizable,
    type IInitizable,
    TimeSpan,
} from "@/utilities/_module";
import { Kysely } from "kysely";
import { KyselyTableNameTransformerPlugin } from "@/utilities/_module";
import type { LibsqlDialectConfig } from "@libsql/kysely-libsql";
import { LibsqlDialect } from "@libsql/kysely-libsql";
import { KyselyLockAdapter } from "@/lock/implementations/adapters/kysely-lock-adapter/_module";
import type { Client } from "@libsql/client/.";

/**
 * @group Adapters
 */
export type LibsqlLockAdapterSettings = {
    database: Client;
    tableName?: string;
    expiredKeysRemovalInterval?: TimeSpan;
    shouldRemoveExpiredKeys?: boolean;
    rootGroup: string;
};

/**
 * To utilize the <i>LibsqlLockAdapter</i>, you must install the <i>"@libsql/client"</i> package.
 * @group Adapters
 */
export class LibsqlLockAdapter
    implements IDatabaseLockAdapter, IDeinitizable, IInitizable
{
    private databaseLockAdapter: KyselyLockAdapter;

    /***
     * @example
     * ```ts
     * import { LibsqlCacheAdapter } from "@daiso-tech/core";
     * import { createClient } from "@libsql/client";
     *
     * (async () => {
     *   const database = createClient({ url: "file:local.db" });
     *   const lockAdapter = new LibsqlCacheAdapter({
     *     database,
     *     rootGroup: "@global"
     *   });
     *   await lockAdapter.init();
     * })();
     * ```
     */
    constructor(settings: LibsqlLockAdapterSettings) {
        const {
            database,
            tableName = "lock",
            expiredKeysRemovalInterval = TimeSpan.fromMinutes(1),
            shouldRemoveExpiredKeys = true,
            rootGroup,
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
