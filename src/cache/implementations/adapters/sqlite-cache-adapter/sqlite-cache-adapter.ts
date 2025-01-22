/**
 * @module Cache
 */

import { type ICacheAdapter } from "@/cache/contracts/cache-adapter.contract";
import type { ISerializer } from "@/serializer/contracts/_module";
import { SqlSerializer } from "@/serializer/implementations/_module";
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
    serializer: ISerializer<string>;
    enableTransactions?: boolean;
    expiredKeysRemovalInterval?: TimeSpan;
    shouldRemoveExpiredKeys?: boolean;
    rootGroup: OneOrMore<string>;
};

/**
 * To utilize the <i>SqliteCacheAdapter</i>, you must install the <i>"better-sqlite3"</i> package and supply a <i>{@link ISerializer | string serializer}</i>, such as <i>{@link SuperJsonSerializer}</i>.
 * @group Adapters
 * @example
 * ```ts
 * import { SqliteCacheAdapter, SuperJsonSerializer } from "@daiso-tech/core";
 * import Sqlite from "better-sqlite3";
 *
 * const client = new Sqlite("local.db");
 * const serializer = new SuperJsonSerializer();
 * const cacheAdapter = new SqliteCacheAdapter(client, {
 *   serializer,
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
export class SqliteCacheAdapter<TType>
    implements ICacheAdapter<TType>, IInitizable, IDeinitizable
{
    private readonly cacheAdapter: KyselySqliteCacheAdapter<TType>;

    constructor(database: Database, settings: SqliteStorageAdapterSettings) {
        const {
            tableName = "cache",
            serializer,
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
                serializer: new SqlSerializer(serializer),
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
