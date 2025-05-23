/**
 * @module Cache
 */

import type {
    ICacheData,
    ICacheInsert,
    ICacheUpdate,
    IDatabaseCacheAdapter,
} from "@/cache/contracts/_module-exports.js";
import type {
    TimeSpan,
    IDeinitizable,
    IInitizable,
    IPrunable,
} from "@/utilities/_module-exports.js";
import { KyselyCacheAdapter } from "@/cache/implementations/adapters/kysely-cache-adapter/_module.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SuperJsonSerdeAdapter } from "@/serde/implementations/adapters/_module-exports.js";
import { Kysely } from "kysely";
import type { LibsqlDialectConfig } from "@libsql/kysely-libsql";
import { LibsqlDialect } from "@libsql/kysely-libsql";
import { KyselyTableNameTransformerPlugin } from "@/utilities/_module-exports.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ISerde } from "@/serde/contracts/_module-exports.js";
import type { Client } from "@libsql/client";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/adapters"`
 * @group Adapters
 */
export type LibsqlCacheAdapterSettings = {
    database: Client;
    tableName?: string;
    serde: ISerde<string>;

    /**
     * @default {false}
     */
    disableTransaction?: boolean;

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
 * To utilize the `LibsqlCacheAdapter`, you must install the `"@libsql/client"` package and supply a {@link ISerde | `ISerde<string>`}, with an adapter like {@link SuperJsonSerdeAdapter | `SuperJsonSerdeAdapter `}.
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/adapters"`
 * @group Adapters
 */
export class LibsqlCacheAdapter<TType = unknown>
    implements
        IDatabaseCacheAdapter<TType>,
        IInitizable,
        IDeinitizable,
        IPrunable
{
    private readonly adapter: KyselyCacheAdapter<TType>;

    /***
     * @example
     * ```ts
     * import { LibsqlCacheAdapter } from "@daiso-tech/core/cache/adapters";
     * import { Serde } from "@daiso-tech/core/serde";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
     * import { createClient } from "@libsql/client";
     *
     * const database = createClient({ url: "file:local.db" });
     * const serde = new Serde(new SuperJsonSerdeAdapter());
     * const cacheAdapter = new LibsqlCacheAdapter({
     *   database,
     *   serde,
     * });
     * // You need initialize the adapter once before using it.
     * await cacheAdapter.init();
     * ```
     */
    constructor(settings: LibsqlCacheAdapterSettings) {
        const {
            database,
            tableName = "cache",
            serde,
            disableTransaction,
            expiredKeysRemovalInterval,
            shouldRemoveExpiredKeys,
        } = settings;

        this.adapter = new KyselyCacheAdapter({
            database: new Kysely({
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
            disableTransaction,
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
