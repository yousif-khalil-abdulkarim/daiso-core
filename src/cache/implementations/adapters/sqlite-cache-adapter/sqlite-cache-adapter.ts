/**
 * @module Cache
 */

import {
    type ICacheData,
    type ICacheInsert,
    type ICacheUpdate,
    type IDatabaseCacheAdapter,
} from "@/cache/contracts/_module-exports.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SuperJsonSerdeAdapter } from "@/serde/implementations/adapters/_module-exports.js";
import {
    type TimeSpan,
    type IInitizable,
    type IDeinitizable,
    KyselyTableNameTransformerPlugin,
    type IPrunable,
    type ISqliteDatabase,
} from "@/utilities/_module-exports.js";
import { Kysely, SqliteDialect } from "kysely";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ISerde } from "@/serde/contracts/_module-exports.js";
import { KyselyCacheAdapter } from "@/cache/implementations/adapters/kysely-cache-adapter/_module.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/adapters"`
 * @group Adapters
 */
export type SqliteCacheAdapterSettings = {
    database: ISqliteDatabase;
    tableName?: string;
    serde: ISerde<string>;

    /**
     * @default
     * ```ts
     * import { TimeSpan } from "@daiso-tech/core/utilities";
     *
     * TimeSpan.fromMinutes(1);
     * ```
     */
    expiredKeysRemovalInterval?: TimeSpan;

    /**
     * @default {true}
     */
    shouldRemoveExpiredKeys?: boolean;
};

/**
 * To utilize the `SqliteCacheAdapter`, you must install the `"better-sqlite3"` package and supply a {@link ISerde | `ISerde<string>`}, with adapter like {@link SuperJsonSerdeAdapter | `SuperJsonSerdeAdapter `}.
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/adapters"`
 * @group Adapters
 */
export class SqliteCacheAdapter<TType = unknown>
    implements
        IDatabaseCacheAdapter<TType>,
        IInitizable,
        IDeinitizable,
        IPrunable
{
    private readonly adapter: KyselyCacheAdapter<TType>;

    /**
     * @example
     * ```ts
     * import { SqliteCacheAdapter } from "@daiso-tech/core/cache/adapters";
     * import { Serde } from "@daiso-tech/core/serde";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters"
     * import Sqlite from "better-sqlite3";
     *
     * const database = new Sqlite("local.db");
     * const serde = new Serde(new SuperJsonSerdeAdapter());
     * const cacheAdapter = new SqliteCacheAdapter({
     *   database,
     *   serde,
     * });
     * // You need initialize the adapter once before using it.
     * await cacheAdapter.init();
     * ```
     */
    constructor(settings: SqliteCacheAdapterSettings) {
        const {
            database,
            tableName = "cache",
            serde,
            expiredKeysRemovalInterval,
            shouldRemoveExpiredKeys,
        } = settings;

        this.adapter = new KyselyCacheAdapter({
            database: new Kysely({
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
            expiredKeysRemovalInterval,
            shouldRemoveExpiredKeys,
        });
    }

    async removeAllExpired(): Promise<void> {
        await this.adapter.removeAllExpired();
    }

    async deInit(): Promise<void> {
        await this.adapter.deInit();
    }

    async init(): Promise<void> {
        await this.adapter.init();
    }

    async insert(data: ICacheInsert<TType>): Promise<void> {
        await this.adapter.insert(data);
    }

    async upsert(data: ICacheInsert<TType>): Promise<ICacheData<TType> | null> {
        return await this.adapter.upsert(data);
    }

    async find(key: string): Promise<ICacheData<TType> | null> {
        return await this.adapter.find(key);
    }

    async updateExpired(data: ICacheInsert<TType>): Promise<number> {
        return await this.adapter.updateExpired(data);
    }

    async updateUnexpired(data: ICacheUpdate<TType>): Promise<number> {
        return await this.adapter.updateUnexpired(data);
    }

    async incrementUnexpired(data: ICacheUpdate<number>): Promise<number> {
        return await this.adapter.incrementUnexpired(data);
    }

    async removeUnexpiredMany(keys: string[]): Promise<number> {
        return await this.adapter.removeUnexpiredMany(keys);
    }

    async removeExpiredMany(keys: string[]): Promise<number> {
        return await this.adapter.removeExpiredMany(keys);
    }

    async removeAll(): Promise<void> {
        await this.adapter.removeAll();
    }

    async removeByKeyPrefix(prefix: string): Promise<void> {
        await this.adapter.removeByKeyPrefix(prefix);
    }
}
