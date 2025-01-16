import { describe, test, beforeEach, expect, afterEach } from "vitest";
import { eventBusAdapterTestSuite } from "@/event-bus/implementations/_shared/_module";
import { RedisEventBusAdapter } from "@/event-bus/implementations/adapters/redis-event-bus-adapter/redis-event-bus-adapter";
import { TimeSpan } from "@/utilities/_module";
import type { StartedRedisContainer } from "@testcontainers/redis";
import { RedisContainer } from "@testcontainers/redis";
import Redis from "ioredis";
import { SuperJsonSerializer } from "@/serializer/implementations/_module";

const timeout = TimeSpan.fromMinutes(2);
describe("class: RedisEventBusAdapter", () => {
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
    eventBusAdapterTestSuite({
        createAdapter: () =>
            new RedisEventBusAdapter({
                dispatcherClient,
                listenerClient,
                serializer: new SuperJsonSerializer(),
            }),
        test,
        beforeEach,
        expect,
        describe,
    });
});
