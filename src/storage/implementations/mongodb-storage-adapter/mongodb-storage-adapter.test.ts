import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { storageAdapterTestSuite } from "@/storage/implementations/_shared/test-utilities/_module";
import { MongodbStorageAdapter } from "@/storage/implementations/mongodb-storage-adapter/_module";
import {
    MongoDBContainer,
    type StartedMongoDBContainer,
} from "@testcontainers/mongodb";
import { MongoClient } from "mongodb";
import { TimeSpan } from "@/utilities/_module";

const timeout = TimeSpan.fromMinutes(2);
describe("class: MongodbStorageAdapter", () => {
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
    storageAdapterTestSuite({
        createAdapter: async () => {
            const storageAdapter = new MongodbStorageAdapter(
                client.db("database").collection("storage"),
            );
            await storageAdapter.init();
            return storageAdapter;
        },
        test,
        beforeEach,
        expect,
        describe,
    });
});
