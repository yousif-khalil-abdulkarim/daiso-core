/**
 * @module EventBus
 */

import {
    type TestAPI,
    type SuiteAPI,
    type ExpectStatic,
    type beforeEach,
    describe,
} from "vitest";
import type {
    IBaseEvent,
    IEventBusAdapter,
} from "@/event-bus/contracts/_module";
import { type Promisable } from "@/utilities/_module";
import { TimeSpan } from "@/utilities/_module";
import { delay } from "@/async/_module";

/**
 * @group Utilities
 */
export type EventBusAdapterTestSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createAdapter: () => Promisable<IEventBusAdapter>;
};

/**
 * The <i>eventBusAdapterTestSuite</i> function simplifies the process of testing your custom implementation of <i>{@link IEventBusAdapter}</i> with vitest.
 * @group Utilities
 * @example
 * ```ts
 * import { describe, test, beforeEach, expect, afterEach } from "vitest";
 * import type { StartedRedisContainer } from "@testcontainers/redis";
 * import { RedisContainer } from "@testcontainers/redis";
 * import Redis from "ioredis";
 * import { SuperJsonSerializer, TimeSpan, RedisPubSubEventBusAdapter, eventBusAdapterTestSuite } from "@daiso-tech/core";
 *
 * const timeout = TimeSpan.fromMinutes(2);
 * describe("class: RedisPubSubEventBusAdapter", () => {
 *   let dispatcherClient: Redis;
 *   let listenerClient: Redis;
 *   let startedContainer: StartedRedisContainer;
 *   const serializer = new SuperJsonSerializer();
 *   beforeEach(async () => {
 *     startedContainer = await new RedisContainer().start();
 *     dispatcherClient = new Redis(startedContainer.getConnectionUrl());
 *     listenerClient = new Redis(startedContainer.getConnectionUrl());
 *   }, timeout.toMilliseconds());
 *   afterEach(async () => {
 *     await dispatcherClient.quit();
 *     await listenerClient.quit();
 *     await startedContainer.stop();
 *   }, timeout.toMilliseconds());
 *    eventBusAdapterTestSuite({
 *      createAdapter: () =>
 *        new RedisPubSubEventBusAdapter({
 *          dispatcherClient,
 *          listenerClient,
 *          serializer,
 *        }),
 *      test,
 *      beforeEach,
 *      expect,
 *      describe,
 *   });
 * });
 * ```
 */
export function eventBusAdapterTestSuite(
    settings: EventBusAdapterTestSuiteSettings,
): void {
    const { expect, test, createAdapter, beforeEach } = settings;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let eventBusAdapter: IEventBusAdapter;
    beforeEach(async () => {
        eventBusAdapter = await createAdapter();
    });

    describe("method: addListener, removeListener, dispatch", () => {
        test("Should be null when listener added and event is not triggered", async () => {
            const TYPE = "type";
            let result: IBaseEvent | null = null;
            await eventBusAdapter.addListener(TYPE, (event) => {
                result = event;
            });
            expect(result).toBeNull();
        });
        test("Should be IBaseEvent when listener added and event is triggered", async () => {
            const TYPE = "type";
            let result: IBaseEvent | null = null;
            await eventBusAdapter.addListener(TYPE, (event) => {
                result = event;
            });
            const event: IBaseEvent = {
                type: TYPE,
            };
            await eventBusAdapter.dispatch([event]);
            await delay(TimeSpan.fromMilliseconds(50));
            expect(result).toEqual(event);
        });
        test("Should be null when listener removed and event is triggered", async () => {
            const TYPE = "type";
            let result: IBaseEvent | null = null;
            const listener = (event: IBaseEvent) => {
                result = event;
            };
            await eventBusAdapter.addListener(TYPE, listener);
            await eventBusAdapter.removeListener(TYPE, listener);
            const event: IBaseEvent = {
                type: TYPE,
            };
            await delay(TimeSpan.fromMilliseconds(50));
            await eventBusAdapter.dispatch([event]);
            expect(result).toBeNull();
        });
    });
}
