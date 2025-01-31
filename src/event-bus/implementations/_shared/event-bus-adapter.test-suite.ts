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
import type { IEventBusAdapter } from "@/event-bus/contracts/_module";
import { BaseEvent } from "@/event-bus/contracts/_module";
import { type Promisable } from "@/utilities/_module";
import { TimeSpan } from "@/utilities/_module";
import { delay } from "@/async/_module";
import type { IFlexibleSerde } from "@/serde/contracts/_module";
import { NoOpSerde } from "@/serde/implementations/_module";

/**
 * @group Utilities
 */
export type EventBusAdapterTestSuiteSettings = {
    expect: ExpectStatic;
    serde?: IFlexibleSerde;
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
 * const TIMEOUT = TimeSpan.fromMinutes(2);
 * describe("class: RedisPubSubEventBusAdapter", () => {
 *   let dispatcherClient: Redis;
 *   let listenerClient: Redis;
 *   let startedContainer: StartedRedisContainer;
 *   const serde = new SuperJsonSerde();
 *   beforeEach(async () => {
 *     startedContainer = await new RedisContainer().start();
 *     dispatcherClient = new Redis(startedContainer.getConnectionUrl());
 *     listenerClient = new Redis(startedContainer.getConnectionUrl());
 *   }, TIMEOUT.toMilliseconds());
 *   afterEach(async () => {
 *     await dispatcherClient.quit();
 *     await listenerClient.quit();
 *     await startedContainer.stop();
 *   }, TIMEOUT.toMilliseconds());
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
 *      serde,
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
    const {
        expect,
        test,
        createAdapterA,
        createAdapterB,
        beforeEach,
        serde = new NoOpSerde(),
    } = settings;

    let eventBusAdapterA: IEventBusAdapter;
    let eventBusAdapterB: IEventBusAdapter;
    beforeEach(async () => {
        eventBusAdapterA = await createAdapterA();
        eventBusAdapterB = await createAdapterB();
    });

    const TTL = TimeSpan.fromMilliseconds(50);
    class TestEvent extends BaseEvent {}
    serde.registerEvent(TestEvent);

    describe("Api tests:", () => {
        describe("method: addListener, removeListener, dispatch", () => {
            test("Should be null when listener added and event is not triggered", async () => {
                let result: BaseEvent | null = null;
                await eventBusAdapterA.addListener(
                    TestEvent.name,
                    (event: BaseEvent) => {
                        result = event;
                    },
                );
                expect(result).toBeNull();
            });
            test("Should be TestEvent when listener added and event is triggered", async () => {
                let result: BaseEvent | null = null;
                await eventBusAdapterA.addListener(
                    TestEvent.name,
                    (event: BaseEvent) => {
                        result = event;
                    },
                );
                const event = new TestEvent({
                    type: BaseEvent.name,
                });
                await eventBusAdapterA.dispatch(TestEvent.name, event);
                await delay(TTL);
                expect(result).toEqual(event);
                expect(result).toBeInstanceOf(TestEvent);
            });
            test("Should be null when listener removed and event is triggered", async () => {
                let result: BaseEvent | null = null;
                const listener = (event: BaseEvent) => {
                    result = event;
                };
                await eventBusAdapterA.addListener(TestEvent.name, listener);
                await eventBusAdapterA.removeListener(TestEvent.name, listener);
                const event = new TestEvent({
                    type: BaseEvent.name,
                });
                await eventBusAdapterA.dispatch(TestEvent.name, event);
                await delay(TTL);
                expect(result).toBeNull();
            });
        });
    });
    describe("Group tests:", () => {
        test("method: addListener / dispatch", async () => {
            const event = new TestEvent({
                type: "type",
            });

            let result_a: BaseEvent | null = null;
            await eventBusAdapterA.addListener(
                TestEvent.name,
                (event: BaseEvent) => {
                    result_a = event;
                },
            );

            let result_b: BaseEvent | null = null;
            await eventBusAdapterB.addListener(
                TestEvent.name,
                (event: BaseEvent) => {
                    result_b = event;
                },
            );

            await eventBusAdapterA.dispatch(TestEvent.name, event);
            await delay(TTL);

            expect(result_a).toEqual(event);
            expect(result_a).toBeInstanceOf(TestEvent);
            expect(result_b).toBeNull();
        });
        test("method: removeListener / addListener / dispatch", async () => {
            const event = new TestEvent({
                type: "type",
            });

            let result_a: BaseEvent | null = null;
            await eventBusAdapterA.addListener(
                TestEvent.name,
                (event: BaseEvent) => {
                    result_a = event;
                },
            );

            let result_b: BaseEvent | null = null;
            const listenerB = (event: BaseEvent) => {
                result_b = event;
            };
            await eventBusAdapterB.addListener(TestEvent.name, listenerB);
            await eventBusAdapterB.removeListener(TestEvent.name, listenerB);

            await eventBusAdapterA.dispatch(TestEvent.name, event);
            await eventBusAdapterB.dispatch(TestEvent.name, event);
            await delay(TTL);

            expect(result_a).toEqual(event);
            expect(result_a).toBeInstanceOf(TestEvent);
            expect(result_b).toBeNull();
        });
    });
}
