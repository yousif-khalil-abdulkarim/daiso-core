/**
 * @module Storage
 */

import { type IStorageAdapter } from "@/storage/contracts/storage-adapter.contract";
import { type Kysely, sql } from "kysely";
import { type ISerializer } from "@/serializer/contracts/_module";
import type { IDeinitizable } from "@/_shared/types";
import { type IInitizable } from "@/_shared/types";
import { TypeStorageError } from "@/storage/contracts/_module";

/**
 * @internal
 */
type BaseSqliteStorageTable = {
    key: string;
    value: string;
};
/**
 * @internal
 */
type BaseSqliteTables = {
    storage: BaseSqliteStorageTable;
};

/**
 * @internal
 */
export class BaseSqliteStorageAdapter<TType>
    implements IStorageAdapter<TType>, IInitizable, IDeinitizable
{
    constructor(
        private readonly db: Kysely<BaseSqliteTables>,
        private readonly serializer: ISerializer<string>,
    ) {}

    /**
     * Creates the table
     */
    async init(): Promise<void> {
        await this.db.schema
            .createTable("storage")
            .ifNotExists()
            .addColumn("key", "text", (cb) => cb.primaryKey())
            .addColumn("value", "text")
            .modifyEnd(sql`strict`)
            .execute();
    }

    /**
     * Removes the table
     */
    async deInit(): Promise<void> {
        await this.db.schema.dropTable("storage").ifExists().execute();
    }

    async get(key: string): Promise<TType | null> {
        const row = await this.db
            .selectFrom("storage")
            .where("storage.key", "=", key)
            .select("storage.value")
            .executeTakeFirst();
        if (row === undefined) {
            return null;
        }
        return await this.serializer.deserialize(row.value);
    }

    async add(key: string, value: TType): Promise<boolean> {
        const result = await this.db
            .insertInto("storage")
            .values([
                {
                    key,
                    value: await this.serializer.serialize(value),
                },
            ])
            .onConflict((cb) => cb.doNothing())
            .executeTakeFirst();
        return Number(result.numInsertedOrUpdatedRows) > 0;
    }

    async update(key: string, value: TType): Promise<boolean> {
        const result = await this.db
            .updateTable("storage")
            .where("storage.key", "=", key)
            .set({
                value: await this.serializer.serialize(value),
            })
            .executeTakeFirst();
        return Number(result.numUpdatedRows) > 0;
    }

    async put(key: string, value: TType): Promise<boolean> {
        const getValue = await this.get(key);
        if (getValue === null) {
            await this.add(key, value);
            return false;
        }
        await this.update(key, value);
        return true;
    }

    async remove(key: string): Promise<boolean> {
        const result = await this.db
            .deleteFrom("storage")
            .where("storage.key", "=", key)
            .executeTakeFirst();
        return Number(result.numDeletedRows) > 0;
    }

    async increment(key: string, value: number): Promise<boolean> {
        const sqlResult = await this.db
            .updateTable("storage")
            .set("value", (eb) => {
                const jsonRootValue = sql`typeof(${eb.ref("storage.value")} ->> '$')`;
                const isNumber = eb.or([
                    eb(jsonRootValue, "=", "real"),
                    eb(jsonRootValue, "=", "integer"),
                ]);
                const incrementJsonRootIfNumber = eb
                    .case()
                    .when(isNumber)
                    .then(sql`${eb.ref("storage.value")} ->> '$' + ${value}`)
                    .else(sql`${eb.ref("storage.value")} ->> '$'`)
                    .end();
                return sql`json_set(${eb.ref("storage.value")}, '$', ${incrementJsonRootIfNumber})`;
            })
            .where("storage.key", "=", key)
            .returning((eb) => {
                const jsonRootValue = sql`typeof(${eb.ref("storage.value")} ->> '$')`;
                const isNumber = eb.or([
                    eb(jsonRootValue, "=", "real"),
                    eb(jsonRootValue, "=", "integer"),
                ]);
                return isNumber.as("isNumber");
            })
            .executeTakeFirst();

        if (sqlResult === undefined) {
            return false;
        }

        const isTypeError = Number(sqlResult.isNumber.valueOf()) === 0;
        if (isTypeError) {
            throw new TypeStorageError(
                `Unable to increment or decrement none number type key "${key}"`,
            );
        }

        return true;
    }

    async clear(prefix: string): Promise<void> {
        await this.db
            .deleteFrom("storage")
            .where("key", "like", `${prefix}%`)
            .execute();
    }
}
