import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { storageAdapterTestSuite } from "@/storage/implementations/_shared/test-utilities/_module";
import { RedisStorageAdapter } from "@/storage/implementations/adapters/redis-storage-adapter/_module";
import {
    RedisContainer,
    type StartedRedisContainer,
} from "@testcontainers/redis";
import Redis from "ioredis";
import { TimeSpan } from "@/utilities/_module";

const timeout = TimeSpan.fromMinutes(2);
describe("class: RedisStorageAdapter", () => {
    let client: Redis;
    let startedContainer: StartedRedisContainer;
    beforeEach(async () => {
        startedContainer = await new RedisContainer().start();
        client = new Redis(startedContainer.getConnectionUrl());
    }, timeout.toMilliseconds());
    afterEach(async () => {
        await client.quit();
        await startedContainer.stop();
    }, timeout.toMilliseconds());
    storageAdapterTestSuite({
        createAdapter: () => new RedisStorageAdapter(client),
        test,
        beforeEach,
        expect,
        describe,
    });
});
