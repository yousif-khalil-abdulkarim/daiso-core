/**
 * @module Cache
 */

import { type ICacheAdapter } from "@/cache/contracts/cache-adapter.contract";
import type { ISerializer } from "@/serializer/contracts/_module";
import type { TimeSpan, IDeinitizable, IInitizable } from "@/utilities/_module";
import type { Client } from "@libsql/client";
import { KyselySqliteCacheAdapter } from "@/cache/implementations/adapters/kysely-sqlite-cache-adapter/_module";
import {
    SqlSerializer,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    SuperJsonSerializer,
} from "@/serializer/implementations/_module";
import { Kysely } from "kysely";
import type { LibsqlDialectConfig } from "@libsql/kysely-libsql";
import { LibsqlDialect } from "@libsql/kysely-libsql";
import { KyselyTableNameTransformerPlugin } from "@/utilities/_module";

/**
 * @group Adapters
 */
export type LibsqlCacheAdapterSettings = {
    tableName?: string;
    serializer: ISerializer<string>;
    enableTransactions?: boolean;
    expiredKeysRemovalInterval?: TimeSpan;
    shouldRemoveExpiredKeys?: boolean;
};

/**
 * To utilize the <i>LibsqlCacheAdapter</i>, you must install the <i>"@libsql/client"</i> package and supply a <i>{@link ISerializer | string serializer}</i>, such as <i>{@link SuperJsonSerializer}</i>.
 * @group Adapters
 * @example
 * ```ts
 * import { LibsqlCacheAdapter, SuperJsonSerializer } from "@daiso-tech/core";
 * import { createClient } from "@libsql/client";
 *
 * (async () => {
 *   const client = createClient({ url: "file:local.db" });
 *   const serializer = new SuperJsonSerializer();
 *   const cacheAdapter = new LibsqlCacheAdapter(client, {
 *     serializer,
 *   });
 *   // You only need to call it once before using the adapter.
 *   await cacheAdapter.init();
 *   await cacheAdapter.add("a", 1);
 *
 *   // Will remove the cache
 *   await cacheAdapter.deInit();
 * })();
 * ```
 */
export class LibsqlCacheAdapter<TType>
    implements ICacheAdapter<TType>, IInitizable, IDeinitizable
{
    private readonly cacheAdapter: KyselySqliteCacheAdapter<TType>;

    constructor(client: Client, settings: LibsqlCacheAdapterSettings) {
        const {
            tableName = "cache",
            serializer,
            enableTransactions = false,
            expiredKeysRemovalInterval,
            shouldRemoveExpiredKeys,
        } = settings;

        this.cacheAdapter = new KyselySqliteCacheAdapter(
            new Kysely({
                dialect: new LibsqlDialect({
                    client,
                } as LibsqlDialectConfig),
                plugins: [
                    new KyselyTableNameTransformerPlugin({
                        cache: tableName,
                    }),
                ],
            }),
            {
                serializer: new SqlSerializer(serializer),
                enableTransactions,
                expiredKeysRemovalInterval,
                shouldRemoveExpiredKeys,
            },
        );
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

    async clear(prefix: string): Promise<void> {
        await this.cacheAdapter.clear(prefix);
    }
}
