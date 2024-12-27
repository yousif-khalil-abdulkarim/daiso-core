import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { storageTestSuite } from "@/storage/implementations/_shared/test-utilities/_module";
import { LibsqlStorageAdapter } from "@/storage/implementations/sqlite/libsql-storage-adapter/_module";
import { type Client, createClient } from "@libsql/client";

const client = createClient({
    url: ":memory:",
});

client.close();
describe("class: LibsqlStorageAdapter", () => {
    let client: Client;
    beforeEach(() => {
        client = createClient({
            url: ":memory:",
        });
    });
    afterEach(() => {
        client.close();
    });
    storageTestSuite({
        createAdapter: async () => {
            const storageAdapter = new LibsqlStorageAdapter(client, {
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
