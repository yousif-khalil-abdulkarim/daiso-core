/**
 * @module Cache
 */

import {
    type ICacheData,
    type ICacheInsert,
    type ICacheUpdate,
    type IDatabaseCacheAdapter,
} from "@/cache/contracts/_module.js";
import { MysqlAdapter, Transaction, type ExpressionBuilder } from "kysely";
import type { ISerde } from "@/serde/contracts/_module.js";
import type {
    IDeinitizable,
    IInitizable,
    IPrunable,
} from "@/utilities/_module.js";
import type { ExpressionWrapper, SqlBool, Kysely } from "kysely";
import { TimeSpan } from "@/time-span/implementations/_module.js";
import type { ITimeSpan } from "@/time-span/contracts/_module.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/kysely-cache-adapter"`
 * @group Adapters
 */
export type KyselyCacheAdapterTable = {
    key: string;
    value: string;
    // In ms since unix epoch
    expiration: number | string | null;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/kysely-cache-adapter"`
 * @group Adapters
 */
export type KyselyCacheAdapterTables = {
    cache: KyselyCacheAdapterTable;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/kysely-cache-adapter"`
 * @group Adapters
 */
export type KyselyCacheAdapterSettings = {
    kysely: Kysely<KyselyCacheAdapterTables>;

    serde: ISerde<string>;

    /**
     * @default
     * ```ts
     * import { TimeSpan } from "@daiso-tech/core/time-span";
     *
     * TimeSpan.fromMinutes(1)
     * ```
     */
    expiredKeysRemovalInterval?: ITimeSpan;

    /**
     * @default true
     */
    shouldRemoveExpiredKeys?: boolean;
};

/**
 * To utilize the `KyselyCacheAdapter`, you must install the [`"kysely"`](https://www.npmjs.com/package/kysely) package and configure a `Kysely` class instance.
 * The adapter have been tested with `sqlite`, `postgres` and `mysql` databases.
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/kysely-cache-adapter"`
 * @group Adapters
 */
export class KyselyCacheAdapter<TType = unknown>
    implements
        IDatabaseCacheAdapter<TType>,
        IInitizable,
        IDeinitizable,
        IPrunable
{
    private static filterUnexpiredKeys(keys: string[]) {
        return (
            eb: ExpressionBuilder<KyselyCacheAdapterTables, "cache">,
        ): ExpressionWrapper<KyselyCacheAdapterTables, "cache", SqlBool> => {
            const hasNoExpiration = eb("cache.expiration", "is", null);
            const hasExpiration = eb("cache.expiration", "is not", null);
            const hasNotExpired = eb("cache.expiration", ">", Date.now());
            const keysMatch = eb("cache.key", "in", keys);
            return eb.and([
                keysMatch,
                eb.or([
                    hasNoExpiration,
                    eb.and([hasExpiration, hasNotExpired]),
                ]),
            ]);
        };
    }

    private static filterExpiredKeys(keys: string[]) {
        return (
            eb: ExpressionBuilder<KyselyCacheAdapterTables, "cache">,
        ): ExpressionWrapper<KyselyCacheAdapterTables, "cache", SqlBool> => {
            const keysMatch = eb("cache.key", "in", keys);
            const hasExpiration = eb("cache.expiration", "is not", null);
            const hasExpired = eb("cache.expiration", "<=", Date.now());
            return eb.and([keysMatch, hasExpiration, hasExpired]);
        };
    }

    private readonly serde: ISerde<string>;
    private readonly kysely: Kysely<KyselyCacheAdapterTables>;
    private readonly shouldRemoveExpiredKeys: boolean;
    private readonly expiredKeysRemovalInterval: TimeSpan;
    private timeoutId: NodeJS.Timeout | string | number | null = null;
    private readonly disableTransaction: boolean;

    /**
     * @example
     * ```ts
     * import { KyselyCacheAdapter } from "@daiso-tech/core/cache/kysely-cache-adapter";
     * import { Serde } from "@daiso-tech/core/serde";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/super-json-serde-adapter"
     * import SQLite from 'better-sqlite3'
     * import { Kysely, SqliteDialect } from 'kysely'
     *
     * const serde = new Serde(new SuperJsonSerdeAdapter());
     * const cacheAdapter = new KyselyCacheAdapter({
     *   kysely: new Kysely({
     *     dialect: new SqliteDialect({
     *       database: new Sqlite("local.db"),
     *     }),
     *   }),
     *   serde,
     * });
     * // You need initialize the adapter once before using it.
     * await cacheAdapter.init();
     * ```
     */
    constructor(settings: KyselyCacheAdapterSettings) {
        const {
            kysely,
            serde,
            expiredKeysRemovalInterval = TimeSpan.fromMinutes(1),
            shouldRemoveExpiredKeys = true,
        } = settings;
        this.disableTransaction = kysely instanceof Transaction;
        this.kysely = kysely;
        this.serde = serde;
        this.expiredKeysRemovalInterval = TimeSpan.fromTimeSpan(
            expiredKeysRemovalInterval,
        );
        this.shouldRemoveExpiredKeys = shouldRemoveExpiredKeys;
    }

    async removeAllExpired(): Promise<void> {
        await this.kysely
            .deleteFrom("cache")
            .where("cache.expiration", "<=", Date.now())
            .execute();
    }

    async init(): Promise<void> {
        // Should throw if the table already exists thats why the try catch is used.
        try {
            await this.kysely.schema
                .createTable("cache")
                .addColumn("key", "varchar(255)", (col) => col.primaryKey())
                .addColumn("value", "varchar(255)", (col) => col.notNull())
                .addColumn("expiration", "bigint")
                .execute();
        } catch {
            /* EMPTY */
        }

        // Should throw if the index already exists thats why the try catch is used.
        try {
            await this.kysely.schema
                .createIndex("cache_expiration")
                .on("cache")
                .columns(["expiration"])
                .execute();
        } catch {
            /* EMPTY */
        }

        if (this.shouldRemoveExpiredKeys && this.timeoutId === null) {
            this.timeoutId = setInterval(() => {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                this.removeAllExpired();
            }, this.expiredKeysRemovalInterval.toMilliseconds());
        }
    }

    /**
     * Removes all related cache tables and their rows.
     * Note all cache data will be removed.
     */
    async deInit(): Promise<void> {
        if (this.shouldRemoveExpiredKeys && this.timeoutId !== null) {
            clearInterval(this.timeoutId);
        }

        // Should throw if the index does not exists thats why the try catch is used.
        try {
            await this.kysely.schema
                .dropIndex("cache_expiration")
                .on("cache")
                .execute();
        } catch {
            /* EMPTY */
        }

        // Should throw if the table does not exists thats why the try catch is used.
        try {
            await this.kysely.schema.dropTable("cache").execute();
        } catch {
            /* EMPTY */
        }
    }

    async find(key: string): Promise<ICacheData<TType> | null> {
        const row = await this.kysely
            .selectFrom("cache")
            .where("cache.key", "=", key)
            .select(["cache.expiration", "cache.value"])
            .executeTakeFirst();
        if (row === undefined) {
            return null;
        }
        return {
            value: this.serde.deserialize(row.value),
            expiration:
                row.expiration !== null
                    ? new Date(Number(row.expiration))
                    : null,
        };
    }

    async insert(data: ICacheInsert<TType>): Promise<void> {
        await this.kysely
            .insertInto("cache")
            .values({
                key: data.key,
                value: this.serde.serialize(data.value),
                expiration: data.expiration?.getTime() ?? null,
            })
            .executeTakeFirst();
    }

    private async transaction<TReturn>(
        fn: (trx: Transaction<KyselyCacheAdapterTables>) => Promise<TReturn>,
    ): Promise<TReturn> {
        if (this.disableTransaction) {
            return fn(this.kysely as Transaction<KyselyCacheAdapterTables>);
        }
        return await this.kysely
            .transaction()
            .setIsolationLevel("serializable")
            .execute(fn);
    }

    async upsert(data: ICacheInsert<TType>): Promise<ICacheData<TType> | null> {
        const expiration = data.expiration?.getTime() ?? null;
        return await this.transaction(async (trx) => {
            const prevRow = await trx
                .selectFrom("cache")
                .select(["cache.key", "cache.value", "cache.expiration"])
                .where(KyselyCacheAdapter.filterUnexpiredKeys([data.key]))
                .executeTakeFirst();

            const isMysqlRunning =
                this.kysely.getExecutor().adapter instanceof MysqlAdapter;
            await trx
                .insertInto("cache")
                .values({
                    key: data.key,
                    value: this.serde.serialize(data.value),
                    expiration,
                })
                .$if(isMysqlRunning, (eb) =>
                    eb.onDuplicateKeyUpdate({
                        value: this.serde.serialize(data.value),
                        expiration,
                    }),
                )
                .$if(!isMysqlRunning, (eb) =>
                    eb.onConflict((eb) =>
                        eb.columns(["key"]).doUpdateSet({
                            value: this.serde.serialize(data.value),
                            expiration,
                        }),
                    ),
                )
                .executeTakeFirst();

            if (prevRow === undefined) {
                return null;
            }
            return {
                value: this.serde.deserialize(prevRow.value),
                expiration:
                    prevRow.expiration !== null
                        ? new Date(Number(prevRow.expiration))
                        : null,
            };
        });
    }

    async updateExpired(data: ICacheInsert<TType>): Promise<number> {
        const updateResult = await this.kysely
            .updateTable("cache")
            .where(KyselyCacheAdapter.filterExpiredKeys([data.key]))
            .set({
                value: this.serde.serialize(data.value),
                expiration: data.expiration?.getTime() ?? null,
            })
            .executeTakeFirst();
        return Number(updateResult.numUpdatedRows);
    }

    async updateUnexpired(data: ICacheUpdate<TType>): Promise<number> {
        const updateResult = await this.kysely
            .updateTable("cache")
            .where(KyselyCacheAdapter.filterUnexpiredKeys([data.key]))
            .set({
                value: this.serde.serialize(data.value),
            })
            .executeTakeFirst();
        return Number(updateResult.numUpdatedRows);
    }

    async incrementUnexpired(data: ICacheUpdate<number>): Promise<number> {
        return await this.transaction(async (trx) => {
            const row = await trx
                .selectFrom("cache")
                .select(["cache.value"])
                .where(KyselyCacheAdapter.filterUnexpiredKeys([data.key]))
                .executeTakeFirst();
            if (row === undefined) {
                return 0;
            }
            const { value: serializedValue } = row;
            const value = this.serde.deserialize(serializedValue);
            if (typeof value !== "number") {
                throw new TypeError(
                    `Unable to increment or decrement none number type key "${data.key}"`,
                );
            }
            const updateResult = await trx
                .updateTable("cache")
                .where(KyselyCacheAdapter.filterUnexpiredKeys([data.key]))
                .set({
                    value: this.serde.serialize(value + data.value),
                })
                .executeTakeFirst();
            return Number(updateResult.numUpdatedRows);
        });
    }

    async removeExpiredMany(keys: string[]): Promise<number> {
        const deleteResult = await this.kysely
            .deleteFrom("cache")
            .where(KyselyCacheAdapter.filterExpiredKeys(keys))
            .executeTakeFirst();
        return Number(deleteResult.numDeletedRows);
    }

    async removeUnexpiredMany(keys: string[]): Promise<number> {
        const deleteResult = await this.kysely
            .deleteFrom("cache")
            .where(KyselyCacheAdapter.filterUnexpiredKeys(keys))
            .executeTakeFirst();
        return Number(deleteResult.numDeletedRows);
    }

    async removeAll(): Promise<void> {
        await this.kysely.deleteFrom("cache").execute();
    }

    async removeByKeyPrefix(prefix: string): Promise<void> {
        await this.kysely
            .deleteFrom("cache")
            .where("cache.key", "like", `${prefix}%`)
            .execute();
    }
}
