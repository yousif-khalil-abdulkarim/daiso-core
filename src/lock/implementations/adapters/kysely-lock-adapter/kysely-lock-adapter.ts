/**
 * @module Lock
 */

import type {
    IDatabaseLockAdapter,
    IDatabaseLockTransaction,
    ILockData,
    ILockExpirationData,
} from "@/lock/contracts/_module-exports.js";
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
 * IMPORT_PATH: `"@daiso-tech/core/lock/adapters"`
 * @group Adapters
 */
export type KyselyLockTable = {
    key: string;
    owner: string;
    // In ms since unix epoch.
    // The type in mysql is bigint and will be returned as a string.
    // Some sql database drivers have support for js bigint if enabled. Meaning bigint will be returned.
    expiration: number | bigint | string | null;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/adapters"`
 * @group Adapters
 */
export type KyselyLockTables = {
    lock: KyselyLockTable;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/adapters"`
 * @group Adapters
 */
export type KyselyLockAdapterSettings = {
    kysely: Kysely<KyselyLockTables>;

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

async function find(
    kysely: Kysely<KyselyLockTables>,
    key: string,
): Promise<ILockData | null> {
    const row = await kysely
        .selectFrom("lock")
        .where("lock.key", "=", key)
        .select(["lock.owner", "lock.expiration"])
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

/**
 * @internal
 */
class DatabaseLockTransaction implements IDatabaseLockTransaction {
    private readonly isMysql: boolean;

    constructor(private readonly kysely: Kysely<KyselyLockTables>) {
        this.isMysql =
            this.kysely.getExecutor().adapter instanceof MysqlAdapter;
    }

    async find(key: string): Promise<ILockData | null> {
        return await find(this.kysely, key);
    }

    async upsert(
        key: string,
        lockId: string,
        expiration: Date | null,
    ): Promise<void> {
        const expirationAsMs = expiration?.getTime() ?? null;
        await this.kysely
            .insertInto("lock")
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
}

/**
 * To utilize the `KyselyLockAdapter`, you must install the [`"kysely"`](https://www.npmjs.com/package/kysely) package and configure a `Kysely` class instance.
 *
 * Note in order to use `KyselyLockAdapter` correctly, ensure you use a single, consistent database across all server instances.
 * The adapter have been tested with `sqlite`, `postgres` and `mysql` databases.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/adapters"`
 * @group Adapters
 */
export class KyselyLockAdapter
    implements IDatabaseLockAdapter, IDeinitizable, IInitizable, IPrunable
{
    private readonly kysely: Kysely<KyselyLockTables>;
    private readonly expiredKeysRemovalInterval: TimeSpan;
    private readonly shouldRemoveExpiredKeys: boolean;
    private intervalId: string | number | NodeJS.Timeout | undefined | null =
        null;
    private readonly currentDate: () => Date;
    private readonly isMysql: boolean;

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
            currentDate = () => new Date(),
        } = settings;
        this.expiredKeysRemovalInterval = expiredKeysRemovalInterval;
        this.shouldRemoveExpiredKeys = shouldRemoveExpiredKeys;
        this.kysely = kysely;
        this.isMysql =
            this.kysely.getExecutor().adapter instanceof MysqlAdapter;
        this.currentDate = currentDate;
    }

    /**
     * Removes all related lock tables and their rows.
     * Note all lock data will be removed.
     */
    async deInit(): Promise<void> {
        if (this.shouldRemoveExpiredKeys && this.intervalId !== null) {
            clearInterval(this.intervalId);
        }

        // Should throw if the index does not exists thats why the try catch is used.
        try {
            await this.kysely.schema
                .dropIndex("lock_expiration")
                .on("lock")
                .execute();
        } catch {
            /* EMPTY */
        }

        // Should throw if the table does not exists thats why the try catch is used.
        try {
            await this.kysely.schema.dropTable("lock").execute();
        } catch {
            /* EMPTY */
        }
    }

    /**
     * Creates all related tables and indexes.
     * Note the `init` method needs to be called once before using the adapter.
     */
    async init(): Promise<void> {
        // Should throw if the table already exists thats why the try catch is used.
        try {
            await this.kysely.schema
                .createTable("lock")
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
                .createIndex("lock_expiration")
                .on("lock")
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

    async removeAllExpired(): Promise<void> {
        await this.kysely
            .deleteFrom("lock")
            .where("lock.expiration", "<=", this.currentDate().getTime())
            .execute();
    }

    async transaction<TReturn>(
        fn: InvokableFn<
            [transaction: IDatabaseLockTransaction],
            Promise<TReturn>
        >,
    ): Promise<TReturn> {
        return await this.kysely
            .transaction()
            .setIsolationLevel("serializable")
            .execute(async (trx) => {
                return await fn(new DatabaseLockTransaction(trx));
            });
    }

    async remove(key: string): Promise<ILockExpirationData | null> {
        let result: Pick<KyselyLockTable, "expiration"> | undefined;
        if (this.isMysql) {
            result = await this.kysely
                .transaction()
                .setIsolationLevel("serializable")
                .execute(async (trx) => {
                    const row = await trx
                        .selectFrom("lock")
                        .where("lock.key", "=", key)
                        .select("lock.expiration")
                        .executeTakeFirst();
                    await trx
                        .deleteFrom("lock")
                        .where("lock.key", "=", key)
                        .executeTakeFirst();
                    return row;
                });
        } else {
            result = await this.kysely
                .deleteFrom("lock")
                .where("lock.key", "=", key)
                .returning(["lock.expiration"])
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
    ): Promise<ILockData | null> {
        let row: Pick<KyselyLockTable, "owner" | "expiration"> | undefined;
        if (this.isMysql) {
            row = await this.kysely
                .transaction()
                .setIsolationLevel("serializable")
                .execute(async (trx) => {
                    const row = await trx
                        .selectFrom("lock")
                        .where("lock.key", "=", key)
                        .where("lock.owner", "=", lockId)
                        .select(["lock.expiration", "lock.owner"])
                        .executeTakeFirst();
                    await trx
                        .deleteFrom("lock")
                        .where("lock.key", "=", key)
                        .where("lock.owner", "=", lockId)
                        .execute();
                    return row;
                });
        } else {
            row = await this.kysely
                .deleteFrom("lock")
                .where("lock.key", "=", key)
                .where("lock.owner", "=", lockId)
                .returning(["lock.expiration", "lock.owner"])
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
            .updateTable("lock")
            .where("lock.key", "=", key)
            .where("lock.owner", "=", lockId)
            .where((eb) =>
                eb.and([
                    eb("lock.expiration", "is not", null),
                    eb("lock.expiration", ">", Date.now()),
                ]),
            )
            .set({
                expiration: expiration.getTime(),
            })
            .executeTakeFirst();
        return Number(result.numUpdatedRows);
    }

    async find(key: string): Promise<ILockData | null> {
        return await find(this.kysely, key);
    }
}
