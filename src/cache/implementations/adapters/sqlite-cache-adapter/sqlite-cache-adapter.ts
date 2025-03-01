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
} from "@/utilities/_module-exports.js";
import { Kysely, SqliteDialect, type SqliteDatabase } from "kysely";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ISerde } from "@/serde/contracts/_module-exports.js";
import { KyselyCacheAdapter } from "@/cache/implementations/adapters/kysely-cache-adapter/_module.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/implementations/adapters"```
 * @group Adapters
 */
export type SqliteCacheAdapterSettings = {
    database: SqliteDatabase;
    tableName?: string;
    serde: ISerde<string>;
    expiredKeysRemovalInterval?: TimeSpan;
    shouldRemoveExpiredKeys?: boolean;
};

/**
 * To utilize the <i>SqliteCacheAdapter</i>, you must install the <i>"better-sqlite3"</i> package and supply a <i>{@link ISerde | ISerde<string> }</i>, with adapter like <i>{@link SuperJsonSerdeAdapter}</i>.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/implementations/adapters"```
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
     * import { SqliteCacheAdapter } from "@daiso-tech/core/cache/implementations/adapters";
     * import { Serde } from "@daiso-tech/core/serde/implementations/derivables";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/implementations/adapters"
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

    async removeByKeyPrefix(prefix: string): Promise<void> {
        await this.adapter.removeByKeyPrefix(prefix);
    }
}
