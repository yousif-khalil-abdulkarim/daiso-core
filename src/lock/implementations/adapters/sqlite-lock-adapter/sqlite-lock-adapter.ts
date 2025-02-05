/**
 * @module Lock
 */

import type { IDatabaseLockAdapter, ILockData } from "@/lock/contracts/_module";
import { TimeSpan } from "@/utilities/_module";
import { KyselyLockAdapter } from "@/lock/implementations/adapters/kysely-lock-adapter/_module";
import type { SqliteDatabase } from "kysely";
import { Kysely, SqliteDialect } from "kysely";
import { KyselyTableNameTransformerPlugin } from "@/utilities/_module";

/**
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
 * @group Adapters
 */
export class SqliteLockAdapter implements IDatabaseLockAdapter {
    private databaseLockAdapter: KyselyLockAdapter;

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

    async deInit(): Promise<void> {
        await this.databaseLockAdapter.deInit();
    }

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
