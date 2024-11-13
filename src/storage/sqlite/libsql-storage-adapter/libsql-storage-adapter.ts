/**
 * @module Storage
 */

import { SuperJsonSerializer, type ISerializer } from "@/_module";
import { type IStorageAdapter } from "@/contracts/storage/_module";
import { SqlSerializer } from "@/serializer/sql-serializer/sql-serializer";
import { BaseSqliteStorageAdapter } from "@/storage/sqlite/_shared/_module";
import { type IInitizable } from "@/_shared/types";
import { Kysely } from "kysely";
import { KyselyTableNameTransformerPlugin } from "@/_shared/kysely/_module";
import { LibsqlDialect, type LibsqlDialectConfig } from "@libsql/kysely-libsql";
import type { Client } from "@libsql/client";

/**
 * @group Adapters
 */
export type LibsqlStorageAdapterSettings = {
    tableName?: string;
    serializer?: ISerializer<string>;
};
/**
 * @group Adapters
 */
export class LibsqlStorageAdapter<TType>
    implements IStorageAdapter<TType>, IInitizable
{
    private readonly storageAdapter: BaseSqliteStorageAdapter<TType>;

    constructor(
        client: Client,
        {
            tableName = "storage",
            serializer = new SuperJsonSerializer(),
        }: LibsqlStorageAdapterSettings = {},
    ) {
        this.storageAdapter = new BaseSqliteStorageAdapter(
            new Kysely({
                dialect: new LibsqlDialect({
                    client,
                } as LibsqlDialectConfig),
                plugins: [
                    new KyselyTableNameTransformerPlugin({
                        storage: tableName,
                    }),
                ],
            }),
            new SqlSerializer(serializer),
        );
    }

    async init(): Promise<void> {
        await this.storageAdapter.init();
    }

    async existsMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>> {
        return await this.storageAdapter.existsMany(keys);
    }

    async getMany<TValues extends TType, TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, TValues | null>> {
        return await this.storageAdapter.getMany(keys);
    }

    async updateMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, TValues>,
    ): Promise<Record<TKeys, boolean>> {
        return await this.storageAdapter.updateMany(values);
    }

    async addMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, TValues>,
    ): Promise<Record<TKeys, boolean>> {
        return await this.storageAdapter.addMany(values);
    }

    async putMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, TValues>,
    ): Promise<Record<TKeys, boolean>> {
        return await this.storageAdapter.putMany(values);
    }

    async removeMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>> {
        return await this.storageAdapter.removeMany(keys);
    }

    async increment(key: string, value: number): Promise<boolean> {
        return await this.storageAdapter.increment(key, value);
    }

    async clear(prefix: string): Promise<void> {
        await this.storageAdapter.clear(prefix);
    }
}
