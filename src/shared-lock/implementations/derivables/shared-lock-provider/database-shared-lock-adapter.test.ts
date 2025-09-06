import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { sharedLockAdapterTestSuite } from "@/shared-lock/implementations/test-utilities/_module-exports.js";
import { KyselySharedLockAdapter } from "@/shared-lock/implementations/adapters/_module-exports.js";
import { DatabaseSharedLockAdapter } from "@/shared-lock/implementations/derivables/shared-lock-provider/database-shared-lock-adapter.js";
import Sqlite, { type Database } from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";

describe("class: DatabaseSharedLockAdapter", () => {
    let database: Database;
    beforeEach(() => {
        database = new Sqlite(":memory:");
    });
    afterEach(() => {
        database.close();
    });
    sharedLockAdapterTestSuite({
        createAdapter: async () => {
            const databaseSharedLockAdapter = new KyselySharedLockAdapter({
                kysely: new Kysely({
                    dialect: new SqliteDialect({
                        database,
                    }),
                }),
                shouldRemoveExpiredKeys: false,
            });
            await databaseSharedLockAdapter.init();
            return new DatabaseSharedLockAdapter(databaseSharedLockAdapter);
        },
        test,
        beforeEach,
        expect,
        describe,
    });
});
