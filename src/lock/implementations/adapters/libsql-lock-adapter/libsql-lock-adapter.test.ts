import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { databaseLockAdapterTestSuite } from "@/lock/implementations/_shared/_module";
import { type Client, createClient } from "@libsql/client";
import { LibsqlLockAdapter } from "@/lock/implementations/adapters/libsql-lock-adapter/libsql-lock-adapter";

describe("class: LibsqlLockAdapter", () => {
    let client: Client;
    beforeEach(() => {
        client = createClient({
            url: ":memory:",
        });
    });
    afterEach(() => {
        client.close();
    });
    databaseLockAdapterTestSuite({
        createAdapter: async () => {
            const lockAdapter = new LibsqlLockAdapter({
                database: client,
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
