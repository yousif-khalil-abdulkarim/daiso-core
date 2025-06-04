import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { lockAdapterTestSuite } from "@/lock/implementations/test-utilities/_module-exports.js";
import { KyselyLockAdapter } from "@/lock/implementations/adapters/_module-exports.js";
import { DatabaseLockAdapter } from "@/lock/implementations/derivables/lock-provider/database-lock-adapter.js";
import Sqlite, { type Database } from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";

describe("class: DatabaseLockAdapter", () => {
    let database: Database;
    beforeEach(() => {
        database = new Sqlite(":memory:");
    });
    afterEach(() => {
        database.close();
    });
    lockAdapterTestSuite({
        createAdapter: async () => {
            const databaseLockAdapter = new KyselyLockAdapter({
                kysely: new Kysely({
                    dialect: new SqliteDialect({
                        database,
                    }),
                }),
                shouldRemoveExpiredKeys: false,
            });
            await databaseLockAdapter.init();
            return new DatabaseLockAdapter(databaseLockAdapter);
        },
        test,
        beforeEach,
        expect,
        describe,
    });
});
