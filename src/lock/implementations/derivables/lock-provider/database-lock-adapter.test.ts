import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { lockAdapterTestSuite } from "@/lock/implementations/test-utilities/_module-exports.js";
import { SqliteLockAdapter } from "@/lock/implementations/adapters/_module-exports.js";
import { DatabaseLockAdapter } from "@/lock/implementations/derivables/lock-provider/database-lock-adapter.js";
import Sqlite, { type Database } from "better-sqlite3";

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
            const databaseLockAdapter = new SqliteLockAdapter({
                database: database,
                tableName: "custom_table",
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
