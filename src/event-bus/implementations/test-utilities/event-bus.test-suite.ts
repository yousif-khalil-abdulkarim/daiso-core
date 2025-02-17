/**
 * @module EventBus
 */

import {
    type TestAPI,
    type SuiteAPI,
    type ExpectStatic,
    type beforeEach,
} from "vitest";
import {
    BaseEvent,
    type IEventBus,
    type IGroupableEventBus,
} from "@/event-bus/contracts/_module-exports.js";
import { type Promisable } from "@/utilities/_module-exports.js";
import { TimeSpan } from "@/utilities/_module-exports.js";
import { delay } from "@/async/_module-exports.js";
import type { IFlexibleSerde } from "@/serde/contracts/_module-exports.js";
import { Serde } from "@/serde/implementations/derivables/_module-exports.js";
import { NoOpSerdeAdapter } from "@/serde/implementations/adapters/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/implementations/test-utilities"```
 * @group Test utilities
 */
export type EventBusTestSuiteSettings = {
    expect: ExpectStatic;
    serde?: IFlexibleSerde;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createEventBus: () => Promisable<IGroupableEventBus>;
};

/**
 * The <i>eventBusTestSuite</i> function simplifies the process of testing your custom implementation of <i>{@link IEventBus}</i> with vitest.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/implementations/test-utilities"```
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
 * import { eventBusTestSuite } from "@daiso-tech/core/event-bus/implementations/test-utilities";
 *
 * const TIMEOUT = TimeSpan.fromMinutes(2);
 * describe("class: EventBus", () => {
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
 *   eventBusTestSuite({
 *     createEventBus: () =>
 *       new EventBus(
 *         new RedisPubSubEventBusAdapter({
 *           dispatcherClient,
 *           listenerClient,
 *           serde,
 *           rootGroup: "@global"
 *         })
 *       ),
 *     serde,
 *     test,
 *     beforeEach,
 *     expect,
 *     describe,
 *   });
 * });
 * ```
 */
export function eventBusTestSuite(settings: EventBusTestSuiteSettings): void {
    const {
        expect,
        serde = new Serde(new NoOpSerdeAdapter()),
        test,
        describe,
        createEventBus,
        beforeEach,
    } = settings;
    let eventBusA: IEventBus;
    let eventBusB: IEventBus;
    beforeEach(async () => {
        const eventBus = await createEventBus();
        eventBusA = eventBus;
        eventBusB = eventBus.withGroup("b");
    });

    const TTL = TimeSpan.fromMilliseconds(50);
    class TestEventA extends BaseEvent {}
    class TestEventB extends BaseEvent {}
    serde.registerEvent(TestEventA);
    serde.registerEvent(TestEventB);

    describe("Api tests:", () => {
        describe("method: addListener, removeListener, dispatch", () => {
            test("Should be null when listener added and event is not triggered", async () => {
                let result: TestEventA | null = null;
                await eventBusA.addListener(TestEventA, (event) => {
                    result = event;
                });
                expect(result).toBeNull();
            });
            test("Should be TestEventA when listener added and event is triggered", async () => {
                let result: TestEventA | null = null;
                await eventBusA.addListener(TestEventA, (event) => {
                    result = event;
                });
                const event = new TestEventA({
                    type: TestEventA.name,
                });
                await eventBusA.dispatch(event);
                await delay(TTL);
                expect(result).toEqual(event);
                expect(result).toBeInstanceOf(TestEventA);
            });
            test("Should be null when listener removed and event is triggered", async () => {
                const event = new TestEventA({
                    type: TestEventA.name,
                });
                let result: TestEventA | null = null;
                const listener = (event: TestEventA) => {
                    result = event;
                };
                await eventBusA.addListener(TestEventA, listener);
                await eventBusA.removeListener(TestEventA, listener);
                await eventBusA.dispatch(event);
                await delay(TTL);
                expect(result).toBeNull();
            });
        });
        describe("method: addListenerMany, removeListenerMany, dispatch", () => {
            test("Should be null when listener added and event is not triggered", async () => {
                let result: TestEventA | TestEventB | null = null;
                await eventBusA.addListenerMany(
                    [TestEventA, TestEventB],
                    (event) => {
                        result = event;
                    },
                );
                expect(result).toBeNull();
            });
            test("Should be BaseEvent when listener added and event is triggered", async () => {
                const event_1 = new TestEventA({
                    type: TestEventA.name,
                });
                const event_2 = new TestEventB({
                    type: TestEventB.name,
                });
                let result_1: TestEventA | null = null;
                let result_2: TestEventB | null = null;
                await eventBusA.addListenerMany(
                    [TestEventA, TestEventB],
                    (eventObj) => {
                        if (eventObj instanceof TestEventA) {
                            result_1 = eventObj;
                        }
                        if (eventObj instanceof TestEventB) {
                            result_2 = eventObj;
                        }
                    },
                );
                await eventBusA.dispatchMany([event_1, event_2]);
                await delay(TTL);
                expect(result_1).toEqual(event_1);
                expect(result_1).toBeInstanceOf(TestEventA);
                expect(result_2).toEqual(event_2);
                expect(result_2).toBeInstanceOf(TestEventB);
            });
            test("Should be null when listener removed and event is triggered", async () => {
                const event_A: TestEventA = new TestEventA({
                    type: TestEventA.name,
                });
                const event_B: TestEventB = new TestEventB({
                    type: TestEventB.name,
                });
                let result: TestEventA | TestEventB | null = null;
                const listener = (event: TestEventA | TestEventB) => {
                    result = event;
                };
                await eventBusA.addListenerMany(
                    [TestEventA, TestEventB],
                    listener,
                );
                await eventBusA.removeListenerMany(
                    [TestEventA, TestEventB],
                    listener,
                );
                await eventBusA.dispatchMany([event_A, event_B]);
                await delay(TTL);
                expect(result).toBeNull();
            });
        });
        describe("method: subscribe", () => {
            test("Should be null when listener added and event is not triggered", async () => {
                let result: TestEventA | null = null;
                await eventBusA.subscribe(TestEventA, (event) => {
                    result = event;
                });
                expect(result).toBeNull();
            });
            test("Should be TestEventA when listener added and event is triggered", async () => {
                const event: TestEventA = new TestEventA({
                    type: TestEventA.name,
                });
                let result: TestEventA | null = null;
                await eventBusA.subscribe(TestEventA, (event) => {
                    result = event;
                });
                await delay(TTL);
                await eventBusA.dispatch(event);
                expect(result).toEqual(event);
                expect(result).toBeInstanceOf(TestEventA);
            });
            test("Should be null when listener removed and event is triggered", async () => {
                const event: TestEventA = new TestEventA({
                    type: TestEventA.name,
                });
                let result: TestEventA | null = null;
                const listener = (event: TestEventA) => {
                    result = event;
                };
                const unsubscribe = await eventBusA.subscribe(
                    TestEventA,
                    listener,
                );
                await unsubscribe();
                await eventBusA.dispatch(event);
                await delay(TTL);
                expect(result).toBeNull();
            });
        });
        describe("method: subscribeMany", () => {
            test("Should be null when listener added and event is not triggered", async () => {
                let result: TestEventA | TestEventB | null = null;
                await eventBusA.subscribeMany(
                    [TestEventA, TestEventB],
                    (event) => {
                        result = event;
                    },
                );
                expect(result).toBeNull();
            });
            test("Should be BaseEvent when listener added and event is triggered", async () => {
                const event_1: TestEventA = new TestEventA({
                    type: TestEventA.name,
                });
                const event_2: TestEventB = new TestEventB({
                    type: TestEventB.name,
                });
                let result_1: BaseEvent | null = null;
                let result_2: BaseEvent | null = null;
                await eventBusA.subscribeMany(
                    [TestEventA, TestEventB],
                    (eventObj: BaseEvent) => {
                        if (eventObj instanceof TestEventA) {
                            result_1 = eventObj;
                        }
                        if (eventObj instanceof TestEventB) {
                            result_2 = eventObj;
                        }
                    },
                );
                await delay(TTL);
                await eventBusA.dispatchMany([event_1, event_2]);
                expect(result_1).toEqual(event_1);
                expect(result_1).toBeInstanceOf(TestEventA);
                expect(result_2).toEqual(event_2);
                expect(result_2).toBeInstanceOf(TestEventB);
            });
            test("Should be null when listener removed and event is triggered", async () => {
                const event_A: TestEventA = new TestEventA({
                    type: TestEventA.name,
                });
                const event_B: TestEventB = new TestEventB({
                    type: TestEventB.name,
                });
                let result: BaseEvent | null = null;
                const listener = (event: BaseEvent) => {
                    result = event;
                };
                const unsubscribe = await eventBusA.subscribeMany(
                    [TestEventA, TestEventB],
                    listener,
                );
                await unsubscribe();
                await eventBusA.dispatchMany([event_A, event_B]);
                await delay(TTL);
                expect(result).toBeNull();
            });
        });
        describe("method: listenOnce", () => {
            test("Should be null when listener added and event is not triggered", async () => {
                let result: TestEventA | null = null;
                await eventBusA.listenOnce(TestEventA, (event) => {
                    result = event;
                });
                expect(result).toBeNull();
            });
            test("Should be TestEventA when listener added and event is triggered", async () => {
                const event: TestEventA = new TestEventA({
                    type: TestEventA.name,
                });
                let result: TestEventA | null = null;
                await eventBusA.listenOnce(TestEventA, (event) => {
                    result = event;
                });
                await eventBusA.dispatch(event);
                await delay(TTL);
                expect(result).toEqual(event);
                expect(result).toBeInstanceOf(TestEventA);
            });
            test("Should only listen for event once", async () => {
                const event: TestEventA = new TestEventA({
                    type: TestEventA.name,
                });
                let i = 0;
                await eventBusA.listenOnce(TestEventA, () => {
                    i++;
                });
                await eventBusA.dispatch(event);
                await eventBusA.dispatch(event);
                await delay(TTL);
                expect(i).toBe(1);
            });
        });
    });
    describe("Group tests:", () => {
        test("method: addListener / dispatch", async () => {
            const event: TestEventA = new TestEventA({
                type: TestEventA.name,
            });

            let result_a: TestEventA | null = null;
            await eventBusA.addListener(TestEventA, (event) => {
                result_a = event;
            });

            let result_b: TestEventA | null = null;
            await eventBusB.addListener(TestEventA, (event) => {
                result_b = event;
            });

            await eventBusA.dispatch(event);

            expect(result_a).toEqual(event);
            expect(result_a).toBeInstanceOf(TestEventA);
            expect(result_b).toBeNull();
        });
        test("method: addListenerMany / dispatch", async () => {
            const event: TestEventA = new TestEventA({
                type: "type",
            });

            let result_a: TestEventA | null = null;
            await eventBusA.addListenerMany([TestEventA], (event) => {
                result_a = event;
            });

            let result_b: TestEventA | null = null;
            await eventBusB.addListenerMany([TestEventA], (event) => {
                result_b = event;
            });

            await eventBusA.dispatch(event);

            expect(result_a).toEqual(event);
            expect(result_a).toBeInstanceOf(TestEventA);
            expect(result_b).toBeNull();
        });
        test("method: removeListener / addListener / dispatch", async () => {
            const event: TestEventA = new TestEventA({
                type: TestEventA.name,
            });

            let result_a: TestEventA | null = null;
            await eventBusA.addListener(TestEventA, (event) => {
                result_a = event;
            });

            let result_b: TestEventA | null = null;
            const listenerB = (event: TestEventA) => {
                result_b = event;
            };
            await eventBusB.addListener(TestEventA, listenerB);
            await eventBusB.removeListener(TestEventA, listenerB);

            await eventBusA.dispatch(event);
            await eventBusB.dispatch(event);

            expect(result_a).toEqual(event);
            expect(result_a).toBeInstanceOf(TestEventA);
            expect(result_b).toBeNull();
        });
        test("method: removeListenerMany / addListener / dispatch", async () => {
            const event: TestEventA = new TestEventA({
                type: TestEventA.name,
            });

            let result_a: TestEventA | null = null;
            await eventBusA.addListener(TestEventA, (event) => {
                result_a = event;
            });

            let result_b: TestEventA | null = null;
            const listenerB = (event: TestEventA) => {
                result_b = event;
            };
            await eventBusB.addListener(TestEventA, listenerB);
            await eventBusB.removeListenerMany([TestEventA], listenerB);

            await eventBusA.dispatch(event);
            await eventBusB.dispatch(event);

            expect(result_a).toEqual(event);
            expect(result_a).toBeInstanceOf(TestEventA);
            expect(result_b).toBeNull();
        });
        test("method: subscribe / dispatch", async () => {
            const event: TestEventA = new TestEventA({
                type: TestEventA.name,
            });

            let result_a: BaseEvent | null = null;
            await eventBusA.subscribe(TestEventA, (event) => {
                result_a = event;
            });

            let result_b: BaseEvent | null = null;
            const listenerB = (event: BaseEvent) => {
                result_b = event;
            };
            const unsubscribe = await eventBusB.subscribe(
                TestEventA,
                listenerB,
            );
            await unsubscribe();

            await eventBusA.dispatch(event);
            await eventBusB.dispatch(event);

            expect(result_a).toEqual(event);
            expect(result_a).toBeInstanceOf(TestEventA);
            expect(result_b).toBeNull();
        });
        test("method: subscribeMany / dispatch", async () => {
            const event: TestEventA = new TestEventA({
                type: TestEventA.name,
            });

            let result_a: TestEventA | null = null;
            await eventBusA.subscribeMany([TestEventA], (event) => {
                result_a = event;
            });

            let result_b: TestEventA | null = null;
            const listenerB = (event: TestEventA) => {
                result_b = event;
            };
            const unsubscribe = await eventBusB.subscribeMany(
                [TestEventA],
                listenerB,
            );
            await unsubscribe();

            await eventBusA.dispatch(event);
            await eventBusB.dispatch(event);

            expect(result_a).toEqual(event);
            expect(result_a).toBeInstanceOf(TestEventA);
            expect(result_b).toBeNull();
        });
    });
}
