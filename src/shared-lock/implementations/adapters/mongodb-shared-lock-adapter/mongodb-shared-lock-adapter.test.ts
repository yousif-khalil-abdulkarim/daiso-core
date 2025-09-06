import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { sharedLockAdapterTestSuite } from "@/shared-lock/implementations/test-utilities/_module-exports.js";
import { MongoClient } from "mongodb";
import type { StartedMongoDBContainer } from "@testcontainers/mongodb";
import { MongoDBContainer } from "@testcontainers/mongodb";
import { TimeSpan } from "@/utilities/_module-exports.js";
import { MongodbSharedLockAdapter } from "@/shared-lock/implementations/adapters/mongodb-shared-lock-adapter/mongodb-shared-lock-adapter.js";

const timeout = TimeSpan.fromMinutes(2);
describe("class: MongodbLockAdapter", () => {
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
    sharedLockAdapterTestSuite({
        createAdapter: async () => {
            const adapter = new MongodbSharedLockAdapter({
                database: client.db("database"),
                collectionName: "shared-locks",
            });
            await adapter.init();
            return adapter;
        },
        test,
        beforeEach,
        expect,
        describe,
    });
    describe("method: init", () => {
        test.todo("Write tests!!!");
    });
    describe("method: deInit", () => {
        test.todo("Write tests!!!");
    });
    describe("Expiration tests:", () => {
        test.todo("Write tests!!!");
    });
});
