/**
 * @module Cache
 */

import {
    TypeCacheError,
    type ICacheData,
    type ICacheInsert,
    type ICacheUpdate,
    type IDatabaseCacheAdapter,
} from "@/cache/contracts/_module-exports.js";
import type { ExpressionBuilder, Transaction } from "kysely";
import type { ISerde } from "@/serde/contracts/_module-exports.js";
import type {
    IDeinitizable,
    IInitizable,
    IPrunable,
} from "@/utilities/_module-exports.js";
import { TimeSpan } from "@/utilities/_module-exports.js";
import type { ExpressionWrapper, SqlBool, Kysely } from "kysely";

/**
 * @internal
 */
type KyselyCacheTable = {
    key: string;
    value: string;
    // In ms since unix epoch
    expiration: number | null;
};

/**
 * @internal
 */
type KyselyTables = {
    cache: KyselyCacheTable;
};

/**
 * @internal
 */
type KyselySettings = {
    database: Kysely<KyselyTables>;
    serde: ISerde<string>;

    /**
     * @default {false}
     */
    disableTransaction?: boolean;

    /**
     * @default
     * ```ts
     * TimeSpan.fromMinutes(1)
     * ```
     */
    expiredKeysRemovalInterval?: TimeSpan;

    /**
     * @default {true}
     */
    shouldRemoveExpiredKeys?: boolean;
};

/**
 * @internal
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
            eb: ExpressionBuilder<KyselyTables, "cache">,
        ): ExpressionWrapper<KyselyTables, "cache", SqlBool> => {
            const hasNoExpiration = eb("cache.expiration", "is", null);
            const hasExpiration = eb("cache.expiration", "is not", null);
            const hasNotExpired = eb(
                "cache.expiration",
                ">",
                new Date().getTime(),
            );
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
            eb: ExpressionBuilder<KyselyTables, "cache">,
        ): ExpressionWrapper<KyselyTables, "cache", SqlBool> => {
            const keysMatch = eb("cache.key", "in", keys);
            const hasExpiration = eb("cache.expiration", "is not", null);
            const hasExpired = eb(
                "cache.expiration",
                "<=",
                new Date().getTime(),
            );
            return eb.and([keysMatch, hasExpiration, hasExpired]);
        };
    }

    private readonly serde: ISerde<string>;
    private readonly database: Kysely<KyselyTables>;
    private readonly shouldRemoveExpiredKeys: boolean;
    private readonly expiredKeysRemovalInterval: TimeSpan;
    private timeoutId: NodeJS.Timeout | string | number | null = null;
    private readonly disableTransaction: boolean;

    constructor(settings: KyselySettings) {
        const {
            database,
            serde,
            disableTransaction = false,
            expiredKeysRemovalInterval = TimeSpan.fromMinutes(1),
            shouldRemoveExpiredKeys = true,
        } = settings;
        this.disableTransaction = disableTransaction;
        this.database = database;
        this.serde = serde;
        this.expiredKeysRemovalInterval = expiredKeysRemovalInterval;
        this.shouldRemoveExpiredKeys = shouldRemoveExpiredKeys;
    }

    async removeAllExpired(): Promise<void> {
        await this.database
            .deleteFrom("cache")
            .where("cache.expiration", "<=", new Date().getTime())
            .execute();
    }

    async init(): Promise<void> {
        await this.database.schema
            .createTable("cache")
            .ifNotExists()
            .addColumn("key", "text", (col) => col.primaryKey())
            .addColumn("value", "text")
            .addColumn("expiration", "integer")
            .execute();
        await this.database.schema
            .createIndex("cache_expiration")
            .ifNotExists()
            .on("cache")
            .columns(["expiration"])
            .execute();
        if (this.shouldRemoveExpiredKeys && this.timeoutId === null) {
            this.timeoutId = setTimeout(() => {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                this.removeAllExpired();
            }, this.expiredKeysRemovalInterval.toMilliseconds());
        }
    }

    async deInit(): Promise<void> {
        if (this.shouldRemoveExpiredKeys && this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
        }
        await this.database.schema
            .dropIndex("cache_expiration")
            .ifExists()
            .on("cache")
            .execute();
        await this.database.schema.dropTable("cache").ifExists().execute();
    }

    async find(key: string): Promise<ICacheData<TType> | null> {
        const row = await this.database
            .selectFrom("cache")
            .where("cache.key", "=", key)
            .select(["cache.expiration", "cache.value"])
            .executeTakeFirst();
        if (row === undefined) {
            return null;
        }
        return {
            value: this.serde.deserialize(row.value),
            expiration: row.expiration ? new Date(row.expiration) : null,
        };
    }

    async insert(data: ICacheInsert<TType>): Promise<void> {
        await this.database
            .insertInto("cache")
            .values({
                key: data.key,
                value: this.serde.serialize(data.value),
                expiration: data.expiration?.getTime() ?? null,
            })
            .executeTakeFirst();
    }

    private async transaction<TReturn>(
        fn: (trx: Transaction<KyselyTables>) => Promise<TReturn>,
    ): Promise<TReturn> {
        if (this.disableTransaction) {
            return fn(this.database as Transaction<KyselyTables>);
        }
        return await this.database.transaction().execute(fn);
    }

    async upsert(data: ICacheInsert<TType>): Promise<ICacheData<TType> | null> {
        const expiration = data.expiration?.getTime() ?? null;
        return await this.transaction(async (trx) => {
            const prevRow = await trx
                .selectFrom("cache")
                .select(["cache.key", "cache.value", "cache.expiration"])
                .where(KyselyCacheAdapter.filterUnexpiredKeys([data.key]))
                .executeTakeFirst();

            try {
                await trx
                    .insertInto("cache")
                    .values({
                        key: data.key,
                        value: this.serde.serialize(data.value),
                        expiration,
                    })
                    .executeTakeFirst();
            } catch {
                await trx
                    .updateTable("cache")
                    .where("cache.key", "=", data.key)
                    .set({
                        value: this.serde.serialize(data.value),
                        expiration,
                    })
                    .executeTakeFirst();
            }

            if (prevRow === undefined) {
                return null;
            }
            return {
                value: this.serde.deserialize(prevRow.value),
                expiration: prevRow.expiration
                    ? new Date(prevRow.expiration)
                    : null,
            };
        });
    }

    async updateExpired(data: ICacheInsert<TType>): Promise<number> {
        const updateResult = await this.database
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
        const updateResult = await this.database
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
                throw new TypeCacheError(
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
        const deleteResult = await this.database
            .deleteFrom("cache")
            .where(KyselyCacheAdapter.filterExpiredKeys(keys))
            .executeTakeFirst();
        return Number(deleteResult.numDeletedRows);
    }

    async removeUnexpiredMany(keys: string[]): Promise<number> {
        const deleteResult = await this.database
            .deleteFrom("cache")
            .where(KyselyCacheAdapter.filterUnexpiredKeys(keys))
            .executeTakeFirst();
        return Number(deleteResult.numDeletedRows);
    }

    async removeAll(): Promise<void> {
        await this.database.deleteFrom("cache").execute();
    }

    async removeByKeyPrefix(prefix: string): Promise<void> {
        await this.database
            .deleteFrom("cache")
            .where("cache.key", "like", `${prefix}%`)
            .execute();
    }
}
