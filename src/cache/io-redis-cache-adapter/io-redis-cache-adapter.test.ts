/**
 * @module Cache
 */

import { afterEach, beforeEach, describe, expect, test } from "vitest";
import {
    RedisContainer,
    type StartedRedisContainer,
} from "@testcontainers/redis";
import Redis from "ioredis";
import {
    cacheApiTestSuite,
    cacheValueTestSuite,
    cacheNamespaceTestSuite,
} from "@/cache/_shared/test-utilities/_module";
import { IoRedisCacheAdapter } from "@/cache/io-redis-cache-adapter/_module";

// 2min
const TIMEOUT = 2 * 60 * 1000;
describe("class: IoRedisCacheAdapter", () => {
    let container: RedisContainer;
    let startedContainer: StartedRedisContainer;
    let client: Redis;
    beforeEach(async () => {
        container = new RedisContainer();
        startedContainer = await container.start();
        client = new Redis(startedContainer.getConnectionUrl());
    }, TIMEOUT);
    afterEach(async () => {
        await client.quit();
        await startedContainer.stop();
    }, TIMEOUT);

    cacheApiTestSuite({
        createAdapter: () => new IoRedisCacheAdapter(client),
        test,
        expect,
        describe,
        beforeEach,
    });
    cacheNamespaceTestSuite({
        createAdapter: () => new IoRedisCacheAdapter(client),
        test,
        expect,
        describe,
        beforeEach,
    });
    cacheValueTestSuite({
        createAdapter: () => new IoRedisCacheAdapter(client),
        test,
        expect,
        describe,
        beforeEach,
    });
});
