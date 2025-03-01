import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { cacheAdapterTestSuite } from "@/cache/implementations/test-utilities/_module-exports.js";
import { SqliteCacheAdapter } from "@/cache/implementations/adapters/_module-exports.js";
import Sqlite, { type Database } from "better-sqlite3";
import { Serde } from "@/serde/implementations/derivables/_module-exports.js";
import { SuperJsonSerdeAdapter } from "@/serde/implementations/adapters/_module-exports.js";
import { DatabaseCacheAdapter } from "@/cache/implementations/derivables/_module-exports.js";

describe("class: DatabaseCacheAdapter", () => {
    let database: Database;
    beforeEach(() => {
        database = new Sqlite(":memory:");
    });
    afterEach(() => {
        database.close();
    });
    cacheAdapterTestSuite({
        createAdapter: async () => {
            const adapter = new SqliteCacheAdapter({
                database: database,
                tableName: "custom_table",
                shouldRemoveExpiredKeys: false,
                serde: new Serde(new SuperJsonSerdeAdapter()),
            });
            await adapter.init();
            return new DatabaseCacheAdapter(adapter);
        },
        test,
        beforeEach,
        expect,
        describe,
    });
});
