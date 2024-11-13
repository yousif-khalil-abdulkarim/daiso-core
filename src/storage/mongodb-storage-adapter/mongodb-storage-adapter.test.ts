import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { storageTestSuite } from "@/storage/_shared/test-utilities/_module";
import { MongodbStorageAdapter } from "@/storage/mongodb-storage-adapter/_module";
import {
    MongoDBContainer,
    type StartedMongoDBContainer,
} from "@testcontainers/mongodb";
import { MongoClient } from "mongodb";

const TIMEOUT = 60 * 1000;
describe("class: MongodbStorageAdapter", () => {
    let client: MongoClient;
    let startedContainer: StartedMongoDBContainer;
    beforeEach(async () => {
        startedContainer = await new MongoDBContainer("mongo:5.0.0").start();
        client = new MongoClient(startedContainer.getConnectionString(), {
            directConnection: true,
        });
    }, TIMEOUT);
    afterEach(async () => {
        await client.close();
        await startedContainer.stop();
    });
    storageTestSuite({
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