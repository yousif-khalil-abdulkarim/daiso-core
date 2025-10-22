import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { databaseCacheAdapterTestSuite } from "@/cache/implementations/test-utilities/_module-exports.js";
import { KyselyCacheAdapter } from "@/cache/implementations/adapters/kysely-cache-adapter/_module-exports.js";
import Sqlite, { type Database } from "better-sqlite3";
import { Serde } from "@/serde/implementations/derivables/_module-exports.js";
import { SuperJsonSerdeAdapter } from "@/serde/implementations/adapters/_module-exports.js";
import { Kysely, SqliteDialect } from "kysely";

describe("sqlite class: KyselyCacheAdapter", () => {
    let database: Database;
    beforeEach(() => {
        database = new Sqlite(":memory:");
    });
    afterEach(() => {
        database.close();
    });
    databaseCacheAdapterTestSuite({
        createAdapter: async () => {
            const adapter = new KyselyCacheAdapter({
                kysely: new Kysely({
                    dialect: new SqliteDialect({
                        database,
                    }),
                }),
                shouldRemoveExpiredKeys: false,
                serde: new Serde(new SuperJsonSerdeAdapter()),
            });
            await adapter.init();
            return adapter;
        },
        test,
        beforeEach,
        expect,
        describe,
    });
});
