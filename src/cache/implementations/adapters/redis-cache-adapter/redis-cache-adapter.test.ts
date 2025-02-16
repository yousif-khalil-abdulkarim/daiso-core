import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { cacheAdapterTestSuite } from "@/cache/implementations/_shared/_module";
import { RedisCacheAdapter } from "@/cache/implementations/adapters/redis-cache-adapter/_module";
import Redis from "ioredis";
import {
    RedisContainer,
    type StartedRedisContainer,
} from "@testcontainers/redis";
import { TimeSpan } from "@/utilities/_module";
import { SuperJsonSerdeAdapter } from "@/serde/implementations/adapters/_module";
import { Serde } from "@/serde/implementations/deriavables/_module";

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
        createAdapter: () =>
            new RedisCacheAdapter({
                database: client,
                serde: new Serde(new SuperJsonSerdeAdapter()),
                rootGroup: "@a",
            }),
        test,
        beforeEach,
        expect,
        describe,
    });
});
