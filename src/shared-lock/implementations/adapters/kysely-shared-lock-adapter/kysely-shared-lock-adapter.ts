/**
 * @module SharedLock
 */

import type {
    IDatabaseReaderSemaphoreTransaction,
    IDatabaseSharedLockAdapter,
    IDatabaseSharedLockTransaction,
    IWriterLockData,
    IWriterLockExpirationData,
    IDatabaseWriterLockTransaction,
    IReaderSemaphoreData,
    IReaderSemaphoreSlotData,
    IReaderSemaphoreSlotExpirationData,
} from "@/shared-lock/contracts/_module-exports.js";
import { MysqlAdapter, type Kysely } from "kysely";
import {
    type IDeinitizable,
    type IInitizable,
    type InvokableFn,
    type IPrunable,
} from "@/utilities/_module-exports.js";
import { TimeSpan } from "@/time-span/implementations/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/kysely-shared-lock-adapter"`
 * @group Adapters
 */
export type KyselyWriterLockTable = {
    key: string;
    owner: string;
    // In ms since unix epoch.
    // The type in mysql is bigint and will be returned as a string.
    // Some sql database drivers have support for js bigint if enabled. Meaning bigint will be returned.
    expiration: number | bigint | string | null;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/kysely-shared-lock-adapter"`
 * @group Adapters
 */
export type KyselyReaderSemaphoreTable = {
    key: string;
    limit: number;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/kysely-shared-lock-adapter"`
 * @group Adapters
 */
export type KyselyReaderSemaphoreSlotTable = {
    id: string;
    key: string;
    // In ms since unix epoch
    // The type in mysql is bigint and will be returned as a string
    expiration: number | string | null;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/kysely-shared-lock-adapter"`
 * @group Adapters
 */
export type KyselySharedLockTables = {
    writerLock: KyselyWriterLockTable;
    readerSemaphore: KyselyReaderSemaphoreTable;
    readerSemaphoreSlot: KyselyReaderSemaphoreSlotTable;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/kysely-shared-lock-adapter"`
 * @group Adapters
 */
export type KyselySharedLockAdapterSettings = {
    kysely: Kysely<KyselySharedLockTables>;

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

    /**
     *  @default
     * ```ts
     * () => new Date()
     * ```
     */
    currentDate?: () => Date;
};

/**
 * @internal
 */
class DatabaseReaderSemaphoreTransaction
    implements IDatabaseReaderSemaphoreTransaction
{
    private readonly isMysql: boolean;

    constructor(private readonly kysely: Kysely<KyselySharedLockTables>) {
        this.isMysql =
            this.kysely.getExecutor().adapter instanceof MysqlAdapter;
    }

    async findSemaphore(key: string): Promise<IReaderSemaphoreData | null> {
        const row = await this.kysely
            .selectFrom("readerSemaphore")
            .where("readerSemaphore.key", "=", key)
            .select("limit")
            .executeTakeFirst();
        if (row === undefined) {
            return null;
        }
        return row;
    }

    async findSlots(key: string): Promise<IReaderSemaphoreSlotData[]> {
        const rows = await this.kysely
            .selectFrom("readerSemaphoreSlot")
            .where("readerSemaphoreSlot.key", "=", key)
            .select([
                "readerSemaphoreSlot.id",
                "readerSemaphoreSlot.expiration",
            ])
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

    async upsertSemaphore(key: string, limit: number): Promise<void> {
        await this.kysely
            .insertInto("readerSemaphore")
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
        lockId: string,
        expiration: Date | null,
    ): Promise<void> {
        const expirationAsMs = expiration?.getTime() ?? null;
        await this.kysely
            .insertInto("readerSemaphoreSlot")
            .values({
                key,
                id: lockId,
                expiration: expirationAsMs,
            })
            .$if(!this.isMysql, (eb) =>
                eb.onConflict((eb) =>
                    eb.column("id").doUpdateSet({
                        key,
                        id: lockId,
                        expiration: expirationAsMs,
                    }),
                ),
            )
            .$if(this.isMysql, (eb) =>
                eb.onDuplicateKeyUpdate({
                    key,
                    id: lockId,
                    expiration: expirationAsMs,
                }),
            )
            .execute();
    }

    async removeSlot(
        key: string,
        slotId: string,
    ): Promise<IReaderSemaphoreSlotExpirationData | null> {
        let row: Pick<KyselyReaderSemaphoreSlotTable, "expiration"> | undefined;

        if (this.isMysql) {
            row = await this.kysely
                .selectFrom("readerSemaphoreSlot")
                .select("readerSemaphoreSlot.expiration")
                .where("readerSemaphoreSlot.key", "=", key)
                .where("readerSemaphoreSlot.id", "=", slotId)
                .executeTakeFirst();
            await this.kysely
                .deleteFrom("readerSemaphoreSlot")
                .where("readerSemaphoreSlot.key", "=", key)
                .where("readerSemaphoreSlot.id", "=", slotId)
                .executeTakeFirst();
        } else {
            row = await this.kysely
                .deleteFrom("readerSemaphoreSlot")
                .where("readerSemaphoreSlot.key", "=", key)
                .where("readerSemaphoreSlot.id", "=", slotId)
                .returning("readerSemaphoreSlot.expiration")
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

    async removeAllSlots(
        key: string,
    ): Promise<IReaderSemaphoreSlotExpirationData[]> {
        let rows: Pick<KyselyReaderSemaphoreSlotTable, "expiration">[];

        if (this.isMysql) {
            rows = await this.kysely
                .selectFrom("readerSemaphoreSlot")
                .where("readerSemaphoreSlot.key", "=", key)
                .select("readerSemaphoreSlot.expiration")
                .execute();
            await this.kysely
                .deleteFrom("readerSemaphoreSlot")
                .where("readerSemaphoreSlot.key", "=", key)
                .execute();
        } else {
            rows = await this.kysely
                .deleteFrom("readerSemaphoreSlot")
                .where("readerSemaphoreSlot.key", "=", key)
                .returning("readerSemaphoreSlot.expiration")
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
            .updateTable("readerSemaphoreSlot")
            .where("readerSemaphoreSlot.key", "=", key)
            .where("readerSemaphoreSlot.id", "=", slotId)
            .where((eb) =>
                eb.and([
                    eb("readerSemaphoreSlot.expiration", "is not", null),
                    eb("readerSemaphoreSlot.expiration", ">", Date.now()),
                ]),
            )
            .set({
                expiration: expiration.getTime(),
            })
            .executeTakeFirst();
        return Number(result.numUpdatedRows);
    }
}

/**
 * @internal
 */
class DatabaseWriterLockTransaction implements IDatabaseWriterLockTransaction {
    private readonly isMysql: boolean;

    constructor(private readonly kysely: Kysely<KyselySharedLockTables>) {
        this.isMysql =
            this.kysely.getExecutor().adapter instanceof MysqlAdapter;
    }

    async find(key: string): Promise<IWriterLockData | null> {
        const row = await this.kysely
            .selectFrom("writerLock")
            .where("writerLock.key", "=", key)
            .select(["writerLock.owner", "writerLock.expiration"])
            .executeTakeFirst();
        if (row === undefined) {
            return null;
        }
        if (row.expiration === null) {
            return {
                owner: row.owner,
                expiration: null,
            };
        }
        return {
            owner: row.owner,
            expiration: new Date(Number(row.expiration)),
        };
    }

    async upsert(
        key: string,
        lockId: string,
        expiration: Date | null,
    ): Promise<void> {
        const expirationAsMs = expiration?.getTime() ?? null;
        await this.kysely
            .insertInto("writerLock")
            .values({
                key,
                owner: lockId,
                expiration: expirationAsMs,
            })
            .$if(!this.isMysql, (eb) =>
                eb.onConflict((eb) =>
                    eb.column("key").doUpdateSet({
                        key,
                        owner: lockId,
                        expiration: expirationAsMs,
                    }),
                ),
            )
            .$if(this.isMysql, (eb) =>
                eb.onDuplicateKeyUpdate({
                    key,
                    owner: lockId,
                    expiration: expirationAsMs,
                }),
            )
            .execute();
    }

    async remove(key: string): Promise<IWriterLockExpirationData | null> {
        let result: Pick<KyselyWriterLockTable, "expiration"> | undefined;
        if (this.isMysql) {
            result = await this.kysely
                .selectFrom("writerLock")
                .where("writerLock.key", "=", key)
                .select("writerLock.expiration")
                .executeTakeFirst();
            await this.kysely
                .deleteFrom("writerLock")
                .where("writerLock.key", "=", key)
                .executeTakeFirst();
        } else {
            result = await this.kysely
                .deleteFrom("writerLock")
                .where("writerLock.key", "=", key)
                .returning(["writerLock.expiration"])
                .executeTakeFirst();
        }
        if (result === undefined) {
            return null;
        }
        if (result.expiration === null) {
            return {
                expiration: null,
            };
        }
        return {
            expiration: new Date(Number(result.expiration)),
        };
    }

    async removeIfOwner(
        key: string,
        lockId: string,
    ): Promise<IWriterLockData | null> {
        let row:
            | Pick<KyselyWriterLockTable, "owner" | "expiration">
            | undefined;
        if (this.isMysql) {
            row = await this.kysely
                .selectFrom("writerLock")
                .where("writerLock.key", "=", key)
                .where("writerLock.owner", "=", lockId)
                .select(["writerLock.expiration", "writerLock.owner"])
                .executeTakeFirst();
            await this.kysely
                .deleteFrom("writerLock")
                .where("writerLock.key", "=", key)
                .where("writerLock.owner", "=", lockId)
                .execute();
        } else {
            row = await this.kysely
                .deleteFrom("writerLock")
                .where("writerLock.key", "=", key)
                .where("writerLock.owner", "=", lockId)
                .returning(["writerLock.expiration", "writerLock.owner"])
                .executeTakeFirst();
        }

        if (row === undefined) {
            return null;
        }

        const { expiration } = row;
        if (expiration === null) {
            return {
                owner: row.owner,
                expiration: null,
            };
        }

        return {
            owner: row.owner,
            expiration: new Date(Number(expiration)),
        };
    }

    async updateExpiration(
        key: string,
        lockId: string,
        expiration: Date,
    ): Promise<number> {
        const result = await this.kysely
            .updateTable("writerLock")
            .where("writerLock.key", "=", key)
            .where("writerLock.owner", "=", lockId)
            .where((eb) =>
                eb.and([
                    eb("writerLock.expiration", "is not", null),
                    eb("writerLock.expiration", ">", Date.now()),
                ]),
            )
            .set({
                expiration: expiration.getTime(),
            })
            .executeTakeFirst();
        return Number(result.numUpdatedRows);
    }
}

/**
 * To utilize the `KyselySharedLockAdapter`, you must install the [`"kysely"`](https://www.npmjs.com/package/kysely) package and configure a `Kysely` class instance.
 *
 * Note in order to use `KyselySharedLockAdapter` correctly, ensure you use a single, consistent database across all server instances.
 * The adapter have been tested with `sqlite`, `postgres` and `mysql` databases.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/kysely-shared-lock-adapter"`
 * @group Adapters
 */
export class KyselySharedLockAdapter
    implements IDatabaseSharedLockAdapter, IDeinitizable, IInitizable, IPrunable
{
    private readonly kysely: Kysely<KyselySharedLockTables>;
    private readonly expiredKeysRemovalInterval: TimeSpan;
    private readonly shouldRemoveExpiredKeys: boolean;
    private intervalId: string | number | NodeJS.Timeout | undefined | null =
        null;
    private readonly currentDate: () => Date;

    /**
     * @example
     * ```ts
     * import { KyselySharedLockAdapter } from "@daiso-tech/core/shared-lock/kysely-shared-lock-adapter";
     * import Sqlite from "better-sqlite3";
     *
     * const sharedLockAdapter = new KyselySharedLockAdapter({
     *   kysely: new Kysely({
     *     dialect: new SqliteDialect({
     *       database: new Sqlite("local.db"),
     *     }),
     *   }),
     * });
     * // You need initialize the adapter once before using it.
     * await sharedLockAdapter.init();
     * ```
     */
    constructor(settings: KyselySharedLockAdapterSettings) {
        const {
            kysely,
            expiredKeysRemovalInterval = TimeSpan.fromMinutes(1),
            shouldRemoveExpiredKeys = true,
            currentDate = () => new Date(),
        } = settings;
        this.expiredKeysRemovalInterval = expiredKeysRemovalInterval;
        this.shouldRemoveExpiredKeys = shouldRemoveExpiredKeys;
        this.kysely = kysely;
        this.currentDate = currentDate;
    }

    async init(): Promise<void> {
        // Should throw if the table already exists thats why the try catch is used.
        try {
            await this.kysely.schema
                .createTable("readerSemaphore")
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
                .createTable("readerSemaphoreSlot")
                .addColumn("id", "varchar(255)", (col) =>
                    col.notNull().primaryKey(),
                )
                .addColumn("key", "varchar(255)", (col) => col.notNull())
                .addColumn("expiration", "bigint")
                .addForeignKeyConstraint(
                    "readerSemaphoreSlot_key",
                    ["key"],
                    "readerSemaphore",
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
                .createIndex("readerSemaphoreSlot_expiration_index")
                .on("readerSemaphoreSlot")
                .columns(["key", "expiresAt"])
                .execute();
        } catch {
            /* EMPTY */
        }

        // Should throw if the table already exists thats why the try catch is used.
        try {
            await this.kysely.schema
                .createTable("writerLock")
                .addColumn("key", "varchar(255)", (col) =>
                    col.primaryKey().notNull(),
                )
                .addColumn("owner", "varchar(255)", (col) => col.notNull())
                .addColumn("expiration", "bigint")
                .execute();
        } catch {
            /* EMPTY */
        }

        // Should throw if the index already exists thats why the try catch is used.
        try {
            await this.kysely.schema
                .createIndex("writerLock_expiration")
                .on("writerLock")
                .column("expiration")
                .execute();
        } catch {
            /* EMPTY */
        }

        if (this.shouldRemoveExpiredKeys) {
            this.intervalId = setInterval(() => {
                void this.removeAllExpired();
            }, this.expiredKeysRemovalInterval.toMilliseconds());
        }
    }

    async deInit(): Promise<void> {
        if (this.shouldRemoveExpiredKeys && this.intervalId !== null) {
            clearInterval(this.intervalId);
        }

        // Should throw if the index does not exists thats why the try catch is used.
        try {
            await this.kysely.schema
                .dropIndex("readerSemaphoreSlot_expiration_index")
                .on("readerSemaphoreSlot")
                .execute();
        } catch {
            /* EMPTY */
        }

        // Should throw if the table does not exists thats why the try catch is used.
        try {
            await this.kysely.schema.dropTable("readerSemaphoreSlot").execute();
        } catch {
            /* EMPTY */
        }

        // Should throw if the table does not exists thats why the try catch is used.
        try {
            await this.kysely.schema.dropTable("readerSemaphore").execute();
        } catch {
            /* EMPTY */
        }

        // Should throw if the index does not exists thats why the try catch is used.
        try {
            await this.kysely.schema
                .dropIndex("writerLock_expiration")
                .on("writerLock")
                .execute();
        } catch {
            /* EMPTY */
        }

        // Should throw if the table does not exists thats why the try catch is used.
        try {
            await this.kysely.schema.dropTable("writerLock").execute();
        } catch {
            /* EMPTY */
        }
    }

    private async removeAllExpiredReaders(): Promise<void> {
        await this.kysely
            .deleteFrom("readerSemaphore")
            .where((eb) => {
                const hasUnexpiredSlots = eb
                    .selectFrom("readerSemaphoreSlot")
                    .select(eb.val(1).as("value"))
                    .where(
                        "readerSemaphoreSlot.key",
                        "=",
                        eb.ref("readerSemaphore.key"),
                    )
                    .where((eb) =>
                        eb.and([
                            eb(
                                "readerSemaphoreSlot.expiration",
                                "is not",
                                null,
                            ),
                            eb(
                                "readerSemaphoreSlot.expiration",
                                ">",
                                Date.now(),
                            ),
                        ]),
                    );
                return eb.not(eb.exists(hasUnexpiredSlots));
            })
            .execute();
    }

    private async removeAllExpiredWriters(): Promise<void> {
        await this.kysely
            .deleteFrom("writerLock")
            .where("writerLock.expiration", "<=", this.currentDate().getTime())
            .execute();
    }

    async removeAllExpired(): Promise<void> {
        await Promise.all([
            this.removeAllExpiredWriters(),
            this.removeAllExpiredReaders(),
        ]);
    }

    async transaction<TReturn>(
        fn: InvokableFn<
            [transaction: IDatabaseSharedLockTransaction],
            Promise<TReturn>
        >,
    ): Promise<TReturn> {
        return await this.kysely
            .transaction()
            .setIsolationLevel("serializable")
            .execute(async (trx) => {
                return await fn({
                    reader: new DatabaseReaderSemaphoreTransaction(trx),
                    writer: new DatabaseWriterLockTransaction(trx),
                });
            });
    }
}
