import {
    RedisContainer,
    type StartedRedisContainer,
} from "@testcontainers/redis";
import { Redis } from "ioredis";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { constantBackoff } from "@/backoff-policies/_module.js";
import { DatabaseRateLimiterAdapter } from "@/rate-limiter/implementations/adapters/database-rate-limiter-adapter/database-rate-limiter-adapter.js";
import { MemoryRateLimiterStorageAdapter } from "@/rate-limiter/implementations/adapters/memory-rate-limiter-storage-adapter/memory-rate-limiter-storage-adapter.js";
import { FixedWindowLimiter } from "@/rate-limiter/implementations/policies/_module.js";
import { slidingWindowLimiterTestSuite } from "@/rate-limiter/implementations/test-utilities/_module.js";
import { TimeSpan } from "@/time-span/implementations/_module.js";

const timeout = TimeSpan.fromMinutes(2);
describe("sliding-window-limiter class: DatabaseRateLimiterAdapter", () => {
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

    slidingWindowLimiterTestSuite({
        createAdapter: () => {
            const adapter = new DatabaseRateLimiterAdapter({
                backoffPolicy: constantBackoff(
                    slidingWindowLimiterTestSuite.backoffPolicySettings,
                ),
                adapter: new MemoryRateLimiterStorageAdapter(),
                rateLimiterPolicy: new FixedWindowLimiter(
                    slidingWindowLimiterTestSuite.rateLimiterPolicySettings,
                ),
            });
            return adapter;
        },
        beforeEach,
        describe,
        expect,
        test,
    });
});
