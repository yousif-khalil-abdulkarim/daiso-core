import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { cacheAdapterTestSuite } from "@/cache/implementations/test-utilities/_module-exports.js";
import Sqlite, { type Database } from "better-sqlite3";
import { SqliteCacheAdapter } from "@/cache/implementations/adapters/sqlite-cache-adapter/sqlite-cache-adapter.js";
import { Serde } from "@/serde/implementations/derivables/_module-exports.js";
import { SuperJsonSerdeAdapter } from "@/serde/implementations/adapters/_module-exports.js";

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
                serde: new Serde(new SuperJsonSerdeAdapter()),
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
