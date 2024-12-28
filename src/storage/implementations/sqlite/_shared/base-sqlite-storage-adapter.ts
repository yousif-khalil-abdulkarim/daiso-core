/**
 * @module Storage
 */

import { type IStorageAdapter } from "@/storage/contracts/storage-adapter.contract";
import { type Generated, type Insertable, type Kysely, sql } from "kysely";
import { type ISerializer } from "@/serializer/contracts/_module";
import { type RecordItem, type IInitizable } from "@/_shared/types";
import { TypeStorageError } from "@/storage/contracts/_module";

/**
 * @internal
 */
type BaseSqliteStorageTable = {
    key: string;
    value: string;
    hasBeenUpdated: Generated<1 | 0>;
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
    implements IStorageAdapter<TType>, IInitizable
{
    constructor(
        private readonly db: Kysely<BaseSqliteTables>,
        private readonly serializer: ISerializer<string>,
    ) {}

    async init(): Promise<void> {
        await this.db.schema
            .createTable("storage")
            .ifNotExists()
            .addColumn("key", "text", (cb) => cb.primaryKey())
            .addColumn("value", "text")
            .addColumn("hasBeenUpdated", "integer", (cb) => cb.defaultTo(0))
            .modifyEnd(sql`strict`)
            .execute();
    }

    async existsMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>> {
        const sqlResult = await this.db
            .selectFrom("storage")
            .select("storage.key")
            .where("storage.key", "in", keys)
            .execute();

        const results = Object.fromEntries(keys.map((key) => [key, false]));
        for (const { key } of sqlResult) {
            results[key] = true;
        }

        return results as Record<TKeys, boolean>;
    }

    async getMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, TType | null>> {
        const sqlResult = await this.db
            .selectFrom("storage")
            .select(["storage.key", "storage.value"])
            .where("storage.key", "in", keys)
            .execute();

        const results = Object.fromEntries(
            keys.map<RecordItem<string, TType | null>>((key) => [key, null]),
        );
        for (const { key, value } of sqlResult) {
            results[key] = await this.serializer.deserialize(value);
        }

        return results as Record<TKeys, TType | null>;
    }

    async addMany<TKeys extends string>(
        values: Record<TKeys, TType>,
    ): Promise<Record<TKeys, boolean>> {
        const rows: Insertable<BaseSqliteStorageTable>[] = [];
        for (const key in values) {
            const { [key]: value } = values;
            rows.push({
                key,
                value: await this.serializer.serialize(value),
            });
        }

        const sqlResult = await this.db
            .insertInto("storage")
            .values(rows)
            .onConflict((b) => b.doNothing())
            .returning("storage.key")
            .execute();

        const results = Object.fromEntries(
            Object.keys(values).map((key) => [key, false]),
        );
        for (const { key } of sqlResult) {
            results[key] = true;
        }

        return results as Record<TKeys, boolean>;
    }

    async updateMany<TKeys extends string>(
        values: Record<TKeys, TType>,
    ): Promise<Record<TKeys, boolean>> {
        const rows: Insertable<BaseSqliteStorageTable>[] = [];
        for (const key in values) {
            const { [key]: value } = values;
            rows.push({
                key,
                value: await this.serializer.serialize(value),
            });
        }

        const sqlResults = await this.db
            .updateTable("storage")
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            .set((eb) => {
                let value = eb.case();
                for (const row of rows) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    value = value
                        .when("storage.key", "=", row.key)
                        .then(row.value);
                }
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                value = value.end();
                return {
                    value,
                    hasBeenUpdated: 1,
                };
            })
            .where("storage.key", "in", Object.keys(values))
            .returning("storage.key")
            .execute();

        const results = Object.fromEntries(
            Object.keys(values).map((key) => [key, false]),
        );
        for (const { key } of sqlResults) {
            results[key] = true;
        }

        return results as Record<TKeys, boolean>;
    }

    async removeMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>> {
        const sqlResult = await this.db
            .deleteFrom("storage")
            .where("storage.key", "in", keys)
            .returning("storage.key")
            .execute();

        const results = Object.fromEntries(keys.map((key) => [key, false]));
        for (const { key } of sqlResult) {
            results[key] = true;
        }

        return results as Record<TKeys, boolean>;
    }

    async putMany<TKeys extends string>(
        values: Record<TKeys, TType>,
    ): Promise<Record<TKeys, boolean>> {
        const rows: Insertable<BaseSqliteStorageTable>[] = [];
        for (const key in values) {
            const { [key]: value } = values;
            rows.push({
                key,
                value: await this.serializer.serialize(value),
            });
        }

        const sqlResults = await this.db
            .insertInto("storage")
            .values(rows)
            .onConflict((eb) =>
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                eb.column("key").doUpdateSet((eb) => {
                    let value = eb.case();
                    for (const row of rows) {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        value = value
                            .when("storage.key", "=", row.key)
                            .then(row.value);
                    }

                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                    value = value.end();
                    return {
                        value,
                        hasBeenUpdated: 1,
                    };
                }),
            )
            .returning(["storage.key", "storage.hasBeenUpdated"])
            .execute();

        const results = Object.fromEntries(
            Object.keys(values).map((key) => [key, false]),
        );
        for (const { hasBeenUpdated, key } of sqlResults) {
            results[key] = hasBeenUpdated === 1;
        }

        return results as Record<TKeys, boolean>;
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
