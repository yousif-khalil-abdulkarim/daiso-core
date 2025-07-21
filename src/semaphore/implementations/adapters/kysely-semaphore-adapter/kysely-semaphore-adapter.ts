/**
 * @module Semaphore
 */

import type {
    DatabaseSemaphoreInsertSlotSettings,
    IDatabaseSemaphoreAdapter,
} from "@/semaphore/contracts/_module-exports.js";
import {
    TimeSpan,
    type IDeinitizable,
    type IInitizable,
    type IPrunable,
} from "@/utilities/_module-exports.js";
import { type ExpressionBuilder, type Kysely } from "kysely";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/adapters"`
 * @group Adapters
 */
export type KyselySemaphoreAdapterTable = {
    key: string;
    limit: number;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/adapters"`
 * @group Adapters
 */
export type KyselySemaphoreSlotAdapterTable = {
    id: string;
    key: string;
    // In ms since unix epoch
    // The type in mysql is bigint and will be returned as a string
    expiration: number | string | null;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/adapters"`
 * @group Adapters
 */
export type KyselySemaphoreAdapterTables = {
    semaphore: KyselySemaphoreAdapterTable;
    semaphoreSlot: KyselySemaphoreSlotAdapterTable;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/adapters"`
 * @group Adapters
 */
export type KyselySemaphoreAdapterSettings = {
    kysely: Kysely<KyselySemaphoreAdapterTables>;

    /**
     * @default
     * ```ts
     * TimeSpan.fromMinutes(1)
     * ```
     */
    expiredSemaphoresRemovalInterval?: TimeSpan;

    /**
     * @default true
     */
    shouldRemoveExpiredSemaphores?: boolean;
};

/**
 * To utilize the `KyselySemaphoreAdapter`, you must install the [`"kysely"`](https://www.npmjs.com/package/kysely) package and configure a `Kysely` class instance.
 *
 * Note in order to use `KyselySemaphoreAdapter` correctly, ensure you use a single, consistent database across all server instances.
 * The adapter have been tested with `sqlite`, `postgres` and `mysql` databases.
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/adapters"`
 * @group Adapters
 */
export class KyselySemaphoreAdapter
    implements IDatabaseSemaphoreAdapter, IDeinitizable, IInitizable, IPrunable
{
    private readonly kysely: Kysely<KyselySemaphoreAdapterTables>;
    private readonly expiredSemaphoresRemovalInterval: TimeSpan;
    private readonly shouldRemoveExpiredSemaphores: boolean;
    private timeoutId: string | number | NodeJS.Timeout | undefined | null =
        null;

    /**
     * @example
     * ```ts
     * import { KyselySemaphoreAdapter } from "@daiso-tech/core/semaphore/adapters";
     * import Sqlite from "better-sqlite3";
     *
     * const semaphoreAdapter = new KyselySemaphoreAdapter({
     *   kysely: new Kysely({
     *     dialect: new SqliteDialect({
     *       database: new Sqlite("local.db"),
     *     }),
     *   }),
     * });
     * // You need initialize the adapter once before using it.
     * await semaphoreAdapter.init();
     * ```
     */
    constructor(settings: KyselySemaphoreAdapterSettings) {
        const {
            kysely,
            expiredSemaphoresRemovalInterval = TimeSpan.fromMinutes(1),
            shouldRemoveExpiredSemaphores = true,
        } = settings;
        this.expiredSemaphoresRemovalInterval =
            expiredSemaphoresRemovalInterval;
        this.shouldRemoveExpiredSemaphores = shouldRemoveExpiredSemaphores;
        this.kysely = kysely;
    }

    async init(): Promise<void> {
        // Should throw if the table already exists thats why the try catch is used.
        try {
            await this.kysely.schema
                .createTable("semaphore")
                .addColumn("key", "varchar(255)", (col) => col.primaryKey())
                .addColumn("limit", "integer", (col) => col.notNull())
                .execute();
        } catch {
            /* EMPTY */
        }

        // Should throw if the table already exists thats why the try catch is used.
        try {
            await this.kysely.schema
                .createTable("semaphoreSlot")
                .addColumn("id", "varchar(255)", (col) => col.primaryKey())
                .addColumn("key", "varchar(255)", (col) => col.notNull())
                .addColumn("expiration", "bigint")
                .addForeignKeyConstraint(
                    "semaphoreSlot_key",
                    ["key"],
                    "semaphore",
                    ["key"],
                    (eb) => eb.onDelete("cascade"),
                )
                .execute();
        } catch {
            /* EMPTY */
        }

        // Should throw if the index already exists thats why the try catch is used.
        try {
            await this.kysely.schema
                .createIndex("semaphoreSlot_expiration_index")
                .on("semaphoreSlot")
                .columns(["expiresAt"])
                .execute();
        } catch {
            /* EMPTY */
        }

        if (this.shouldRemoveExpiredSemaphores) {
            this.timeoutId = setInterval(() => {
                void this.removeAllExpired();
            }, this.expiredSemaphoresRemovalInterval.toMilliseconds());
        }
    }

    async deInit(): Promise<void> {
        if (this.shouldRemoveExpiredSemaphores && this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
        }

        // Should throw if the index does not exists thats why the try catch is used.
        try {
            await this.kysely.schema
                .dropIndex("semaphoreSlot_expiration_index")
                .on("semaphoreSlot")
                .execute();
        } catch {
            /* EMPTY */
        }

        // Should throw if the table does not exists thats why the try catch is used.
        try {
            await this.kysely.schema.dropTable("semapahoreSlot").execute();
        } catch {
            /* EMPTY */
        }

        // Should throw if the table does not exists thats why the try catch is used.
        try {
            await this.kysely.schema.dropTable("semapahore").execute();
        } catch {
            /* EMPTY */
        }
    }

    private isUnexpiredSlot(
        eb: ExpressionBuilder<KyselySemaphoreAdapterTables, "semaphoreSlot">,
    ) {
        const hasNotExpiration = eb("semaphoreSlot.expiration", "is", null);
        const hasExpiration = eb("semaphoreSlot.expiration", "is not", null);
        const hasNotExpired = eb("semaphoreSlot.expiration", "<", Date.now());
        return eb.or([
            hasNotExpiration,
            eb.and([hasExpiration, hasNotExpired]),
        ]);
    }

    async removeAllExpired(): Promise<void> {
        await this.kysely
            .deleteFrom("semaphore")
            .where((eb) => {
                const hasUnexpiredSlots = eb
                    .selectFrom("semaphoreSlot")
                    .select(eb.val(1).as("value"))
                    .where("semaphoreSlot.key", "=", eb.ref("semaphore.key"))
                    .where((eb) => this.isUnexpiredSlot(eb));
                return eb.not(eb.exists(hasUnexpiredSlots));
            })
            .execute();
    }

    async findLimit(key: string): Promise<number | null> {
        const row = await this.kysely
            .selectFrom("semaphore")
            .select(["semaphore.limit"])
            .where("semaphore.key", "=", key)
            .executeTakeFirst();
        if (row === undefined) {
            return null;
        }
        return row.limit;
    }

    async insertSemaphore(key: string, limit: number): Promise<void> {
        await this.kysely
            .insertInto("semaphore")
            .values({
                key,
                limit,
            })
            .execute();
    }

    async removeSemaphore(key: string): Promise<void> {
        await this.kysely
            .deleteFrom("semaphore")
            .where("semaphore.key", "=", key)
            .execute();
    }

    async insertSlotIfLimitNotReached(
        settings: DatabaseSemaphoreInsertSlotSettings,
    ): Promise<number> {
        const { key, slotId, limit, expiration } = settings;
        const result = await this.kysely
            .insertInto("semaphoreSlot")
            .columns(["id", "key", "expiration"])
            .expression((eb) =>
                eb
                    .selectFrom("semaphoreSlot")
                    .select([
                        eb.val(slotId).as("id"),
                        eb.val(key).as("key"),
                        eb.val(expiration).as("expiration"),
                    ])
                    .where((eb) => {
                        const countSubQuery = eb
                            .selectFrom("semaphoreSlot")
                            .select(eb.fn.countAll().as("count"))
                            .where("semaphoreSlot.key", "=", key)
                            .where((eb) => this.isUnexpiredSlot(eb));
                        return eb(countSubQuery, "<", limit);
                    }),
            )
            .executeTakeFirst();
        if (result.numInsertedOrUpdatedRows === undefined) {
            return 0;
        }
        return Number(result.numInsertedOrUpdatedRows);
    }

    async removeSlot(key: string, slotId: string): Promise<void> {
        await this.kysely
            .deleteFrom("semaphoreSlot")
            .where("semaphoreSlot.key", "=", key)
            .where("semaphoreSlot.id", "=", slotId)
            .execute();
    }

    async updateSlotIfUnexpired(
        key: string,
        slotId: string,
        expiration: Date,
    ): Promise<number> {
        const result = await this.kysely
            .updateTable("semaphoreSlot")
            .where("semaphoreSlot.key", "=", key)
            .where("semaphoreSlot.id", "=", slotId)
            .where((eb) => this.isUnexpiredSlot(eb))
            .set({
                expiration: expiration.getTime(),
            })
            .executeTakeFirst();
        return Number(result.numUpdatedRows);
    }
}
