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
import type { IEventBusAdapter } from "@/event-bus/contracts/_module-exports.js";
import { BaseEvent } from "@/event-bus/contracts/_module-exports.js";
import { type Promisable } from "@/utilities/_module-exports.js";
import { TimeSpan } from "@/utilities/_module-exports.js";
import { delay } from "@/async/_module-exports.js";
import type { IFlexibleSerde } from "@/serde/contracts/_module-exports.js";
import { Serde } from "@/serde/implementations/deriavables/_module-exports.js";
import { NoOpSerdeAdapter } from "@/serde/implementations/adapters/_module-exports.js";

/**
 * @group Test utilities
 */
export type EventBusAdapterTestSuiteSettings = {
    expect: ExpectStatic;
    serde?: IFlexibleSerde;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createAdapter: () => Promisable<IEventBusAdapter>;
};

/**
 * The <i>eventBusAdapterTestSuite</i> function simplifies the process of testing your custom implementation of <i>{@link IEventBusAdapter}</i> with vitest.
 * @group Test utilities
 * @example
 * ```ts
 * import { describe, test, beforeEach, expect, afterEach } from "vitest";
 * import type { StartedRedisContainer } from "@testcontainers/redis";
 * import { RedisContainer } from "@testcontainers/redis";
 * import Redis from "ioredis";
 * import { RedisPubSubEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
 * import { Serde } from "@daiso-tech/core/serde/implementations/derivables";
 * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/implementations/adapters";
 * import { eventBusAdapterTestSuite } from "@daiso-tech/core/event-bus/implementations/test-utilities";
 *
 * const TIMEOUT = TimeSpan.fromMinutes(2);
 * describe("class: RedisPubSubEventBusAdapter", () => {
 *   let dispatcherClient: Redis;
 *   let listenerClient: Redis;
 *   let startedContainer: StartedRedisContainer;
 *   const serde = new Serde(new SuperJsonSerdeAdapter());
 *
 *   beforeEach(async () => {
 *     startedContainer = await new RedisContainer().start();
 *     dispatcherClient = new Redis(startedContainer.getConnectionUrl());
 *     listenerClient = new Redis(startedContainer.getConnectionUrl());
 *   }, TIMEOUT.toMilliseconds());
 *
 *   afterEach(async () => {
 *     await dispatcherClient.quit();
 *     await listenerClient.quit();
 *     await startedContainer.stop();
 *   }, TIMEOUT.toMilliseconds());
 *
 *   eventBusAdapterTestSuite({
 *     createAdapter: () =>
 *       new RedisPubSubEventBusAdapter({
 *         dispatcherClient,
 *         listenerClient,
 *         serde,
 *         rootGroup: "@global"
 *       }),
 *     serde,
 *     test,
 *     beforeEach,
 *     expect,
 *     describe,
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
        createAdapter,
        beforeEach,
        serde = new Serde(new NoOpSerdeAdapter()),
    } = settings;

    let eventBusAdapterA: IEventBusAdapter;
    let eventBusAdapterB: IEventBusAdapter;
    beforeEach(async () => {
        eventBusAdapterA = await createAdapter();
        eventBusAdapterB = eventBusAdapterA.withGroup("b");
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
