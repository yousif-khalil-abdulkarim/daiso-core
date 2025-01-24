/**
 * @module Cache
 */

import { type ICacheAdapter } from "@/cache/contracts/cache-adapter.contract";
import type { ISerde } from "@/serde/contracts/_module";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SuperJsonSerde } from "@/serde/implementations/_module";
import type {
    TimeSpan,
    IInitizable,
    IDeinitizable,
    OneOrMore,
} from "@/utilities/_module";
import { type Database } from "better-sqlite3";
import { KyselySqliteCacheAdapter } from "@/cache/implementations/adapters/kysely-sqlite-cache-adapter/_module";
import { Kysely, SqliteDialect } from "kysely";
import { KyselyTableNameTransformerPlugin } from "@/utilities/_module";

/**
 * @group Adapters
 */
export type SqliteStorageAdapterSettings = {
    tableName?: string;
    serde: ISerde<string>;
    enableTransactions?: boolean;
    expiredKeysRemovalInterval?: TimeSpan;
    shouldRemoveExpiredKeys?: boolean;
    rootGroup: OneOrMore<string>;
};

/**
 * To utilize the <i>SqliteCacheAdapter</i>, you must install the <i>"better-sqlite3"</i> package and supply a <i>{@link ISerde | ISerde<string> }</i>, such as <i>{@link SuperJsonSerde}</i>.
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
     * const client = new Sqlite("local.db");
     * const serde = new SuperJsonSerde();
     * const cacheAdapter = new SqliteCacheAdapter(client, {
     *   serde,
     *   rootGroup: "@global"
     * });
     *
     * (async () => {
     *   // You only need to call it once before using the adapter.
     *   await cacheAdapter.init();
     *   await cacheAdapter.add("a", 1);
     *
     *   // Will remove the cache
     *   await cacheAdapter.deInit();
     * })();
     * ```
     */
    constructor(database: Database, settings: SqliteStorageAdapterSettings) {
        const {
            tableName = "cache",
            serde,
            enableTransactions = false,
            expiredKeysRemovalInterval,
            shouldRemoveExpiredKeys,
            rootGroup,
        } = settings;

        this.cacheAdapter = new KyselySqliteCacheAdapter(
            new Kysely({
                dialect: new SqliteDialect({
                    database,
                }),
                plugins: [
                    new KyselyTableNameTransformerPlugin({
                        cache: tableName,
                    }),
                ],
            }),
            {
                serde,
                enableTransactions,
                expiredKeysRemovalInterval,
                shouldRemoveExpiredKeys,
                rootGroup,
            },
        );
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

    async deInit(): Promise<void> {
        await this.cacheAdapter.deInit();
    }

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
