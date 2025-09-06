import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { semaphoreAdapterTestSuite } from "@/semaphore/implementations/test-utilities/_module-exports.js";
import {
    KyselySharedLockAdapter,
    type KyselySharedLockTables,
} from "@/shared-lock/implementations/adapters/kysely-shared-lock-adapter/_module.js";
import Sqlite, { type Database } from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import { ToSemaphoreAdapter } from "@/shared-lock/implementations/helpers/to-semaphore-adapter.js";

describe("sharedLock class: ToSemaphoreAdapter", () => {
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
    semaphoreAdapterTestSuite({
        createAdapter: async () => {
            const adapter = new KyselySharedLockAdapter({
                kysely,
                shouldRemoveExpiredKeys: false,
            });
            await adapter.init();
            return new ToSemaphoreAdapter(adapter);
        },
        test,
        beforeEach,
        expect,
        describe,
    });
});
