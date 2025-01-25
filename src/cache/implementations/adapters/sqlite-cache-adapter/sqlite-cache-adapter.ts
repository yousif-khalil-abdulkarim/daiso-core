/**
 * @module Cache
 */

import { type ICacheAdapter } from "@/cache/contracts/cache-adapter.contract";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SuperJsonSerde } from "@/serde/implementations/_module";
import type {
    TimeSpan,
    IInitizable,
    IDeinitizable,
    OneOrMore,
} from "@/utilities/_module";
import { KyselySqliteCacheAdapter } from "@/cache/implementations/adapters/kysely-sqlite-cache-adapter/_module";
import { Kysely, SqliteDialect } from "kysely";
import { KyselyTableNameTransformerPlugin } from "@/utilities/_module";
import type { SqliteCacheAdapterSettings } from "@/cache/implementations/adapters/sqlite-cache-adapter/sqlite-cache-adapter-settings";
import { SqliteCacheAdapterSettingsBuilder } from "@/cache/implementations/adapters/sqlite-cache-adapter/sqlite-cache-adapter-settings";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ISerde } from "@/serde/contracts/_module";

/**
 * To utilize the <i>SqliteCacheAdapter</i>, you must install the <i>"better-sqlite3"</i> package and supply a <i>{@link ISerde | ISerde<string> }</i>, such as <i>{@link SuperJsonSerde}</i>.
 * @group Adapters
 */
export class SqliteCacheAdapter<TType = unknown>
    implements ICacheAdapter<TType>, IInitizable, IDeinitizable
{
    /**
     * @example
     * ```ts
     * import { LibsqlCacheAdapter, SuperJsonSerde } from "@daiso-tech/core";
     * import Sqlite from "better-sqlite3";
     *
     * const cacheAdapter = new SqliteCacheAdapter(
     *   SqliteCacheAdapter
     *     .settings()
     *     .setDatabase(new Sqlite("local.db"))
     *     .setSerde(new SuperJsonSerde())
     *     .setRootGroup("@global")
     *     .build()
     * );
     * ```
     */
    static settings<
        TSettings extends Partial<SqliteCacheAdapterSettings>,
    >(): SqliteCacheAdapterSettingsBuilder<TSettings> {
        return new SqliteCacheAdapterSettingsBuilder();
    }

    private readonly cacheAdapter: KyselySqliteCacheAdapter<TType>;

    /**
     * @example
     * ```ts
     * import { SqliteCacheAdapter, SuperJsonSerde } from "@daiso-tech/core";
     * import Sqlite from "better-sqlite3";
     *
     * const database = new Sqlite("local.db");
     * const serde = new SuperJsonSerde();
     * const cacheAdapter = new SqliteCacheAdapter({
     *   database,
     *   serde,
     *   rootGroup: "@global"
     * });
     *
     * (async () => {
     *   await cacheAdapter.init();
     *   await cacheAdapter.add("a", 1);
     *   await cacheAdapter.deInit();
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
        return this.getGroup();
    }

    withGroup(group: OneOrMore<string>): ICacheAdapter<TType> {
        return this.withGroup(group);
    }

    async removeExpiredKeys(): Promise<void> {
        await this.cacheAdapter.removeExpiredKeys();
    }

    /**
     * Removes the table where the cache values are stored and removes the table indexes.
     */
    async deInit(): Promise<void> {
        await this.cacheAdapter.deInit();
    }

    /**
     * Creates the table where the cache values are stored and it's related indexes.
     */
    async init(): Promise<void> {
        await this.cacheAdapter.init();
    }

    async exists(key: string): Promise<boolean> {
        return await this.cacheAdapter.exists(key);
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
