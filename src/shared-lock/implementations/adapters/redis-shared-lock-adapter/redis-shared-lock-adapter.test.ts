import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { sharedLockAdapterTestSuite } from "@/shared-lock/implementations/test-utilities/_module-exports.js";
import { RedisSharedLockAdapter } from "@/shared-lock/implementations/adapters/redis-shared-lock-adapter/_module-exports.js";
import { Redis } from "ioredis";
import {
    RedisContainer,
    type StartedRedisContainer,
} from "@testcontainers/redis";
import { TimeSpan } from "@/time-span/implementations/_module-exports.js";

const timeout = TimeSpan.fromMinutes(2);
describe("class: RedisSharedLockAdapter", () => {
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
    sharedLockAdapterTestSuite({
        createAdapter: () => new RedisSharedLockAdapter(client),
        test,
        beforeEach,
        expect,
        describe,
    });
});
