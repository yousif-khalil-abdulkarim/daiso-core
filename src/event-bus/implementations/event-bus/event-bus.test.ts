import { describe, test, beforeEach, expect } from "vitest";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/memory-event-bus-adapter/memory-event-bus-adapter";
import { EventBus } from "@/event-bus/implementations/event-bus/event-bus";
import type { IBaseEvent, IEventBus } from "@/event-bus/contracts/_module";
import { delay, TimeSpan } from "@/utilities/_module";

describe("class: EventBus", () => {
    describe("Api tests:", () => {
        let eventBus: IEventBus<IBaseEvent>;
        beforeEach(() => {
            eventBus = new EventBus(new MemoryEventBusAdapter());
        });
        describe("method: addListener, removeListener, dispatch", () => {
            test("Should be null when listener added and event is not triggered", async () => {
                const TYPE = "type";
                let result: IBaseEvent | null = null;
                await eventBus.addListener(TYPE, (event) => {
                    result = event;
                });
                expect(result).toBeNull();
            });
            test("Should be IBaseEvent when listener added and event is triggered", async () => {
                const event: IBaseEvent = {
                    type: "type",
                };
                let result: IBaseEvent | null = null;
                await eventBus.addListener(event.type, (event) => {
                    result = event;
                });
                await delay(TimeSpan.fromMilliseconds(50));
                await eventBus.dispatch([event]);
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
                await eventBus.addListener(event.type, listener);
                await eventBus.removeListener(event.type, listener);
                await delay(TimeSpan.fromMilliseconds(50));
                await eventBus.dispatch([event]);
                expect(result).toBeNull();
            });
        });
        describe("method: addListenerMany, removeListenerMany, dispatch", () => {
            test("Should be null when listener added and event is not triggered", async () => {
                const TYPE_1 = "type_1";
                const TYPE_2 = "type_2";
                let result: IBaseEvent | null = null;
                await eventBus.addListenerMany([TYPE_1, TYPE_2], (event) => {
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
                await eventBus.addListenerMany(
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
                await delay(TimeSpan.fromMilliseconds(50));
                await eventBus.dispatch([event_1, event_2]);
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
                await eventBus.addListenerMany(
                    [event_A.type, event_B.type],
                    listener,
                );
                await eventBus.removeListenerMany(
                    [event_A.type, event_B.type],
                    listener,
                );
                await delay(TimeSpan.fromMilliseconds(50));
                await eventBus.dispatch([event_A, event_B]);
                expect(result).toBeNull();
            });
        });
    });
    describe("Namespace tests:", () => {
        let eventBusA: IEventBus<IBaseEvent>;
        let eventBusB: IEventBus<IBaseEvent>;
        beforeEach(() => {
            eventBusA = new EventBus(new MemoryEventBusAdapter(), {
                namespace: "@a/",
            });
            eventBusB = new EventBus(new MemoryEventBusAdapter(), {
                namespace: "@b/",
            });
        });
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

            await eventBusA.dispatch([event]);

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

            await eventBusA.dispatch([event]);

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

            await eventBusA.dispatch([event]);
            await eventBusB.dispatch([event]);

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

            await eventBusA.dispatch([event]);
            await eventBusB.dispatch([event]);

            expect(result_a).toEqual(event);
            expect(result_b).toBeNull();
        });
    });
});
