import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { cacheAdapterTestSuite } from "@/cache/implementations/test-utilities/_module-exports";
import { type Client, createClient } from "@libsql/client";
import { LibsqlCacheAdapter } from "@/cache/implementations/adapters/libsql-cache-adapter/libsql-cache-adapter";
import { SuperJsonSerdeAdapter } from "@/serde/implementations/adapters/_module-exports";
import { Serde } from "@/serde/implementations/deriavables/_module-exports";

describe("class: LibsqlCacheAdapter", () => {
    let client: Client;
    beforeEach(() => {
        client = createClient({
            url: ":memory:",
        });
    });
    afterEach(() => {
        client.close();
    });
    cacheAdapterTestSuite({
        createAdapter: async () => {
            const cacheAdapter = new LibsqlCacheAdapter({
                database: client,
                tableName: "custom_table",
                shouldRemoveExpiredKeys: false,
                serde: new Serde(new SuperJsonSerdeAdapter()),
                rootGroup: "@a",
            });
            await cacheAdapter.init();
            return cacheAdapter;
        },
        test,
        beforeEach,
        expect,
        describe,
    });
});
