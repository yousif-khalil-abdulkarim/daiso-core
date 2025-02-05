import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { cacheAdapterTestSuite } from "@/cache/implementations/_shared/_module";
import Sqlite, { type Database } from "better-sqlite3";
import { SqliteCacheAdapter } from "@/cache/implementations/adapters/sqlite-cache-adapter/sqlite-cache-adapter";
import { SuperJsonSerde } from "@/serde/implementations/_module";

describe("class: SqliteCacheAdapter", () => {
    let database: Database;
    beforeEach(() => {
        database = new Sqlite(":memory:");
    });
    afterEach(() => {
        database.close();
    });
    cacheAdapterTestSuite({
        createAdapter: async () => {
            const cacheAdapter = new SqliteCacheAdapter({
                database: database,
                tableName: "custom_table",
                enableTransactions: true,
                shouldRemoveExpiredKeys: false,
                serde: new SuperJsonSerde(),
                rootGroup: "@a",
            });
            await cacheAdapter.init();
            return cacheAdapter;
        },
        test,
        beforeEach,
        expect,
        describe,
    });
});
