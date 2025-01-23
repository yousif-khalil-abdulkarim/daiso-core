/**
 * @module EventBus
 */

import {
    type TestAPI,
    type SuiteAPI,
    type ExpectStatic,
    type beforeEach,
} from "vitest";
import { BaseEvent, type IEventBus } from "@/event-bus/contracts/_module";
import { type Promisable } from "@/utilities/_module";
import { TimeSpan } from "@/utilities/_module";
import { delay } from "@/async/_module";
import type { IFlexibleSerde } from "@/serde/contracts/_module";
import { NoOpSerde } from "@/serde/implementations/_module";

/**
 * @group Utilities
 */
export type EventBusTestSuiteSettings = {
    expect: ExpectStatic;
    serde?: IFlexibleSerde;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createEventBusA: () => Promisable<IEventBus>;
    createEventBusB: () => Promisable<IEventBus>;
};

/**
 * The <i>eventBusTestSuite</i> function simplifies the process of testing your custom implementation of <i>{@link IEventBus}</i> with vitest.
 * @group Utilities
 * @example
 * ```ts
 * import { describe, test, beforeEach, expect, afterEach } from "vitest";
 * import type { StartedRedisContainer } from "@testcontainers/redis";
 * import { RedisContainer } from "@testcontainers/redis";
 * import Redis from "ioredis";
 * import { SuperJsonSerde, TimeSpan, RedisPubSubEventBusAdapter, eventBusTestSuite, serde } from "@daiso-tech/core";
 *
 * const timeout = TimeSpan.fromMinutes(2);
 * describe("class: EventBus", () => {
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
 *    eventBusTestSuite({
 *      createEventBusA: () =>
 *        new EventBus(
 *          new RedisPubSubEventBusAdapter({
 *            dispatcherClient,
 *            listenerClient,
 *            serde,
 *          }),
 *          { rootGroup: "@a" }
 *        ),
 *      createEventBusB: () =>
 *        new EventBus(
 *          new RedisPubSubEventBusAdapter({
 *            dispatcherClient,
 *            listenerClient,
 *            serde,
 *          }),
 *          { rootGroup: "@b" }
 *        ),
 *      serde,
 *      test,
 *      beforeEach,
 *      expect,
 *      describe,
 *   });
 * });
 * ```
 */
export function eventBusTestSuite(settings: EventBusTestSuiteSettings): void {
    const {
        expect,
        serde = new NoOpSerde(),
        test,
        describe,
        createEventBusA,
        createEventBusB,
        beforeEach,
    } = settings;
    let eventBusA: IEventBus;
    let eventBusB: IEventBus;
    beforeEach(async () => {
        eventBusA = await createEventBusA();
        eventBusB = await createEventBusB();
    });

    const TTL = TimeSpan.fromMilliseconds(50);
    class TestEventA extends BaseEvent {
        static override deserialize(
            serializedEvent: Record<string, unknown>,
        ): BaseEvent {
            return new TestEventA(serializedEvent);
        }

        constructor(public readonly data: Record<string, unknown>) {
            super();
        }

        override serialize(): Record<string, unknown> {
            return this.data;
        }
    }
    class TestEventB extends BaseEvent {
        static override deserialize(
            serializedEvent: Record<string, unknown>,
        ): BaseEvent {
            return new TestEventB(serializedEvent);
        }

        constructor(public readonly data: Record<string, unknown>) {
            super();
        }

        override serialize(): Record<string, unknown> {
            return this.data;
        }
    }
    serde.registerClass(TestEventA);
    serde.registerClass(TestEventB);

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
