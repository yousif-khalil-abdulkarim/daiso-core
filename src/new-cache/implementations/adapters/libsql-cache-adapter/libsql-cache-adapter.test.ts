import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { cacheAdapterTestSuite } from "@/new-cache/implementations/test-utilities/_module-exports.js";
import { LibsqlCacheAdapter } from "@/new-cache/implementations/adapters/_module-exports.js";
import { type Client, createClient } from "@libsql/client";
import { Serde } from "@/serde/implementations/derivables/_module-exports.js";
import { SuperJsonSerdeAdapter } from "@/serde/implementations/adapters/_module-exports.js";
import { DatabaseCacheAdapter } from "@/new-cache/implementations/derivables/cache/_module.js";

describe("class: LibsqlCacheAdapter", () => {
    let database: Client;
    beforeEach(() => {
        database = createClient({
            url: ":memory:",
        });
    });
    afterEach(() => {
        database.close();
    });
    cacheAdapterTestSuite({
        createAdapter: async () => {
            const adapter = new LibsqlCacheAdapter({
                database: database,
                tableName: "custom_table",
                disableTransaction: true,
                shouldRemoveExpiredKeys: false,
                serde: new Serde(new SuperJsonSerdeAdapter()),
            });
            await adapter.init();
            return new DatabaseCacheAdapter(adapter);
        },
        test,
        beforeEach,
        expect,
        describe,
    });
});
