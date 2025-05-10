/**
 * @module Lock
 */

import type {
    IDatabaseLockAdapter,
    ILockData,
} from "@/lock/contracts/_module-exports.js";
import type { Kysely } from "kysely";
import {
    type IDeinitizable,
    type IInitizable,
    type IPrunable,
    TimeSpan,
} from "@/utilities/_module-exports.js";

/**
 * @internal
 */
type KyselyLockTable = {
    key: string;
    owner: string;
    // In ms since unix epoch
    expiresAt: number | null;
};

/**
 * @internal
 */
type KyselyTables = {
    lock: KyselyLockTable;
};

/**
 * @internal
 */
type KyselySettings = {
    database: Kysely<KyselyTables>;
    expiredKeysRemovalInterval?: TimeSpan;
    shouldRemoveExpiredKeys?: boolean;
};

/**
 * @internal
 */
export class KyselyLockAdapter
    implements IDatabaseLockAdapter, IDeinitizable, IInitizable, IPrunable
{
    private readonly database: Kysely<KyselyTables>;
    private readonly expiredKeysRemovalInterval: TimeSpan;
    private readonly shouldRemoveExpiredKeys: boolean;
    private timeoutId: string | number | NodeJS.Timeout | undefined;

    constructor(settings: KyselySettings) {
        const {
            database,
            expiredKeysRemovalInterval = TimeSpan.fromMinutes(1),
            shouldRemoveExpiredKeys = true,
        } = settings;
        this.expiredKeysRemovalInterval = expiredKeysRemovalInterval;
        this.shouldRemoveExpiredKeys = shouldRemoveExpiredKeys;
        this.database = database;
    }

    async deInit(): Promise<void> {
        await this.database.schema
            .dropIndex("lock_expiresAt")
            .ifExists()
            .on("lock")
            .execute();
        await this.database.schema.dropTable("lock").ifExists().execute();
        if (this.shouldRemoveExpiredKeys) {
            clearTimeout(this.timeoutId);
        }
    }

    async init(): Promise<void> {
        await this.database.schema
            .createTable("lock")
            .ifNotExists()
            .addColumn("key", "varchar(255)", (col) => col.primaryKey())
            .addColumn("owner", "varchar(255)")
            .addColumn("expiresAt", "bigint")
            .execute();
        await this.database.schema
            .createIndex("lock_expiresAt")
            .ifNotExists()
            .on("lock")
            .columns(["expiresAt"])
            .execute();
        if (this.shouldRemoveExpiredKeys) {
            this.timeoutId = setTimeout(() => {
                void this.removeAllExpired();
            }, this.expiredKeysRemovalInterval.toMilliseconds());
        }
    }

    async removeAllExpired(): Promise<void> {
        await this.database
            .deleteFrom("lock")
            .where("lock.expiresAt", "<=", new Date().getTime())
            .execute();
    }

    async insert(
        key: string,
        owner: string,
        expiration: Date | null,
    ): Promise<void> {
        await this.database
            .insertInto("lock")
            .values({
                key,
                owner,
                expiresAt: expiration?.getTime() ?? null,
            })
            .execute();
    }

    async update(
        key: string,
        owner: string,
        expiration: Date | null,
    ): Promise<number> {
        const updateResult = await this.database
            .updateTable("lock")
            .where("lock.key", "=", key)
            // Has expired
            .where((eb) =>
                eb.and([
                    eb("lock.expiresAt", "is not", null),
                    eb("lock.expiresAt", "<=", Date.now()),
                ]),
            )
            .set({ owner, expiresAt: expiration?.getTime() ?? null })
            .executeTakeFirst();
        return Number(updateResult.numUpdatedRows); // > 0;
    }

    async remove(key: string, owner: string | null): Promise<void> {
        await this.database
            .deleteFrom("lock")
            .where("lock.key", "=", key)
            .$if(owner !== null, (query) =>
                query.where("lock.owner", "=", owner),
            )
            .execute();
    }

    async refresh(
        key: string,
        owner: string,
        expiration: Date,
    ): Promise<number> {
        const updateResult = await this.database
            .updateTable("lock")
            .where("lock.key", "=", key)
            .where("lock.owner", "=", owner)
            .set({ expiresAt: expiration.getTime() })
            .executeTakeFirst();
        return Number(updateResult.numUpdatedRows); // > 0;
    }

    async find(key: string): Promise<ILockData | null> {
        const row = await this.database
            .selectFrom("lock")
            .where("lock.key", "=", key)
            .select(["lock.owner", "lock.expiresAt"])
            .executeTakeFirst();
        if (row === undefined) {
            return null;
        }
        return {
            expiration: row.expiresAt ? new Date(row.expiresAt) : null,
            owner: row.owner,
        };
    }
}
