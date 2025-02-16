import { describe, test, beforeEach, expect, afterEach } from "vitest";
import { eventBusAdapterTestSuite } from "@/event-bus/implementations/test-utilities/_module-exports";
import { RedisPubSubEventBusAdapter } from "@/event-bus/implementations/adapters/redis-pub-sub-event-bus-adapter/redis-pub-sub-event-bus-adapter";
import { TimeSpan } from "@/utilities/_module-exports";
import type { StartedRedisContainer } from "@testcontainers/redis";
import { RedisContainer } from "@testcontainers/redis";
import Redis from "ioredis";
import { Serde } from "@/serde/implementations/deriavables/_module-exports";
import { SuperJsonSerdeAdapter } from "@/serde/implementations/adapters/_module-exports";

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
    const serde = new Serde(new SuperJsonSerdeAdapter());
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
