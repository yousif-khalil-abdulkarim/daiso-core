/**
 * @module Cache
 */

import { type ICacheAdapter } from "@/cache/contracts/cache-adapter.contract";
import type { TimeSpan, IDeinitizable, IInitizable } from "@/utilities/_module";
import { KyselySqliteCacheAdapter } from "@/cache/implementations/adapters/kysely-sqlite-cache-adapter/_module";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SuperJsonSerdeAdapter } from "@/serde/implementations/_module";
import { Kysely } from "kysely";
import type { LibsqlDialectConfig } from "@libsql/kysely-libsql";
import { LibsqlDialect } from "@libsql/kysely-libsql";
import { KyselyTableNameTransformerPlugin } from "@/utilities/_module";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ISerde } from "@/serde/contracts/_module";
import type { Client } from "@libsql/client";

/**
 * @group Adapters
 */
export type LibsqlCacheAdapterSettings = {
    database: Client;
    tableName?: string;
    serde: ISerde<string>;
    enableTransactions?: boolean;
    expiredKeysRemovalInterval?: TimeSpan;
    shouldRemoveExpiredKeys?: boolean;
    rootGroup: string;
};

/**
 * To utilize the <i>LibsqlCacheAdapter</i>, you must install the <i>"@libsql/client"</i> package and supply a <i>{@link ISerde | ISerde<string> }</i>, with an adapter like <i>{@link SuperJsonSerdeAdapter}</i>.
 * @group Adapters
 */
export class LibsqlCacheAdapter<TType = unknown>
    implements ICacheAdapter<TType>, IInitizable, IDeinitizable
{
    private readonly cacheAdapter: KyselySqliteCacheAdapter<TType>;

    /***
     * @example
     * ```ts
     * import { LibsqlCacheAdapter, SuperJsonSerde } from "@daiso-tech/core";
     * import { createClient } from "@libsql/client";
     *
     * (async () => {
     *   const database = createClient({ url: "file:local.db" });
     *   const serde = new SuperJsonSerde();
     *   const cacheAdapter = new LibsqlCacheAdapter({
     *     database,
     *     serde,
     *     rootGroup: "@global"
     *   });
     *   await cacheAdapter.init();
     * })();
     * ```
     */
    constructor(settings: LibsqlCacheAdapterSettings) {
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
                dialect: new LibsqlDialect({
                    client: database,
                } as LibsqlDialectConfig),
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
