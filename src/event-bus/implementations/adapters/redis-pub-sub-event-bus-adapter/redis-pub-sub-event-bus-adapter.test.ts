import { describe, test, beforeEach, expect, afterEach } from "vitest";
import { eventBusAdapterTestSuite } from "@/event-bus/implementations/_shared/_module";
import { RedisPubSubEventBusAdapter } from "@/event-bus/implementations/adapters/redis-pub-sub-event-bus-adapter/redis-pub-sub-event-bus-adapter";
import { TimeSpan } from "@/utilities/_module";
import type { StartedRedisContainer } from "@testcontainers/redis";
import { RedisContainer } from "@testcontainers/redis";
import Redis from "ioredis";
import { SuperJsonSerde } from "@/serde/implementations/_module";

const timeout = TimeSpan.fromMinutes(2);
describe("class: RedisPubSubEventBusAdapter", () => {
    let dispatcherClient: Redis;
    let listenerClient: Redis;
    let startedContainer: StartedRedisContainer;
    beforeEach(async () => {
        startedContainer = await new RedisContainer().start();
        dispatcherClient = new Redis(startedContainer.getConnectionUrl());
        listenerClient = new Redis(startedContainer.getConnectionUrl());
    }, timeout.toMilliseconds());
    afterEach(async () => {
        await dispatcherClient.quit();
        await listenerClient.quit();
        await startedContainer.stop();
    }, timeout.toMilliseconds());
    const serde = new SuperJsonSerde();
    eventBusAdapterTestSuite({
        createAdapter: () =>
            new RedisPubSubEventBusAdapter({
                dispatcherClient,
                listenerClient,
                serde,
                rootGroup: "@a",
            }),
        serde,
        test,
        beforeEach,
        expect,
        describe,
    });
});
