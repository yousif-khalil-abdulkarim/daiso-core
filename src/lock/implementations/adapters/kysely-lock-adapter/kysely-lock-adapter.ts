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
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/adapters"`
 * @group Adapters
 */
type KyselyLockAdapterTable = {
    key: string;
    owner: string;
    // In ms since unix epoch
    expiresAt: number | string | null;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/adapters"`
 * @group Adapters
 */
type KyselyLockAdapterTables = {
    lock: KyselyLockAdapterTable;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/adapters"`
 * @group Adapters
 */
type KyselyLockAdapterSettings = {
    kysely: Kysely<KyselyLockAdapterTables>;
    expiredKeysRemovalInterval?: TimeSpan;
    shouldRemoveExpiredKeys?: boolean;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/adapters"`
 * @group Adapters
 */
export class KyselyLockAdapter
    implements IDatabaseLockAdapter, IDeinitizable, IInitizable, IPrunable
{
    private readonly kysely: Kysely<KyselyLockAdapterTables>;
    private readonly expiredKeysRemovalInterval: TimeSpan;
    private readonly shouldRemoveExpiredKeys: boolean;
    private timeoutId: string | number | NodeJS.Timeout | undefined;

    /**
     * @example
     * ```ts
     * import { KyselyLockAdapter } from "@daiso-tech/core/lock/adapters";
     * import Sqlite from "better-sqlite3";
     *
     * const lockAdapter = new KyselyLockAdapter({
     *   kysely: new Kysely({
     *     dialect: new SqliteDialect({
     *       database: new Sqlite("local.db"),
     *     }),
     *   }),
     * });
     * // You need initialize the adapter once before using it.
     * await lockAdapter.init();
     * ```
     */
    constructor(settings: KyselyLockAdapterSettings) {
        const {
            kysely,
            expiredKeysRemovalInterval = TimeSpan.fromMinutes(1),
            shouldRemoveExpiredKeys = true,
        } = settings;
        this.expiredKeysRemovalInterval = expiredKeysRemovalInterval;
        this.shouldRemoveExpiredKeys = shouldRemoveExpiredKeys;
        this.kysely = kysely;
    }

    async deInit(): Promise<void> {
        await this.kysely.schema
            .dropIndex("lock_expiresAt")
            .ifExists()
            .on("lock")
            .execute();
        await this.kysely.schema.dropTable("lock").ifExists().execute();
        if (this.shouldRemoveExpiredKeys) {
            clearTimeout(this.timeoutId);
        }
    }

    async init(): Promise<void> {
        // The method should not throw if the index already exists that why the try catch is used.
        try {
            await this.kysely.schema
                .createTable("lock")
                .ifNotExists()
                .addColumn("key", "varchar(255)", (col) => col.primaryKey())
                .addColumn("owner", "varchar(255)")
                .addColumn("expiresAt", "bigint")
                .execute();
            await this.kysely.schema
                .createIndex("lock_expiresAt")
                .on("lock")
                .columns(["expiresAt"])
                .execute();
            if (this.shouldRemoveExpiredKeys) {
                this.timeoutId = setTimeout(() => {
                    void this.removeAllExpired();
                }, this.expiredKeysRemovalInterval.toMilliseconds());
            }
        } catch {
            /* EMPTY */
        }
    }

    async removeAllExpired(): Promise<void> {
        await this.kysely
            .deleteFrom("lock")
            .where("lock.expiresAt", "<=", new Date().getTime())
            .execute();
    }

    async insert(
        key: string,
        owner: string,
        expiration: Date | null,
    ): Promise<void> {
        await this.kysely
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
        const updateResult = await this.kysely
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
        await this.kysely
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
        const updateResult = await this.kysely
            .updateTable("lock")
            .where("lock.key", "=", key)
            .where("lock.owner", "=", owner)
            .set({ expiresAt: expiration.getTime() })
            .executeTakeFirst();
        return Number(updateResult.numUpdatedRows); // > 0;
    }

    async find(key: string): Promise<ILockData | null> {
        const row = await this.kysely
            .selectFrom("lock")
            .where("lock.key", "=", key)
            .select(["lock.owner", "lock.expiresAt"])
            .executeTakeFirst();
        if (row === undefined) {
            return null;
        }
        return {
            expiration: row.expiresAt ? new Date(Number(row.expiresAt)) : null,
            owner: row.owner,
        };
    }
}
