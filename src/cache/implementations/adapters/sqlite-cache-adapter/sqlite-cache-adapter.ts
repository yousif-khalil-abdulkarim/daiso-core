/**
 * @module Cache
 */

import { type ICacheAdapter } from "@/cache/contracts/cache-adapter.contract";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SuperJsonSerdeAdapter } from "@/serde/implementations/adapters/_module";
import type { TimeSpan, IInitizable, IDeinitizable } from "@/utilities/_module";
import { KyselySqliteCacheAdapter } from "@/cache/implementations/adapters/kysely-sqlite-cache-adapter/_module";
import type { SqliteDatabase } from "kysely";
import { Kysely, SqliteDialect } from "kysely";
import { KyselyTableNameTransformerPlugin } from "@/utilities/_module";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ISerde } from "@/serde/contracts/_module";

/**
 * @group Adapters
 */
export type SqliteCacheAdapterSettings = {
    database: SqliteDatabase;
    tableName?: string;
    serde: ISerde<string>;
    enableTransactions?: boolean;
    expiredKeysRemovalInterval?: TimeSpan;
    shouldRemoveExpiredKeys?: boolean;
    rootGroup: string;
};

/**
 * To utilize the <i>SqliteCacheAdapter</i>, you must install the <i>"better-sqlite3"</i> package and supply a <i>{@link ISerde | ISerde<string> }</i>, with adapter like <i>{@link SuperJsonSerdeAdapter}</i>.
 * @group Adapters
 */
export class SqliteCacheAdapter<TType = unknown>
    implements ICacheAdapter<TType>, IInitizable, IDeinitizable
{
    private readonly cacheAdapter: KyselySqliteCacheAdapter<TType>;

    /**
     * @example
     * ```ts
     * import { SqliteCacheAdapter, SuperJsonSerde } from "@daiso-tech/core";
     * import Sqlite from "better-sqlite3";
     *
     * (async () => {
     *   const database = new Sqlite("local.db");
     *   const serde = new SuperJsonSerde();
     *   const cacheAdapter = new SqliteCacheAdapter({
     *     database,
     *     serde,
     *     rootGroup: "@global"
     *   });
     *   await cacheAdapter.init();
     * })();
     * ```
     */
    constructor(settings: SqliteCacheAdapterSettings) {
        const {
            database,
            tableName = "cache",
            serde,
            enableTransactions = false,
            expiredKeysRemovalInterval,
            shouldRemoveExpiredKeys,
            rootGroup,
        } = settings;

        this.cacheAdapter = new KyselySqliteCacheAdapter({
            db: new Kysely({
                dialect: new SqliteDialect({
                    database: database,
                }),
                plugins: [
                    new KyselyTableNameTransformerPlugin({
                        cache: tableName,
                    }),
                ],
            }),
            serde,
            enableTransactions,
            expiredKeysRemovalInterval,
            shouldRemoveExpiredKeys,
            rootGroup,
        });
    }

    getGroup(): string {
        return this.cacheAdapter.getGroup();
    }

    withGroup(group: string): ICacheAdapter<TType> {
        return this.cacheAdapter.withGroup(group);
    }

    async removeExpiredKeys(): Promise<void> {
        await this.cacheAdapter.removeExpiredKeys();
    }

    /**
     * Removes the table where the cache values are stored and removes the table indexes.
     * Note all cache data will be removed.
     */
    async deInit(): Promise<void> {
        await this.cacheAdapter.deInit();
    }

    /**
     * Creates the table where the cache values are stored and it's related indexes.
     * Note the <i>init</i> method needs to be called before using the adapter.
     */
    async init(): Promise<void> {
        await this.cacheAdapter.init();
    }

    async get(key: string): Promise<TType | null> {
        return await this.cacheAdapter.get(key);
    }

    async add(
        key: string,
        value: TType,
        ttl: TimeSpan | null,
    ): Promise<boolean> {
        return await this.cacheAdapter.add(key, value, ttl);
    }

    async update(key: string, value: TType): Promise<boolean> {
        return await this.cacheAdapter.update(key, value);
    }

    async put(
        key: string,
        value: TType,
        ttl: TimeSpan | null,
    ): Promise<boolean> {
        return await this.cacheAdapter.put(key, value, ttl);
    }

    async remove(key: string): Promise<boolean> {
        return await this.cacheAdapter.remove(key);
    }

    async increment(key: string, value: number): Promise<boolean> {
        return await this.cacheAdapter.increment(key, value);
    }

    async clear(): Promise<void> {
        await this.cacheAdapter.clear();
    }
}
