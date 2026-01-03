import Sqlite, { type Database } from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { KyselyCacheAdapter } from "@/cache/implementations/adapters/_module.js";
import { DatabaseCacheAdapter } from "@/cache/implementations/derivables/_module.js";
import { cacheAdapterTestSuite } from "@/cache/implementations/test-utilities/_module.js";
import { SuperJsonSerdeAdapter } from "@/serde/implementations/adapters/_module.js";
import { Serde } from "@/serde/implementations/derivables/_module.js";

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
            return new DatabaseCacheAdapter(adapter);
        },
        test,
        beforeEach,
        expect,
        describe,
    });
});
