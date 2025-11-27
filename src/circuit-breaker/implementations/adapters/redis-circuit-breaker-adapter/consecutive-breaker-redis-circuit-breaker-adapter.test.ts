import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { Redis } from "ioredis";
import {
    RedisContainer,
    type StartedRedisContainer,
} from "@testcontainers/redis";
import { TimeSpan } from "@/time-span/implementations/_module-exports.js";
import { consecutiveBreakerTestSuite } from "@/circuit-breaker/implementations/test-utilities/_module-exports.js";
import { RedisCircuitBreakerAdapter } from "@/circuit-breaker/implementations/adapters/redis-circuit-breaker-adapter/_module-exports.js";
import { BREAKER_POLICIES } from "@/circuit-breaker/implementations/policies/_module-exports.js";

const timeout = TimeSpan.fromMinutes(2);
describe("consecutive-breaker class: RedisCircuitBreakerAdapter", () => {
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

    consecutiveBreakerTestSuite({
        createAdapter: () => {
            const adapter = new RedisCircuitBreakerAdapter({
                database: client,
                backoff: consecutiveBreakerTestSuite.backoffPolicySettings,
                policy: {
                    type: BREAKER_POLICIES.CONSECUTIVE,
                    ...consecutiveBreakerTestSuite.circuitBreakerPolicySettings,
                },
            });
            return adapter;
        },
        beforeEach,
        describe,
        expect,
        test,
    });
});
