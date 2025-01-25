import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { cacheAdapterTestSuite } from "@/cache/implementations/_shared/_module";
import { RedisCacheAdapter } from "@/cache/implementations/adapters/redis-cache-adapter/_module";
import Redis from "ioredis";
import {
    RedisContainer,
    type StartedRedisContainer,
} from "@testcontainers/redis";
import { TimeSpan } from "@/utilities/_module";
import { SuperJsonSerde } from "@/serde/implementations/_module";

const timeout = TimeSpan.fromMinutes(2);
describe("class: RedisCacheAdapter", () => {
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
    cacheAdapterTestSuite({
        createAdapterA: () =>
            new RedisCacheAdapter({
                database: client,
                serde: new SuperJsonSerde(),
                rootGroup: "@a",
            }),
        createAdapterB: () =>
            new RedisCacheAdapter({
                database: client,
                serde: new SuperJsonSerde(),
                rootGroup: "@a/b",
            }),
        test,
        beforeEach,
        expect,
        describe,
    });
});
