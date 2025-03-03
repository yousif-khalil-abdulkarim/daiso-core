import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { databaseLockAdapterTestSuite } from "@/new-lock/implementations/test-utilities/_module-exports.js";
import { MongoClient } from "mongodb";
import type { StartedMongoDBContainer } from "@testcontainers/mongodb";
import { MongoDBContainer } from "@testcontainers/mongodb";
import { TimeSpan } from "@/utilities/_module-exports.js";
import { MongodbLockAdapter } from "@/new-lock/implementations/adapters/mongodb-lock-adapter/mongodb-lock-adapter.js";

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
    databaseLockAdapterTestSuite({
        createAdapter: async () => {
            const lockAdapter = new MongodbLockAdapter({
                database: client.db("database"),
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
