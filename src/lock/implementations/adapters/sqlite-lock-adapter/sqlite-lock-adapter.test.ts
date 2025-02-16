import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { databaseLockAdapterTestSuite } from "@/lock/implementations/test-utilities/_module-exports";
import Sqlite, { type Database } from "better-sqlite3";
import { SqliteLockAdapter } from "@/lock/implementations/adapters/sqlite-lock-adapter/sqlite-lock-adapter";

describe("class: SqliteLockAdapter", () => {
    let database: Database;
    beforeEach(() => {
        database = new Sqlite(":memory:");
    });
    afterEach(() => {
        database.close();
    });
    databaseLockAdapterTestSuite({
        createAdapter: async () => {
            const lockAdapter = new SqliteLockAdapter({
                database: database,
                tableName: "custom_table",
                shouldRemoveExpiredKeys: false,
                rootGroup: "@a",
            });
            await lockAdapter.init();
            return lockAdapter;
        },
        test,
        beforeEach,
        expect,
        describe,
    });
});
