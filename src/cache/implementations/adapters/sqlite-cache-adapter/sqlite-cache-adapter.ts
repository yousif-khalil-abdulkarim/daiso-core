/**
 * @module Cache
 */

import type { IDeinitizable, IInitizable } from "@/_shared/types";
import { type ICacheAdapter } from "@/cache/contracts/cache-adapter.contract";
import type { ISerializer } from "@/serializer/contracts/_module";
import { SqlSerializer } from "@/serializer/implementations/_module";
import type { TimeSpan } from "@/utilities/_module";
import { type Database } from "better-sqlite3";
import { KyselySqliteCacheAdapter } from "@/cache/implementations/adapters/kysely-sqlite-cache-adapter/_module";
import { Kysely, SqliteDialect } from "kysely";
import { KyselyTableNameTransformerPlugin } from "@/_shared/kysely/kysely-table-name-transformer-plugin";

/**
 * @group Adapters
 */
export type SqliteStorageAdapterSettings = {
    tableName?: string;
    serializer: ISerializer<string>;
    enableTransactions?: boolean;
    expiredKeysRemovalInterval?: TimeSpan;
    shouldRemoveExpiredKeys?: boolean;
};

/**
 * @group Adapters
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
