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
    type EventListenerFn,
    type IEventBus,
    type IEventListenerObject,
} from "@/event-bus/contracts/_module-exports.js";
import { type Promisable } from "@/utilities/_module-exports.js";
import { TimeSpan } from "@/utilities/_module-exports.js";
import { LazyPromise } from "@/async/_module-exports.js";
import type { IFlexibleSerde } from "@/serde/contracts/_module-exports.js";
import { Serde } from "@/serde/implementations/derivables/_module-exports.js";
import { NoOpSerdeAdapter } from "@/serde/implementations/adapters/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/test-utilities"```
 * @group TestUtilities
 */
export type EventBusTestSuiteSettings = {
    expect: ExpectStatic;
    serde?: IFlexibleSerde;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createEventBus: () => Promisable<IEventBus>;
};

/**
 * The <i>eventBusTestSuite</i> function simplifies the process of testing your custom implementation of <i>{@link IEventBus}</i> with vitest.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/test-utilities"```
 * @group TestUtilities
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

    const TTL = TimeSpan.fromMilliseconds(50);
    class AddEvent extends BaseEvent<{
        a: number;
        b: number;
    }> {}
    class SubEvent extends BaseEvent<{
        c: number;
        d: number;
    }> {}
    serde.registerEvent(AddEvent).registerEvent(SubEvent);

    let eventBus: IEventBus<AddEvent | SubEvent>;
    beforeEach(async () => {
        eventBus = await createEventBus();
    });

    describe("method: addListener, removeListener, dispatch", () => {
        describe("Should be null when listener is added and event is not triggered", () => {
            test("Object literal listener", async () => {
                const listener: IEventListenerObject<AddEvent> & {
                    result: AddEvent | null;
                } = {
                    result: null,
                    invoke(event: AddEvent): Promisable<void> {
                        this.result = event;
                    },
                };
                await eventBus.addListener(AddEvent, listener);
                expect(listener.result).toBeNull();
                await eventBus.removeListener(AddEvent, listener);
            });
            test("Class instance listener", async () => {
                class Listener implements IEventListenerObject<AddEvent> {
                    result: AddEvent | null = null;
                    invoke(event: AddEvent): Promisable<void> {
                        this.result = event;
                    }
                }
                const listener = new Listener();
                await eventBus.addListener(AddEvent, listener);
                expect(listener.result).toBeNull();
                await eventBus.removeListener(AddEvent, listener);
            });
            test("Function listener", async () => {
                let result = null as AddEvent | null;
                const listener: EventListenerFn<AddEvent> = (event) => {
                    result = event;
                };
                await eventBus.addListener(AddEvent, listener);
                expect(result).toBeNull();
                await eventBus.removeListener(AddEvent, listener);
            });
        });
        describe("Should be AddEvent when listener is added and event is triggered", () => {
            test("Object literal listener", async () => {
                const listener: IEventListenerObject<AddEvent> & {
                    result: AddEvent | null;
                } = {
                    result: null,
                    invoke(event: AddEvent): Promisable<void> {
                        this.result = event;
                    },
                };
                await eventBus.addListener(AddEvent, listener);
                const event = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(listener.result).toEqual(event);
                expect(listener.result).toBeInstanceOf(AddEvent);
                await eventBus.removeListener(AddEvent, listener);
            });
            test("Class instance listener", async () => {
                class Listener implements IEventListenerObject<AddEvent> {
                    result: AddEvent | null = null;
                    invoke(event: AddEvent): Promisable<void> {
                        this.result = event;
                    }
                }
                const listener = new Listener();
                await eventBus.addListener(AddEvent, listener);
                const event = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(listener.result).toEqual(event);
                expect(listener.result).toBeInstanceOf(AddEvent);
                await eventBus.removeListener(AddEvent, listener);
            });
            test("Function listener", async () => {
                let result = null as AddEvent | null;
                const listener: EventListenerFn<AddEvent> = (event) => {
                    result = event;
                };
                await eventBus.addListener(AddEvent, listener);
                const event = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(result).toEqual(event);
                expect(result).toBeInstanceOf(AddEvent);
                await eventBus.removeListener(AddEvent, listener);
            });
        });
        describe("Should be null when listener is removed and event is triggered", () => {
            test("Object literal listener", async () => {
                const listener: IEventListenerObject<AddEvent> & {
                    result: AddEvent | null;
                } = {
                    result: null,
                    invoke(event: AddEvent): Promisable<void> {
                        this.result = event;
                    },
                };
                await eventBus.addListener(AddEvent, listener);
                await eventBus.removeListener(AddEvent, listener);
                const event = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(listener.result).toBeNull();
            });
            test("Class instance listener", async () => {
                class Listener implements IEventListenerObject<AddEvent> {
                    result: AddEvent | null = null;
                    invoke(event: AddEvent): Promisable<void> {
                        this.result = event;
                    }
                }
                const listener = new Listener();
                await eventBus.addListener(AddEvent, listener);
                await eventBus.removeListener(AddEvent, listener);
                const event = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(listener.result).toBeNull();
            });
            test("Function listener", async () => {
                let result = null as AddEvent | null;
                const listener: EventListenerFn<AddEvent> = (event) => {
                    result = event;
                };
                await eventBus.addListener(AddEvent, listener);
                await eventBus.removeListener(AddEvent, listener);
                const event = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(result).toBeNull();
            });
        });
    });
    describe("method: subscribe, dispatch", () => {
        describe("Should be null when listener is added and event is not triggered", () => {
            test("Object literal listener", async () => {
                const listener: IEventListenerObject<AddEvent> & {
                    result: AddEvent | null;
                } = {
                    result: null,
                    invoke(event: AddEvent): Promisable<void> {
                        this.result = event;
                    },
                };
                const unsubscribe = await eventBus.subscribe(
                    AddEvent,
                    listener,
                );
                expect(listener.result).toBeNull();
                await unsubscribe();
            });
            test("Class instance listener", async () => {
                class Listener implements IEventListenerObject<AddEvent> {
                    result: AddEvent | null = null;
                    invoke(event: AddEvent): Promisable<void> {
                        this.result = event;
                    }
                }
                const listener = new Listener();
                const unsubscribe = await eventBus.subscribe(
                    AddEvent,
                    listener,
                );
                expect(listener.result).toBeNull();
                await unsubscribe();
            });
            test("Function listener", async () => {
                let result = null as AddEvent | null;
                const listener: EventListenerFn<AddEvent> = (event) => {
                    result = event;
                };
                const unsubscribe = await eventBus.subscribe(
                    AddEvent,
                    listener,
                );
                expect(result).toBeNull();
                await unsubscribe();
            });
        });
        describe("Should be AddEvent when listener is added and event is triggered", () => {
            test("Object literal listener", async () => {
                const listener: IEventListenerObject<AddEvent> & {
                    result: AddEvent | null;
                } = {
                    result: null,
                    invoke(event: AddEvent): Promisable<void> {
                        this.result = event;
                    },
                };
                const unsubscribe = await eventBus.subscribe(
                    AddEvent,
                    listener,
                );
                const event = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(listener.result).toEqual(event);
                expect(listener.result).toBeInstanceOf(AddEvent);
                await unsubscribe();
            });
            test("Class instance listener", async () => {
                class Listener implements IEventListenerObject<AddEvent> {
                    result: AddEvent | null = null;
                    invoke(event: AddEvent): Promisable<void> {
                        this.result = event;
                    }
                }
                const listener = new Listener();
                const unsubscribe = await eventBus.subscribe(
                    AddEvent,
                    listener,
                );
                const event = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(listener.result).toEqual(event);
                expect(listener.result).toBeInstanceOf(AddEvent);
                await unsubscribe();
            });
            test("Function listener", async () => {
                let result = null as AddEvent | null;
                const listener: EventListenerFn<AddEvent> = (event) => {
                    result = event;
                };
                const unsubscribe = await eventBus.subscribe(
                    AddEvent,
                    listener,
                );
                const event = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(result).toEqual(event);
                expect(result).toBeInstanceOf(AddEvent);
                await unsubscribe();
            });
        });
        describe("Should be null when listener is removed by unsubscribe and event is triggered", () => {
            test("Object literal listener", async () => {
                const listener: IEventListenerObject<AddEvent> & {
                    result: AddEvent | null;
                } = {
                    result: null,
                    invoke(event: AddEvent): Promisable<void> {
                        this.result = event;
                    },
                };
                const unsubscribe = await eventBus.subscribe(
                    AddEvent,
                    listener,
                );
                await unsubscribe();
                const event = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(listener.result).toBeNull();
            });
            test("Class instance listener", async () => {
                class Listener implements IEventListenerObject<AddEvent> {
                    result: AddEvent | null = null;
                    invoke(event: AddEvent): Promisable<void> {
                        this.result = event;
                    }
                }
                const listener = new Listener();
                const unsubscribe = await eventBus.subscribe(
                    AddEvent,
                    listener,
                );
                await unsubscribe();
                const event = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(listener.result).toBeNull();
            });
            test("Function listener", async () => {
                let result = null as AddEvent | null;
                const listener: EventListenerFn<AddEvent> = (event) => {
                    result = event;
                };
                const unsubscribe = await eventBus.subscribe(
                    AddEvent,
                    listener,
                );
                await unsubscribe();
                const event = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(result).toBeNull();
            });
        });
        describe("Should be null when listener is removed by removeListener and event is triggered", () => {
            test("Object literal listener", async () => {
                const listener: IEventListenerObject<AddEvent> & {
                    result: AddEvent | null;
                } = {
                    result: null,
                    invoke(event: AddEvent): Promisable<void> {
                        this.result = event;
                    },
                };
                await eventBus.subscribe(AddEvent, listener);
                await eventBus.removeListener(AddEvent, listener);
                const event = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(listener.result).toBeNull();
            });
            test("Class instance listener", async () => {
                class Listener implements IEventListenerObject<AddEvent> {
                    result: AddEvent | null = null;
                    invoke(event: AddEvent): Promisable<void> {
                        this.result = event;
                    }
                }
                const listener = new Listener();
                await eventBus.subscribe(AddEvent, listener);
                await eventBus.removeListener(AddEvent, listener);
                const event = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(listener.result).toBeNull();
            });
            test("Function listener", async () => {
                let result = null as AddEvent | null;
                const listener: EventListenerFn<AddEvent> = (event) => {
                    result = event;
                };
                await eventBus.subscribe(AddEvent, listener);
                await eventBus.removeListener(AddEvent, listener);
                const event = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(result).toBeNull();
            });
        });
    });
    describe("method: subscribeOnce", () => {
        describe("Should be null when listener added and event is not triggered", () => {
            test("Object literal listener", async () => {
                const listener: IEventListenerObject<AddEvent> & {
                    result: AddEvent | null;
                } = {
                    result: null,
                    invoke(event: AddEvent): Promisable<void> {
                        this.result = event;
                    },
                };
                await eventBus.subscribeOnce(AddEvent, listener);
                expect(listener.result).toBeNull();
            });
            test("Class instance listener", async () => {
                class Listener implements IEventListenerObject<AddEvent> {
                    result: AddEvent | null = null;
                    invoke(event: AddEvent): Promisable<void> {
                        this.result = event;
                    }
                }
                const listener = new Listener();
                await eventBus.subscribeOnce(AddEvent, listener);
                expect(listener.result).toBeNull();
            });
            test("Function listener", async () => {
                let result: AddEvent | null = null;
                const listener: EventListenerFn<AddEvent> = (event) => {
                    result = event;
                };
                await eventBus.subscribeOnce(AddEvent, listener);
                expect(result).toBeNull();
            });
        });
        describe("Should be AddEvent when listener added and event is triggered", () => {
            test("Object literal listener", async () => {
                const listener: IEventListenerObject<AddEvent> & {
                    result: AddEvent | null;
                } = {
                    result: null,
                    invoke(event: AddEvent): Promisable<void> {
                        this.result = event;
                    },
                };
                await eventBus.subscribeOnce(AddEvent, listener);
                const event: AddEvent = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(listener.result).toEqual(event);
                expect(listener.result).toBeInstanceOf(AddEvent);
            });
            test("Class instance listener", async () => {
                class Listener implements IEventListenerObject<AddEvent> {
                    result: AddEvent | null = null;
                    invoke(event: AddEvent): Promisable<void> {
                        this.result = event;
                    }
                }
                const listener = new Listener();
                await eventBus.subscribeOnce(AddEvent, listener);
                const event: AddEvent = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(listener.result).toEqual(event);
                expect(listener.result).toBeInstanceOf(AddEvent);
            });
            test("Function listener", async () => {
                let result: AddEvent | null = null;
                const listener: EventListenerFn<AddEvent> = (event) => {
                    result = event;
                };
                await eventBus.subscribeOnce(AddEvent, listener);
                const event: AddEvent = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(result).toEqual(event);
                expect(result).toBeInstanceOf(AddEvent);
            });
        });
        describe("Should only listen for event once", () => {
            test("Object literal listener", async () => {
                const listener: IEventListenerObject<AddEvent> & {
                    i: number;
                } = {
                    i: 0,
                    invoke(_event: AddEvent): Promisable<void> {
                        this.i++;
                    },
                };
                await eventBus.subscribeOnce(AddEvent, listener);
                const event: AddEvent = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(listener.i).toBe(1);
            });
            test("Class instance listener", async () => {
                class Listener implements IEventListenerObject<AddEvent> {
                    i = 0;
                    invoke(_event: AddEvent): Promisable<void> {
                        this.i++;
                    }
                }
                const listener = new Listener();
                await eventBus.subscribeOnce(AddEvent, listener);
                const event: AddEvent = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(listener.i).toBe(1);
            });
            test("Function listener", async () => {
                let i = 0;
                const listener: EventListenerFn<AddEvent> = () => {
                    i++;
                };
                await eventBus.subscribeOnce(AddEvent, listener);
                const event: AddEvent = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(i).toBe(1);
            });
        });
        describe("Should be null when listener is removed by unsubscribe function and event is triggered", () => {
            test("Object literal listener", async () => {
                const listener: IEventListenerObject<AddEvent> & {
                    result: AddEvent | null;
                } = {
                    result: null,
                    invoke(event: AddEvent): Promisable<void> {
                        this.result = event;
                    },
                };
                const unsubscribe = await eventBus.subscribeOnce(
                    AddEvent,
                    listener,
                );
                await unsubscribe();
                const event = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(listener.result).toBeNull();
            });
            test("Class instance listener", async () => {
                class Listener implements IEventListenerObject<AddEvent> {
                    result: AddEvent | null = null;
                    invoke(event: AddEvent): Promisable<void> {
                        this.result = event;
                    }
                }
                const listener = new Listener();
                const unsubscribe = await eventBus.subscribeOnce(
                    AddEvent,
                    listener,
                );
                await unsubscribe();
                const event = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(listener.result).toBeNull();
            });
            test("Function listener", async () => {
                let result = null as AddEvent | null;
                const listener: EventListenerFn<AddEvent> = (event) => {
                    result = event;
                };
                const unsubscribe = await eventBus.subscribeOnce(
                    AddEvent,
                    listener,
                );
                await unsubscribe();
                const event = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(result).toBeNull();
            });
        });
        describe("Should be null when listener is removed by removeListener method and event is triggered", () => {
            test("Object literal listener", async () => {
                const listener: IEventListenerObject<AddEvent> & {
                    result: AddEvent | null;
                } = {
                    result: null,
                    invoke(event: AddEvent): Promisable<void> {
                        this.result = event;
                    },
                };
                await eventBus.subscribeOnce(AddEvent, listener);
                await eventBus.removeListener(AddEvent, listener);
                const event = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(listener.result).toBeNull();
            });
            test("Class instance listener", async () => {
                class Listener implements IEventListenerObject<AddEvent> {
                    result: AddEvent | null = null;
                    invoke(event: AddEvent): Promisable<void> {
                        this.result = event;
                    }
                }
                const listener = new Listener();
                await eventBus.subscribeOnce(AddEvent, listener);
                await eventBus.removeListener(AddEvent, listener);
                const event = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(listener.result).toBeNull();
            });
            test("Function listener", async () => {
                let result = null as AddEvent | null;
                const listener: EventListenerFn<AddEvent> = (event) => {
                    result = event;
                };
                await eventBus.subscribeOnce(AddEvent, listener);
                await eventBus.removeListener(AddEvent, listener);
                const event = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(result).toBeNull();
            });
        });
    });
    describe("method: listenOnce", () => {
        describe("Should be null when listener added and event is not triggered", () => {
            test("Object literal listener", async () => {
                const listener: IEventListenerObject<AddEvent> & {
                    result: AddEvent | null;
                } = {
                    result: null,
                    invoke(event: AddEvent): Promisable<void> {
                        this.result = event;
                    },
                };
                await eventBus.listenOnce(AddEvent, listener);
                expect(listener.result).toBeNull();
            });
            test("Class instance listener", async () => {
                class Listener implements IEventListenerObject<AddEvent> {
                    result: AddEvent | null = null;
                    invoke(event: AddEvent): Promisable<void> {
                        this.result = event;
                    }
                }
                const listener = new Listener();
                await eventBus.listenOnce(AddEvent, listener);
                expect(listener.result).toBeNull();
            });
            test("Function listener", async () => {
                let result: AddEvent | null = null;
                const listener: EventListenerFn<AddEvent> = (event) => {
                    result = event;
                };
                await eventBus.listenOnce(AddEvent, listener);
                expect(result).toBeNull();
            });
        });
        describe("Should be AddEvent when listener added and event is triggered", () => {
            test("Object literal listener", async () => {
                const listener: IEventListenerObject<AddEvent> & {
                    result: AddEvent | null;
                } = {
                    result: null,
                    invoke(event: AddEvent): Promisable<void> {
                        this.result = event;
                    },
                };
                await eventBus.listenOnce(AddEvent, listener);
                const event: AddEvent = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(listener.result).toEqual(event);
                expect(listener.result).toBeInstanceOf(AddEvent);
            });
            test("Class instance listener", async () => {
                class Listener implements IEventListenerObject<AddEvent> {
                    result: AddEvent | null = null;
                    invoke(event: AddEvent): Promisable<void> {
                        this.result = event;
                    }
                }
                const listener = new Listener();
                await eventBus.listenOnce(AddEvent, listener);
                const event: AddEvent = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(listener.result).toEqual(event);
                expect(listener.result).toBeInstanceOf(AddEvent);
            });
            test("Function listener", async () => {
                let result: AddEvent | null = null;
                const listener: EventListenerFn<AddEvent> = (event) => {
                    result = event;
                };
                await eventBus.listenOnce(AddEvent, listener);
                const event: AddEvent = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(result).toEqual(event);
                expect(result).toBeInstanceOf(AddEvent);
            });
        });
        describe("Should only listen for event once", () => {
            test("Object literal listener", async () => {
                const listener: IEventListenerObject<AddEvent> & {
                    i: number;
                } = {
                    i: 0,
                    invoke(_event: AddEvent): Promisable<void> {
                        this.i++;
                    },
                };
                await eventBus.listenOnce(AddEvent, listener);
                const event: AddEvent = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(listener.i).toBe(1);
            });
            test("Class instance listener", async () => {
                class Listener implements IEventListenerObject<AddEvent> {
                    i = 0;
                    invoke(_event: AddEvent): Promisable<void> {
                        this.i++;
                    }
                }
                const listener = new Listener();
                await eventBus.listenOnce(AddEvent, listener);
                const event: AddEvent = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(listener.i).toBe(1);
            });
            test("Function listener", async () => {
                let i = 0;
                const listener: EventListenerFn<AddEvent> = () => {
                    i++;
                };
                await eventBus.listenOnce(AddEvent, listener);
                const event: AddEvent = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(i).toBe(1);
            });
        });
        describe("Should be null when listener is removed and event is triggered", () => {
            test("Object literal listener", async () => {
                const listener: IEventListenerObject<AddEvent> & {
                    result: AddEvent | null;
                } = {
                    result: null,
                    invoke(event: AddEvent): Promisable<void> {
                        this.result = event;
                    },
                };
                await eventBus.listenOnce(AddEvent, listener);
                await eventBus.removeListener(AddEvent, listener);
                const event = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(listener.result).toBeNull();
            });
            test("Class instance listener", async () => {
                class Listener implements IEventListenerObject<AddEvent> {
                    result: AddEvent | null = null;
                    invoke(event: AddEvent): Promisable<void> {
                        this.result = event;
                    }
                }
                const listener = new Listener();
                await eventBus.listenOnce(AddEvent, listener);
                await eventBus.removeListener(AddEvent, listener);
                const event = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(listener.result).toBeNull();
            });
            test("Function listener", async () => {
                let result = null as AddEvent | null;
                const listener: EventListenerFn<AddEvent> = (event) => {
                    result = event;
                };
                await eventBus.listenOnce(AddEvent, listener);
                await eventBus.removeListener(AddEvent, listener);
                const event = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBus.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(result).toBeNull();
            });
        });
    });
    describe("method: asPromise", () => {
        test("Should be null when listener added and event is not triggered", () => {
            let result: AddEvent | null = null;
            const listener: EventListenerFn<AddEvent> = (event) => {
                result = event;
            };
            eventBus.asPromise(AddEvent).then(listener);
            expect(result).toBeNull();
        });
        test("Should be AddEvent when listener added and event is triggered", async () => {
            let result: AddEvent | null = null;
            const listener: EventListenerFn<AddEvent> = (event) => {
                result = event;
            };
            eventBus.asPromise(AddEvent).then(listener);
            const event: AddEvent = new AddEvent({
                a: 1,
                b: 2,
            });
            await eventBus.dispatch(event);
            await LazyPromise.delay(TTL);
            expect(result).toEqual(event);
            expect(result).toBeInstanceOf(AddEvent);
        });
    });
}
