import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { semaphoreAdapterTestSuite } from "@/semaphore/implementations/test-utilities/_module-exports.js";
import { MongoClient } from "mongodb";
import type { StartedMongoDBContainer } from "@testcontainers/mongodb";
import { MongoDBContainer } from "@testcontainers/mongodb";
import { TimeSpan } from "@/utilities/_module-exports.js";
import { MongodbSemaphoreAdapter } from "@/semaphore/implementations/adapters/mongodb-semaphore-adapter/mongodb-semaphore-adapter.js";

const timeout = TimeSpan.fromMinutes(2);
describe("class: MongodbSemaphoreAdapter", () => {
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
    semaphoreAdapterTestSuite({
        createAdapter: async () => {
            const semaphoreAdapter = new MongodbSemaphoreAdapter({
                database: client.db("database"),
            });
            await semaphoreAdapter.init();
            return semaphoreAdapter;
        },
        test,
        beforeEach,
        expect,
        describe,
    });
    describe("method: init", () => {
        test("Should not throw error when called multiple times", async () => {
            const adapter = new MongodbSemaphoreAdapter({
                database: client.db("database"),
                collectionName: "locks",
            });
            await adapter.init();

            const promise = adapter.init();

            await expect(promise).resolves.toBeUndefined();
        });
    });
    describe("method: deInit", () => {
        test("Should remove collection", async () => {
            const adapter = new MongodbSemaphoreAdapter({
                database: client.db("database"),
                collectionName: "locks",
            });
            await adapter.init();
            await adapter.deInit();

            const collections = await client
                .db("database")
                .listCollections()
                .toArray();

            const collection = collections.find(
                (collection) => collection.name === "locks",
            );

            expect(collection).toBeUndefined();
        });
        test("Should not throw error when called multiple times", async () => {
            const adapter = new MongodbSemaphoreAdapter({
                database: client.db("database"),
                collectionName: "locks",
            });
            await adapter.init();
            await adapter.deInit();

            const promise = adapter.deInit();

            await expect(promise).resolves.toBeUndefined();
        });
        test("Should not throw error when called before init", async () => {
            const adapter = new MongodbSemaphoreAdapter({
                database: client.db("database"),
                collectionName: "locks",
            });

            const promise = adapter.deInit();

            await expect(promise).resolves.toBeUndefined();
        });
    });
});
