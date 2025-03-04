import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { cacheTestSuite } from "@/cache/implementations/test-utilities/_module-exports.js";
import {
    MemoryCacheAdapter,
    SqliteCacheAdapter,
} from "@/cache/implementations/adapters/_module-exports.js";
import { Cache } from "@/cache/implementations/derivables/_module-exports.js";
import { KeyPrefixer } from "@/utilities/_module-exports.js";
import Sqlite, { type Database } from "better-sqlite3";
import { Serde } from "@/serde/implementations/derivables/serde.js";
import { SuperJsonSerdeAdapter } from "@/serde/implementations/adapters/_module-exports.js";

describe("class: Cache", () => {
    describe("Without factory:", () => {
        cacheTestSuite({
            createCache: () =>
                new Cache({
                    keyPrefixer: new KeyPrefixer("cache"),
                    adapter: new MemoryCacheAdapter(),
                }),
            test,
            beforeEach,
            expect,
            describe,
        });
    });
    describe("With factory:", () => {
        let database: Database;
        beforeEach(() => {
            database = new Sqlite(":memory:");
        });
        afterEach(() => {
            database.close();
        });
        cacheTestSuite({
            createCache: () => {
                return new Cache({
                    adapter: async (
                        prefix: string,
                    ): Promise<SqliteCacheAdapter> => {
                        const tableName = `custom_table_${prefix}`;
                        const adapter = new SqliteCacheAdapter({
                            serde: new Serde(new SuperJsonSerdeAdapter()),
                            database,
                            tableName,
                            shouldRemoveExpiredKeys: false,
                        });
                        await adapter.init();
                        return adapter;
                    },
                    keyPrefixer: new KeyPrefixer("cache"),
                });
            },
            beforeEach,
            describe,
            expect,
            test,
        });
    });
});
