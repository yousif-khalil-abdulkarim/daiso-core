import {
    RedisContainer,
    type StartedRedisContainer,
} from "@testcontainers/redis";
import { Redis } from "ioredis";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { RedisCircuitBreakerAdapter } from "@/circuit-breaker/implementations/adapters/redis-circuit-breaker-adapter/_module.js";
import { BREAKER_POLICIES } from "@/circuit-breaker/implementations/policies/_module.js";
import { samplingBreakerTestSuite } from "@/circuit-breaker/implementations/test-utilities/_module.js";
import { TimeSpan } from "@/time-span/implementations/_module.js";

const timeout = TimeSpan.fromMinutes(2);
describe("sampling-breaker class: RedisCircuitBreakerAdapter", () => {
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

    samplingBreakerTestSuite({
        createAdapter: () => {
            const adapter = new RedisCircuitBreakerAdapter({
                database: client,
                backoff: samplingBreakerTestSuite.backoffPolicySettings,
                policy: {
                    type: BREAKER_POLICIES.SAMPLING,
                    ...samplingBreakerTestSuite.circuitBreakerPolicySettings,
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
