/**
 * @module EventBus
 */

import {
    type TestAPI,
    type SuiteAPI,
    type ExpectStatic,
    type beforeEach,
} from "vitest";
import { type IBaseEvent, type IEventBus } from "@/event-bus/contracts/_module";
import { type Promisable } from "@/utilities/_module";
import { TimeSpan } from "@/utilities/_module";
import { delay } from "@/async/_module";

/**
 * @group Utilities
 */
export type EventBusTestSuiteSettings = {
    expect: ExpectStatic;
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
 * import { SuperJsonSerde, TimeSpan, RedisPubSubEventBusAdapter, eventBusTestSuite } from "@daiso-tech/core";
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
    describe("Api tests:", () => {
        describe("method: addListener, removeListener, dispatch", () => {
            test("Should be null when listener added and event is not triggered", async () => {
                const TYPE = "type";
                let result: IBaseEvent | null = null;
                await eventBusA.addListener(TYPE, (event) => {
                    result = event;
                });
                expect(result).toBeNull();
            });
            test("Should be IBaseEvent when listener added and event is triggered", async () => {
                const event: IBaseEvent = {
                    type: "type",
                };
                let result: IBaseEvent | null = null;
                await eventBusA.addListener(event.type, (event) => {
                    result = event;
                });
                await eventBusA.dispatch(event);
                await delay(TTL);
                expect(result).toEqual(event);
            });
            test("Should be null when listener removed and event is triggered", async () => {
                const event: IBaseEvent = {
                    type: "type",
                };
                let result: IBaseEvent | null = null;
                const listener = (event: IBaseEvent) => {
                    result = event;
                };
                await eventBusA.addListener(event.type, listener);
                await eventBusA.removeListener(event.type, listener);
                await eventBusA.dispatch(event);
                await delay(TTL);
                expect(result).toBeNull();
            });
        });
        describe("method: addListenerMany, removeListenerMany, dispatch", () => {
            test("Should be null when listener added and event is not triggered", async () => {
                const TYPE_1 = "type_1";
                const TYPE_2 = "type_2";
                let result: IBaseEvent | null = null;
                await eventBusA.addListenerMany([TYPE_1, TYPE_2], (event) => {
                    result = event;
                });
                expect(result).toBeNull();
            });
            test("Should be IBaseEvent when listener added and event is triggered", async () => {
                const event_1: IBaseEvent = {
                    type: "type_1",
                };
                const event_2: IBaseEvent = {
                    type: "type_2",
                };
                let result_1: IBaseEvent | null = null;
                let result_2: IBaseEvent | null = null;
                await eventBusA.addListenerMany(
                    [event_1.type, event_2.type],
                    (eventObj: IBaseEvent) => {
                        if (eventObj.type === event_1.type) {
                            result_1 = eventObj;
                        }
                        if (eventObj.type === event_2.type) {
                            result_2 = eventObj;
                        }
                    },
                );
                await eventBusA.dispatchMany([event_1, event_2]);
                await delay(TTL);
                expect(result_1).toEqual(event_1);
                expect(result_2).toEqual(event_2);
            });
            test("Should be null when listener removed and event is triggered", async () => {
                const event_A: IBaseEvent = {
                    type: "type_a",
                };
                const event_B: IBaseEvent = {
                    type: "type_b",
                };
                let result: IBaseEvent | null = null;
                const listener = (event: IBaseEvent) => {
                    result = event;
                };
                await eventBusA.addListenerMany(
                    [event_A.type, event_B.type],
                    listener,
                );
                await eventBusA.removeListenerMany(
                    [event_A.type, event_B.type],
                    listener,
                );
                await eventBusA.dispatchMany([event_A, event_B]);
                await delay(TTL);
                expect(result).toBeNull();
            });
        });
        describe("method: subscribe", () => {
            test("Should be null when listener added and event is not triggered", async () => {
                const TYPE = "type";
                let result: IBaseEvent | null = null;
                await eventBusA.subscribe(TYPE, (event) => {
                    result = event;
                });
                expect(result).toBeNull();
            });
            test("Should be IBaseEvent when listener added and event is triggered", async () => {
                const event: IBaseEvent = {
                    type: "type",
                };
                let result: IBaseEvent | null = null;
                await eventBusA.subscribe(event.type, (event) => {
                    result = event;
                });
                await delay(TTL);
                await eventBusA.dispatch(event);
                expect(result).toEqual(event);
            });
            test("Should be null when listener removed and event is triggered", async () => {
                const event: IBaseEvent = {
                    type: "type",
                };
                let result: IBaseEvent | null = null;
                const listener = (event: IBaseEvent) => {
                    result = event;
                };
                const unsubscribe = await eventBusA.subscribe(
                    event.type,
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
                const TYPE_1 = "type_1";
                const TYPE_2 = "type_2";
                let result: IBaseEvent | null = null;
                await eventBusA.subscribeMany([TYPE_1, TYPE_2], (event) => {
                    result = event;
                });
                expect(result).toBeNull();
            });
            test("Should be IBaseEvent when listener added and event is triggered", async () => {
                const event_1: IBaseEvent = {
                    type: "type_1",
                };
                const event_2: IBaseEvent = {
                    type: "type_2",
                };
                let result_1: IBaseEvent | null = null;
                let result_2: IBaseEvent | null = null;
                await eventBusA.subscribeMany(
                    [event_1.type, event_2.type],
                    (eventObj: IBaseEvent) => {
                        if (eventObj.type === event_1.type) {
                            result_1 = eventObj;
                        }
                        if (eventObj.type === event_2.type) {
                            result_2 = eventObj;
                        }
                    },
                );
                await delay(TTL);
                await eventBusA.dispatchMany([event_1, event_2]);
                expect(result_1).toEqual(event_1);
                expect(result_2).toEqual(event_2);
            });
            test("Should be null when listener removed and event is triggered", async () => {
                const event_A: IBaseEvent = {
                    type: "type_a",
                };
                const event_B: IBaseEvent = {
                    type: "type_b",
                };
                let result: IBaseEvent | null = null;
                const listener = (event: IBaseEvent) => {
                    result = event;
                };
                const unsubscribe = await eventBusA.subscribeMany(
                    [event_A.type, event_B.type],
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
                const TYPE = "type";
                let result: IBaseEvent | null = null;
                await eventBusA.listenOnce(TYPE, (event) => {
                    result = event;
                });
                expect(result).toBeNull();
            });
            test("Should be IBaseEvent when listener added and event is triggered", async () => {
                const event: IBaseEvent = {
                    type: "type",
                };
                let result: IBaseEvent | null = null;
                await eventBusA.listenOnce(event.type, (event) => {
                    result = event;
                });
                await eventBusA.dispatch(event);
                await delay(TTL);
                expect(result).toEqual(event);
            });
            test("Should only listen for event once", async () => {
                const event: IBaseEvent = {
                    type: "type",
                };
                let i = 0;
                await eventBusA.listenOnce(event.type, () => {
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
            const event: IBaseEvent = {
                type: "type",
            };

            let result_a: IBaseEvent | null = null;
            await eventBusA.addListener(event.type, (event) => {
                result_a = event;
            });

            let result_b: IBaseEvent | null = null;
            await eventBusB.addListener(event.type, (event) => {
                result_b = event;
            });

            await eventBusA.dispatch(event);

            expect(result_a).toEqual(event);
            expect(result_b).toBeNull();
        });
        test("method: addListenerMany / dispatch", async () => {
            const event: IBaseEvent = {
                type: "type",
            };

            let result_a: IBaseEvent | null = null;
            await eventBusA.addListenerMany([event.type], (event) => {
                result_a = event;
            });

            let result_b: IBaseEvent | null = null;
            await eventBusB.addListenerMany([event.type], (event) => {
                result_b = event;
            });

            await eventBusA.dispatch(event);

            expect(result_a).toEqual(event);
            expect(result_b).toBeNull();
        });
        test("method: removeListener / addListener / dispatch", async () => {
            const event: IBaseEvent = {
                type: "type",
            };

            let result_a: IBaseEvent | null = null;
            await eventBusA.addListener(event.type, (event) => {
                result_a = event;
            });

            let result_b: IBaseEvent | null = null;
            const listenerB = (event: IBaseEvent) => {
                result_b = event;
            };
            await eventBusB.addListener(event.type, listenerB);
            await eventBusB.removeListener(event.type, listenerB);

            await eventBusA.dispatch(event);
            await eventBusB.dispatch(event);

            expect(result_a).toEqual(event);
            expect(result_b).toBeNull();
        });
        test("method: removeListenerMany / addListener / dispatch", async () => {
            const event: IBaseEvent = {
                type: "type",
            };

            let result_a: IBaseEvent | null = null;
            await eventBusA.addListener(event.type, (event) => {
                result_a = event;
            });

            let result_b: IBaseEvent | null = null;
            const listenerB = (event: IBaseEvent) => {
                result_b = event;
            };
            await eventBusB.addListener(event.type, listenerB);
            await eventBusB.removeListenerMany([event.type], listenerB);

            await eventBusA.dispatch(event);
            await eventBusB.dispatch(event);

            expect(result_a).toEqual(event);
            expect(result_b).toBeNull();
        });
        test("method: subscribe / dispatch", async () => {
            const event: IBaseEvent = {
                type: "type",
            };

            let result_a: IBaseEvent | null = null;
            await eventBusA.subscribe(event.type, (event) => {
                result_a = event;
            });

            let result_b: IBaseEvent | null = null;
            const listenerB = (event: IBaseEvent) => {
                result_b = event;
            };
            const unsubscribe = await eventBusB.subscribe(
                event.type,
                listenerB,
            );
            await unsubscribe();

            await eventBusA.dispatch(event);
            await eventBusB.dispatch(event);

            expect(result_a).toEqual(event);
            expect(result_b).toBeNull();
        });
        test("method: subscribeMany / dispatch", async () => {
            const event: IBaseEvent = {
                type: "type",
            };

            let result_a: IBaseEvent | null = null;
            await eventBusA.subscribeMany([event.type], (event) => {
                result_a = event;
            });

            let result_b: IBaseEvent | null = null;
            const listenerB = (event: IBaseEvent) => {
                result_b = event;
            };
            const unsubscribe = await eventBusB.subscribeMany(
                [event.type],
                listenerB,
            );
            await unsubscribe();

            await eventBusA.dispatch(event);
            await eventBusB.dispatch(event);

            expect(result_a).toEqual(event);
            expect(result_b).toBeNull();
        });
    });
}
