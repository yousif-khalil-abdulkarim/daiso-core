import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { databaseSharedLockAdapterTestSuite } from "@/shared-lock/implementations/test-utilities/_module-exports.js";
import {
    KyselySharedLockAdapter,
    type KyselySharedLockTables,
} from "@/shared-lock/implementations/adapters/kysely-shared-lock-adapter/_module.js";
import Sqlite, { type Database } from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";

describe("sqlite class: KyselySharedLockAdapter", () => {
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
    databaseSharedLockAdapterTestSuite({
        createAdapter: async () => {
            const adapter = new KyselySharedLockAdapter({
                kysely,
                shouldRemoveExpiredKeys: false,
            });
            await adapter.init();
            return adapter;
        },
        test,
        beforeEach,
        expect,
        describe,
    });
    describe("method: removeAllExpired", () => {
        test.todo("Write tests!!!");
    });
    describe("method: init", () => {
        test.todo("Write tests!!!");
    });
    describe("method: deInit", () => {
        test.todo("Write tests!!!");
    });
});
