import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { cacheAdapterTestSuite } from "@/cache/implementations/_shared/_module";
import { type Client, createClient } from "@libsql/client";
import { LibsqlCacheAdapter } from "@/cache/implementations/adapters/libsql-cache-adapter/libsql-cache-adapter";
import { SuperJsonSerde } from "@/serde/implementations/_module";

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
                serde: new SuperJsonSerde(),
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
