import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { storageAdapterTestSuite } from "@/storage/implementations/_shared/test-utilities/_module";
import { SqliteStorageAdapter } from "@/storage/implementations/sqlite/sqlite-storage-adapter/_module";
import Sqlite, { type Database } from "better-sqlite3";

describe("class: SqliteStorageAdapter", () => {
    let database: Database;
    beforeEach(() => {
        database = new Sqlite(":memory:");
    });
    afterEach(() => {
        database.close();
    });
    storageAdapterTestSuite({
        createAdapter: async () => {
            const storageAdapter = new SqliteStorageAdapter(database, {
                tableName: "custom_table",
            });
            await storageAdapter.init();
            return storageAdapter;
        },
        test,
        beforeEach,
        expect,
        describe,
    });
});
