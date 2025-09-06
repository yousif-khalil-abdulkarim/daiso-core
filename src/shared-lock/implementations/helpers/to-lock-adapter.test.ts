import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { lockAdapterTestSuite } from "@/lock/implementations/test-utilities/_module-exports.js";
import {
    KyselySharedLockAdapter,
    type KyselySharedLockTables,
} from "@/shared-lock/implementations/adapters/kysely-shared-lock-adapter/_module.js";
import Sqlite, { type Database } from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import { ToLockAdapter } from "@/shared-lock/implementations/helpers/to-lock-adapter.js";

describe("sharedLock class: ToLockAdapter", () => {
    let database: Database;
    let kysely: Kysely<KyselySharedLockTables>;

    beforeEach(() => {
        database = new Sqlite(":memory:");
        kysely = new Kysely({
            dialect: new SqliteDialect({
                database,
            }),
        });
    });
    afterEach(() => {
        database.close();
    });
    lockAdapterTestSuite({
        createAdapter: async () => {
            const adapter = new KyselySharedLockAdapter({
                kysely,
                shouldRemoveExpiredKeys: false,
            });
            await adapter.init();
            return new ToLockAdapter(adapter);
        },
        test,
        beforeEach,
        expect,
        describe,
    });
});
