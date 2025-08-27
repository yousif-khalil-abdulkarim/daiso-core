/**
 * @module Semaphore
 */

import type {
    IDatabaseSemaphoreTransaction,
    IDatabaseSemaphoreAdapter,
    ISemaphoreData,
    ISemaphoreSlotData,
    ISemaphoreSlotExpirationData,
} from "@/semaphore/contracts/_module-exports.js";
import {
    TimeSpan,
    type IDeinitizable,
    type IInitizable,
    type InvokableFn,
    type IPrunable,
} from "@/utilities/_module-exports.js";
import { MysqlAdapter, type Kysely } from "kysely";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/adapters"`
 * @group Adapters
 */
export type KyselySemaphoreTable = {
    key: string;
    limit: number;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/adapters"`
 * @group Adapters
 */
export type KyselySemaphoreSlotTable = {
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
export type KyselySemaphoreTables = {
    semaphore: KyselySemaphoreTable;
    semaphoreSlot: KyselySemaphoreSlotTable;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/adapters"`
 * @group Adapters
 */
export type KyselySemaphoreAdapterSettings = {
    kysely: Kysely<KyselySemaphoreTables>;

    /**
     * @default
     * ```ts
     * TimeSpan.fromMinutes(1)
     * ```
     */
    expiredKeysRemovalInterval?: TimeSpan;

    /**
     * @default true
     */
    shouldRemoveExpiredKeys?: boolean;
};

/**
 * @internal
 */
class DatabaseSemaphoreTransaction implements IDatabaseSemaphoreTransaction {
    private readonly isMysql: boolean;

    constructor(private readonly kysely: Kysely<KyselySemaphoreTables>) {
        this.isMysql =
            this.kysely.getExecutor().adapter instanceof MysqlAdapter;
    }

    async findSlots(key: string): Promise<ISemaphoreSlotData[]> {
        const rows = await this.kysely
            .selectFrom("semaphoreSlot")
            .where("semaphoreSlot.key", "=", key)
            .select(["semaphoreSlot.id", "semaphoreSlot.expiration"])
            .execute();
        return rows.map((row) => {
            if (row.expiration === null) {
                return {
                    id: row.id,
                    expiration: null,
                };
            }
            return {
                id: row.id,
                expiration: new Date(Number(row.expiration)),
            };
        });
    }

    async findSemaphore(key: string): Promise<ISemaphoreData | null> {
        const row = await this.kysely
            .selectFrom("semaphore")
            .where("semaphore.key", "=", key)
            .select("limit")
            .executeTakeFirst();
        if (row === undefined) {
            return null;
        }
        return row;
    }

    async upsertSemaphore(key: string, limit: number): Promise<void> {
        await this.kysely
            .insertInto("semaphore")
            .values({ key, limit })
            .$if(!this.isMysql, (eb) =>
                eb.onConflict((eb) =>
                    eb.column("key").doUpdateSet({
                        key,
                        limit,
                    }),
                ),
            )
            .$if(this.isMysql, (eb) =>
                eb.onDuplicateKeyUpdate({
                    key,
                    limit,
                }),
            )
            .execute();
    }

    async upsertSlot(
        key: string,
        slotId: string,
        expiration: Date | null,
    ): Promise<void> {
        const expirationAsMs = expiration?.getTime() ?? null;
        await this.kysely
            .insertInto("semaphoreSlot")
            .values({
                key,
                id: slotId,
                expiration: expirationAsMs,
            })
            .$if(!this.isMysql, (eb) =>
                eb.onConflict((eb) =>
                    eb.column("id").doUpdateSet({
                        key,
                        id: slotId,
                        expiration: expirationAsMs,
                    }),
                ),
            )
            .$if(this.isMysql, (eb) =>
                eb.onDuplicateKeyUpdate({
                    key,
                    id: slotId,
                    expiration: expirationAsMs,
                }),
            )
            .execute();
    }
}

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
    private readonly kysely: Kysely<KyselySemaphoreTables>;
    private readonly expiredKeysRemovalInterval: TimeSpan;
    private readonly shouldRemoveExpiredKeys: boolean;
    private timeoutId: string | number | NodeJS.Timeout | undefined | null =
        null;
    private readonly isMysql: boolean;

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
            expiredKeysRemovalInterval = TimeSpan.fromMinutes(1),
            shouldRemoveExpiredKeys = true,
        } = settings;
        this.expiredKeysRemovalInterval = expiredKeysRemovalInterval;
        this.shouldRemoveExpiredKeys = shouldRemoveExpiredKeys;
        this.kysely = kysely;
        this.isMysql =
            this.kysely.getExecutor().adapter instanceof MysqlAdapter;
    }

    async init(): Promise<void> {
        // Should throw if the table already exists thats why the try catch is used.
        try {
            await this.kysely.schema
                .createTable("semaphore")
                .addColumn("key", "varchar(255)", (col) =>
                    col.notNull().primaryKey(),
                )
                .addColumn("limit", "integer", (col) => col.notNull())
                .execute();
        } catch {
            /* EMPTY */
        }

        // Should throw if the table already exists thats why the try catch is used.
        try {
            await this.kysely.schema
                .createTable("semaphoreSlot")
                .addColumn("id", "varchar(255)", (col) =>
                    col.notNull().primaryKey(),
                )
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

        if (this.shouldRemoveExpiredKeys) {
            this.timeoutId = setInterval(() => {
                void this.removeAllExpired();
            }, this.expiredKeysRemovalInterval.toMilliseconds());
        }
    }

    async deInit(): Promise<void> {
        if (this.shouldRemoveExpiredKeys && this.timeoutId !== null) {
            clearInterval(this.timeoutId);
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
            await this.kysely.schema.dropTable("semaphoreSlot").execute();
        } catch {
            /* EMPTY */
        }

        // Should throw if the table does not exists thats why the try catch is used.
        try {
            await this.kysely.schema.dropTable("semaphore").execute();
        } catch {
            /* EMPTY */
        }
    }

    async removeAllExpired(): Promise<void> {
        await this.kysely
            .deleteFrom("semaphore")
            .where((eb) => {
                const hasUnexpiredSlots = eb
                    .selectFrom("semaphoreSlot")
                    .select(eb.val(1).as("value"))
                    .where("semaphoreSlot.key", "=", eb.ref("semaphore.key"))
                    .where((eb) =>
                        eb.and([
                            eb("semaphoreSlot.expiration", "is not", null),
                            eb("semaphoreSlot.expiration", ">", Date.now()),
                        ]),
                    );
                return eb.not(eb.exists(hasUnexpiredSlots));
            })
            .execute();
    }

    async transaction<TValue>(
        fn: InvokableFn<
            [methods: IDatabaseSemaphoreTransaction],
            Promise<TValue>
        >,
    ): Promise<TValue> {
        return await this.kysely
            .transaction()
            .setIsolationLevel("serializable")
            .execute(async (trx) => {
                return await fn(new DatabaseSemaphoreTransaction(trx));
            });
    }

    async removeSlot(
        key: string,
        slotId: string,
    ): Promise<ISemaphoreSlotExpirationData | null> {
        let row: Pick<KyselySemaphoreSlotTable, "expiration"> | undefined;

        if (this.isMysql) {
            row = await this.kysely
                .transaction()
                .setIsolationLevel("serializable")
                .execute(async (trx) => {
                    const row = await trx
                        .selectFrom("semaphoreSlot")
                        .select("semaphoreSlot.expiration")
                        .where("semaphoreSlot.key", "=", key)
                        .where("semaphoreSlot.id", "=", slotId)
                        .executeTakeFirst();
                    await trx
                        .deleteFrom("semaphoreSlot")
                        .where("semaphoreSlot.key", "=", key)
                        .where("semaphoreSlot.id", "=", slotId)
                        .executeTakeFirst();
                    return row;
                });
        } else {
            row = await this.kysely
                .deleteFrom("semaphoreSlot")
                .where("semaphoreSlot.key", "=", key)
                .where("semaphoreSlot.id", "=", slotId)
                .returning("semaphoreSlot.expiration")
                .executeTakeFirst();
        }

        if (row === undefined) {
            return null;
        }
        if (row.expiration === null) {
            return {
                expiration: null,
            };
        }
        return {
            expiration: new Date(Number(row.expiration)),
        };
    }

    async removeAllSlots(key: string): Promise<ISemaphoreSlotExpirationData[]> {
        let rows: Pick<KyselySemaphoreSlotTable, "expiration">[];

        if (this.isMysql) {
            rows = await this.kysely
                .transaction()
                .setIsolationLevel("serializable")
                .execute(async (trx) => {
                    const rows = trx
                        .selectFrom("semaphoreSlot")
                        .where("semaphoreSlot.key", "=", key)
                        .select("semaphoreSlot.expiration")
                        .execute();
                    await trx
                        .deleteFrom("semaphoreSlot")
                        .where("semaphoreSlot.key", "=", key)
                        .execute();
                    return rows;
                });
        } else {
            rows = await this.kysely
                .deleteFrom("semaphoreSlot")
                .where("semaphoreSlot.key", "=", key)
                .returning("semaphoreSlot.expiration")
                .execute();
        }

        return rows.map((row) => {
            if (row.expiration === null) {
                return {
                    expiration: null,
                };
            }
            return {
                expiration: new Date(Number(row.expiration)),
            };
        });
    }

    async updateExpiration(
        key: string,
        slotId: string,
        expiration: Date,
    ): Promise<number> {
        const result = await this.kysely
            .updateTable("semaphoreSlot")
            .where("semaphoreSlot.key", "=", key)
            .where("semaphoreSlot.id", "=", slotId)
            .where((eb) =>
                eb.and([
                    eb("semaphoreSlot.expiration", "is not", null),
                    eb("semaphoreSlot.expiration", ">", Date.now()),
                ]),
            )
            .set({
                expiration: expiration.getTime(),
            })
            .executeTakeFirst();
        return Number(result.numUpdatedRows);
    }
}
