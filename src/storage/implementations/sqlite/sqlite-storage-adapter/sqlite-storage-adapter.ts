/**
 * @module Storage
 */

import { SuperJsonSerializer } from "@/serializer/implementations/_module";
import type { ISerializer } from "@/serializer/contracts/_module";
import { type IStorageAdapter } from "@/storage/contracts/_module";
import { SqlSerializer } from "@/serializer/implementations/sql-serializer/sql-serializer";
import { type Database } from "better-sqlite3";
import { BaseSqliteStorageAdapter } from "@/storage/implementations/sqlite/_shared/_module";
import { type IInitizable } from "@/_shared/types";
import { Kysely, SqliteDialect } from "kysely";
import { KyselyTableNameTransformerPlugin } from "@/_shared/kysely/_module";

/**
 * @group Adapters
 */
export type SqliteStorageAdapterSettings = {
    tableName?: string;
    serializer?: ISerializer<string>;
};
/**
 * @group Adapters
 */
export class SqliteStorageAdapter<TType>
    implements IStorageAdapter<TType>, IInitizable
{
    private readonly storageAdapter: BaseSqliteStorageAdapter<TType>;

    constructor(
        database: Database,
        {
            tableName = "storage",
            serializer = new SuperJsonSerializer(),
        }: SqliteStorageAdapterSettings = {},
    ) {
        this.storageAdapter = new BaseSqliteStorageAdapter(
            new Kysely({
                dialect: new SqliteDialect({
                    database,
                }),
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

    async getMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, TType | null>> {
        return await this.storageAdapter.getMany(keys);
    }

    async addMany<TKeys extends string>(
        values: Record<TKeys, TType>,
    ): Promise<Record<TKeys, boolean>> {
        return await this.storageAdapter.addMany(values);
    }

    async updateMany<TKeys extends string>(
        values: Record<TKeys, TType>,
    ): Promise<Record<TKeys, boolean>> {
        return await this.storageAdapter.updateMany(values);
    }

    async putMany<TKeys extends string>(
        values: Record<TKeys, TType>,
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
