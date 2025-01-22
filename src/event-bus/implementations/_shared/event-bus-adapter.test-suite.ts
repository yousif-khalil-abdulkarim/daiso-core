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
    createAdapterA: () => Promisable<IEventBusAdapter>;
    createAdapterB: () => Promisable<IEventBusAdapter>;
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
 * import { SuperJsonSerde, TimeSpan, RedisPubSubEventBusAdapter, eventBusAdapterTestSuite } from "@daiso-tech/core";
 *
 * const timeout = TimeSpan.fromMinutes(2);
 * describe("class: RedisPubSubEventBusAdapter", () => {
 *   let dispatcherClient: Redis;
 *   let listenerClient: Redis;
 *   let startedContainer: StartedRedisContainer;
 *   const serde = new SuperJsonSerde();
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
 *      createAdapterA: () =>
 *        new RedisPubSubEventBusAdapter({
 *          dispatcherClient,
 *          listenerClient,
 *          serde,
 *          rootGroup: "@global"
 *        }),
 *      createAdapterB: () =>
 *        new RedisPubSubEventBusAdapter({
 *          dispatcherClient,
 *          listenerClient,
 *          serde,
 *          rootGroup: "@global"
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
    const { expect, test, createAdapterA, createAdapterB, beforeEach } =
        settings;

    let eventBusAdapterA: IEventBusAdapter;
    let eventBusAdapterB: IEventBusAdapter;
    beforeEach(async () => {
        eventBusAdapterA = await createAdapterA();
        eventBusAdapterB = await createAdapterB();
    });

    const TTL = TimeSpan.fromMilliseconds(50);
    describe("Api tests:", () => {
        describe("method: addListener, removeListener, dispatch", () => {
            test("Should be null when listener added and event is not triggered", async () => {
                const TYPE = "type";
                let result: IBaseEvent | null = null;
                await eventBusAdapterA.addListener(TYPE, (event) => {
                    result = event;
                });
                expect(result).toBeNull();
            });
            test("Should be IBaseEvent when listener added and event is triggered", async () => {
                const TYPE = "type";
                let result: IBaseEvent | null = null;
                await eventBusAdapterA.addListener(TYPE, (event) => {
                    result = event;
                });
                const event: IBaseEvent = {
                    type: TYPE,
                };
                await eventBusAdapterA.dispatch(event);
                await delay(TTL);
                expect(result).toEqual(event);
            });
            test("Should be null when listener removed and event is triggered", async () => {
                const TYPE = "type";
                let result: IBaseEvent | null = null;
                const listener = (event: IBaseEvent) => {
                    result = event;
                };
                await eventBusAdapterA.addListener(TYPE, listener);
                await eventBusAdapterA.removeListener(TYPE, listener);
                const event: IBaseEvent = {
                    type: TYPE,
                };
                await eventBusAdapterA.dispatch(event);
                await delay(TTL);
                expect(result).toBeNull();
            });
        });
    });
    describe("Group tests:", () => {
        test("method: addListener / dispatch", async () => {
            const event: IBaseEvent = {
                type: "type",
            };

            let result_a: IBaseEvent | null = null;
            await eventBusAdapterA.addListener(event.type, (event) => {
                result_a = event;
            });

            let result_b: IBaseEvent | null = null;
            await eventBusAdapterB.addListener(event.type, (event) => {
                result_b = event;
            });

            await eventBusAdapterA.dispatch(event);
            await delay(TTL);

            expect(result_a).toEqual(event);
            expect(result_b).toBeNull();
        });
        test("method: removeListener / addListener / dispatch", async () => {
            const event: IBaseEvent = {
                type: "type",
            };

            let result_a: IBaseEvent | null = null;
            await eventBusAdapterA.addListener(event.type, (event) => {
                result_a = event;
            });

            let result_b: IBaseEvent | null = null;
            const listenerB = (event: IBaseEvent) => {
                result_b = event;
            };
            await eventBusAdapterB.addListener(event.type, listenerB);
            await eventBusAdapterB.removeListener(event.type, listenerB);

            await eventBusAdapterA.dispatch(event);
            await eventBusAdapterB.dispatch(event);
            await delay(TTL);

            expect(result_a).toEqual(event);
            expect(result_b).toBeNull();
        });
    });
}
