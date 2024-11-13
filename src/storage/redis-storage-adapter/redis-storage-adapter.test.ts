import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { storageTestSuite } from "@/storage/_shared/test-utilities/_module";
import { RedisStorageAdapter } from "@/storage/redis-storage-adapter/_module";
import {
    RedisContainer,
    type StartedRedisContainer,
} from "@testcontainers/redis";
import Redis from "ioredis";

const TIMEOUT = 60 * 1000;
describe("class: RedisStorageAdapter", () => {
    let client: Redis;
    let startedContainer: StartedRedisContainer;
    beforeEach(async () => {
        startedContainer = await new RedisContainer().start();
        client = new Redis(startedContainer.getConnectionUrl());
    }, TIMEOUT);
    afterEach(async () => {
        await client.quit();
        await startedContainer.stop();
    });
    storageTestSuite({
        createAdapter: () => new RedisStorageAdapter(client),
        test,
        beforeEach,
        expect,
        describe,
    });
});
