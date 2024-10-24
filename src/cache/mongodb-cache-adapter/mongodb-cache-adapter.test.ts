import { describe, test, beforeEach, expect, afterEach } from "vitest";
import {
    cacheApiTestSuite,
    cacheValueTestSuite,
    cacheNamespaceTestSuite,
} from "@/cache/_shared/test-utilities/_module";
import {
    MongoDBContainer,
    type StartedMongoDBContainer,
} from "@testcontainers/mongodb";
import { type Collection, MongoClient } from "mongodb";
import {
    MongodbCacheAdapter,
    type MongodbCacheDocument,
} from "@/cache/mongodb-cache-adapter/_module";

// 2min
const TIMEOUT = 2 * 60 * 1000;
describe("class: MongodbCacheAdapter", () => {
    let container: MongoDBContainer;
    let startedContainer: StartedMongoDBContainer;
    let client: MongoClient;
    let collection: Collection<MongodbCacheDocument>;
    beforeEach(async () => {
        container = new MongoDBContainer();
        startedContainer = await container.start();
        client = await MongoClient.connect(
            startedContainer.getConnectionString(),
            {
                directConnection: true,
            },
        );
        collection = client.db("test_db").collection("cache", {
            checkKeys: true,
        });
    }, TIMEOUT);
    afterEach(async () => {
        await client.close();
        await startedContainer.stop();
    }, TIMEOUT);

    cacheApiTestSuite({
        createAdapter: async () => {
            const adapter = new MongodbCacheAdapter(collection);
            await adapter.init();
            return adapter;
        },
        test,
        expect,
        describe,
        beforeEach,
    });
    cacheNamespaceTestSuite({
        createAdapter: async () => {
            const adapter = new MongodbCacheAdapter(collection);
            await adapter.init();
            return adapter;
        },
        test,
        expect,
        describe,
        beforeEach,
    });
    // cacheValueTestSuite({
    //     createAdapter: () => new MongodbCacheAdapter(collection),
    //     test,
    //     expect,
    //     describe,
    //     beforeEach,
    // });
});
