import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { cacheAdapterTestSuite } from "@/cache/implementations/test-utilities/_module-exports.js";
import { MongoClient } from "mongodb";
import type { StartedMongoDBContainer } from "@testcontainers/mongodb";
import { MongoDBContainer } from "@testcontainers/mongodb";
import { TimeSpan } from "@/utilities/_module-exports.js";
import { MongodbCacheAdapter } from "@/cache/implementations/adapters/mongodb-cache-adapter/mongodb-cache-adapter.js";
import { SuperJsonSerdeAdapter } from "@/serde/implementations/adapters/_module-exports.js";
import { Serde } from "@/serde/implementations/deriavables/_module-exports.js";

const timeout = TimeSpan.fromMinutes(2);
describe("class: MongodbCacheAdapter", () => {
    let client: MongoClient;
    let startedContainer: StartedMongoDBContainer;
    beforeEach(async () => {
        startedContainer = await new MongoDBContainer("mongo:5.0.0").start();
        client = new MongoClient(startedContainer.getConnectionString(), {
            directConnection: true,
        });
    }, timeout.toMilliseconds());
    afterEach(async () => {
        await client.close();
        await startedContainer.stop();
    }, timeout.toMilliseconds());
    cacheAdapterTestSuite({
        createAdapter: async () => {
            const cacheAdapter = new MongodbCacheAdapter({
                database: client.db("database"),
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
