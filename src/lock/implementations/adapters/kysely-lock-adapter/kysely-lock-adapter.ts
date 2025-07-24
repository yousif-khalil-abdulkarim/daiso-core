/**
 * @module Lock
 */

import type {
    IDatabaseLockAdapter,
    ILockData,
} from "@/lock/contracts/_module-exports.js";
import { MysqlAdapter, type ExpressionBuilder, type Kysely } from "kysely";
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
export type KyselyLockAdapterTable = {
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
export type KyselyLockAdapterTables = {
    lock: KyselyLockAdapterTable;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/adapters"`
 * @group Adapters
 */
export type KyselyLockAdapterSettings = {
    kysely: Kysely<KyselyLockAdapterTables>;

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

    /**
     * @default
     * ```ts
     * globalThis.setInterval
     * ```
     */
    setInterval?: typeof setInterval;
};

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
    private readonly kysely: Kysely<KyselyLockAdapterTables>;
    private readonly expiredKeysRemovalInterval: TimeSpan;
    private readonly shouldRemoveExpiredKeys: boolean;
    private timeoutId: string | number | NodeJS.Timeout | undefined | null =
        null;
    private readonly currentDate: () => Date;
    private readonly setInterval: typeof setInterval;

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
            setInterval = globalThis.setInterval,
        } = settings;
        this.expiredKeysRemovalInterval = expiredKeysRemovalInterval;
        this.shouldRemoveExpiredKeys = shouldRemoveExpiredKeys;
        this.kysely = kysely;
        this.currentDate = currentDate;
        this.setInterval = setInterval;
    }

    async deInit(): Promise<void> {
        if (this.shouldRemoveExpiredKeys && this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
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

    async init(): Promise<void> {
        // Should throw if the table already exists thats why the try catch is used.
        try {
            await this.kysely.schema
                .createTable("lock")
                .addColumn("key", "varchar(255)", (col) =>
                    col.notNull().primaryKey(),
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
                .columns(["expiration"])
                .execute();
        } catch {
            /* EMPTY */
        }

        if (this.shouldRemoveExpiredKeys) {
            this.timeoutId = this.setInterval(() => {
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
                expiration: expiration?.getTime() ?? null,
            })
            .execute();
    }

    private updateExpiredQuery(
        key: string,
        owner: string,
        expirationInMs: number | null,
    ) {
        return (eb: ExpressionBuilder<KyselyLockAdapterTables, "lock">) => {
            const hasExpiration = eb("lock.expiration", "is not", null);
            const hasExpired = eb("lock.expiration", "<=", Date.now());
            const hasExpired_ = eb.and([hasExpiration, hasExpired]);
            return {
                key,
                owner: eb
                    .case()
                    .when(hasExpired_)
                    .then(owner)
                    .else(eb.ref("lock.owner"))
                    .end(),
                expiration: eb
                    .case()
                    .when(hasExpired_)
                    .then(expirationInMs)
                    .else(eb.ref("lock.expiration"))
                    .end(),
            };
        };
    }

    async updateIfExpired(
        key: string,
        owner: string,
        expiration: Date | null,
    ): Promise<ILockData | null> {
        const expirationInMs = expiration?.getTime() ?? null;
        let row:
            | Pick<KyselyLockAdapterTable, "owner" | "expiration">
            | undefined;
        const isMysql =
            this.kysely.getExecutor().adapter instanceof MysqlAdapter;
        if (isMysql) {
            row = await this.kysely
                .transaction()
                .setIsolationLevel("serializable")
                .execute(async (trx) => {
                    await trx
                        .updateTable("lock")
                        .where("lock.key", "=", key)
                        .set(
                            this.updateExpiredQuery(key, owner, expirationInMs),
                        )
                        .execute();
                    return await trx
                        .selectFrom("lock")
                        .select(["lock.owner", "lock.expiration"])
                        .where("lock.key", "=", key)
                        .executeTakeFirst();
                });
        } else {
            row = await this.kysely
                .updateTable("lock")
                .where("lock.key", "=", key)
                .set(this.updateExpiredQuery(key, owner, expirationInMs))
                .returning(["lock.owner", "lock.expiration"])
                .executeTakeFirst();
        }

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

    async remove(key: string): Promise<void> {
        await this.kysely
            .deleteFrom("lock")
            .where("lock.key", "=", key)
            .execute();
    }

    async removeIfOwner(key: string, owner: string): Promise<ILockData | null> {
        const isMysql =
            this.kysely.getExecutor().adapter instanceof MysqlAdapter;
        let row:
            | Pick<KyselyLockAdapterTable, "owner" | "expiration">
            | undefined;
        if (isMysql) {
            row = await this.kysely
                .transaction()
                .setIsolationLevel("serializable")
                .execute(async (trx) => {
                    const row = await trx
                        .selectFrom("lock")
                        .where("lock.key", "=", key)
                        .where("lock.owner", "=", owner)
                        .select(["lock.expiration", "lock.owner"])
                        .executeTakeFirst();
                    await trx
                        .deleteFrom("lock")
                        .where("lock.key", "=", key)
                        .where("lock.owner", "=", owner)
                        .execute();
                    return row;
                });
        } else {
            row = await this.kysely
                .deleteFrom("lock")
                .where("lock.key", "=", key)
                .where("lock.owner", "=", owner)
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

    async updateExpirationIfOwner(
        key: string,
        owner: string,
        expiration: Date,
    ): Promise<number> {
        const result = await this.kysely
            .updateTable("lock")
            .where("lock.key", "=", key)
            .where("lock.owner", "=", owner)
            .set({
                expiration: expiration.getTime(),
            })
            .executeTakeFirst();
        return Number(result.numUpdatedRows);
    }

    async find(key: string): Promise<ILockData | null> {
        const row = await this.kysely
            .selectFrom("lock")
            .select(["lock.owner", "lock.expiration"])
            .where("lock.key", "=", key)
            .executeTakeFirst();

        if (row === undefined) {
            return null;
        }

        const { owner, expiration } = row;
        if (expiration === null) {
            return {
                owner,
                expiration: null,
            };
        }

        return {
            owner,
            expiration: new Date(Number(expiration)),
        };
    }
}
