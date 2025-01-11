/**
 * @module Storage
 */

import { SuperJsonSerializer } from "@/serializer/implementations/_module";
import type { ISerializer } from "@/serializer/contracts/_module";
import { type IStorageAdapter } from "@/storage/contracts/_module";
import { SqlSerializer } from "@/serializer/implementations/sql-serializer/sql-serializer";
import { BaseSqliteStorageAdapter } from "@/storage/implementations/adapters/sqlite/_shared/_module";
import type { IDeinitizable } from "@/_shared/types";
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
    implements IStorageAdapter<TType>, IInitizable, IDeinitizable
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

    /**
     * Creates the table
     */
    async init(): Promise<void> {
        await this.storageAdapter.init();
    }

    /**
     * Removes the table
     */
    async deInit(): Promise<void> {
        await this.storageAdapter.deInit();
    }

    async get(key: string): Promise<TType | null> {
        return await this.storageAdapter.get(key);
    }

    async add(key: string, value: TType): Promise<boolean> {
        return await this.storageAdapter.add(key, value);
    }

    async update(key: string, value: TType): Promise<boolean> {
        return await this.storageAdapter.update(key, value);
    }

    async put(key: string, value: TType): Promise<boolean> {
        return await this.storageAdapter.put(key, value);
    }

    async remove(key: string): Promise<boolean> {
        return await this.storageAdapter.remove(key);
    }

    async increment(key: string, value: number): Promise<boolean> {
        return await this.storageAdapter.increment(key, value);
    }

    async clear(prefix: string): Promise<void> {
        await this.storageAdapter.clear(prefix);
    }
}
