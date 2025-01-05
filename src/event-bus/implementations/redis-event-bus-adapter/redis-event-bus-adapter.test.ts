import { describe, test, beforeEach, expect, afterEach } from "vitest";
import { eventBusAdapterTestSuite } from "@/event-bus/implementations/_shared/test-utilities/event-bus-adapter.test-suite";
import { RedisEventBusAdapter } from "@/event-bus/implementations/redis-event-bus-adapter/redis-event-bus-adapter";
import { TimeSpan } from "@/utilities/_module";
import type { StartedRedisContainer } from "@testcontainers/redis";
import { RedisContainer } from "@testcontainers/redis";
import Redis from "ioredis";

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
            }),
        test,
        beforeEach,
        expect,
        describe,
    });
});
