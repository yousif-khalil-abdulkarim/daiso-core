import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { cacheAdapterTestSuite } from "@/cache/implementations/_shared/_module";
import { MongoClient } from "mongodb";
import type { StartedMongoDBContainer } from "@testcontainers/mongodb";
import { MongoDBContainer } from "@testcontainers/mongodb";
import { TimeSpan } from "@/utilities/_module";
import { MongodbCacheAdapter } from "@/cache/implementations/adapters/mongodb-cache-adapter/mongodb-cache-adapter";
import { SuperJsonSerializer } from "@/serializer/implementations/_module";

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
        createAdapterA: async () => {
            const cacheAdapter = new MongodbCacheAdapter(
                client.db("database").collection("cache"),
                {
                    serializer: new SuperJsonSerializer(),
                    rootGroup: "@a",
                },
            );
            await cacheAdapter.init();
            return cacheAdapter;
        },
        createAdapterB: async () => {
            const cacheAdapter = new MongodbCacheAdapter(
                client.db("database").collection("cache"),
                {
                    serializer: new SuperJsonSerializer(),
                    rootGroup: "@a/b",
                },
            );
            await cacheAdapter.init();
            return cacheAdapter;
        },
        test,
        beforeEach,
        expect,
        describe,
    });
});
