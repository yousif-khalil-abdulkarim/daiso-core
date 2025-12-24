import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { semaphoreAdapterTestSuite } from "@/semaphore/implementations/test-utilities/_module.js";
import { RedisSemaphoreAdapter } from "@/semaphore/implementations/adapters/redis-semaphore-adapter/_module.js";
import { Redis } from "ioredis";
import {
    RedisContainer,
    type StartedRedisContainer,
} from "@testcontainers/redis";
import { TimeSpan } from "@/time-span/implementations/_module.js";

const timeout = TimeSpan.fromMinutes(2);
describe("class: RedisSemaphoreAdapter", () => {
    let client: Redis;
    let startedContainer: StartedRedisContainer;
    beforeEach(async () => {
        startedContainer = await new RedisContainer("redis:7.4.2").start();
        client = new Redis(startedContainer.getConnectionUrl());
    }, timeout.toMilliseconds());
    afterEach(async () => {
        await client.quit();
        await startedContainer.stop();
    }, timeout.toMilliseconds());
    semaphoreAdapterTestSuite({
        createAdapter: () => new RedisSemaphoreAdapter(client),
        test,
        beforeEach,
        expect,
        describe,
    });
});
