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
    type EventListenerFn,
    type IEventBus,
    type IEventListenerObject,
} from "@/event-bus/contracts/_module-exports.js";
import { type Promisable } from "@/utilities/_module-exports.js";
import { TimeSpan } from "@/utilities/_module-exports.js";
import { LazyPromise } from "@/async/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/event-bus/test-utilities"`
 * @group TestUtilities
 */
export type EventBusTestSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createEventBus: () => Promisable<IEventBus>;
};

/**
 * The `eventBusTestSuite` function simplifies the process of testing your custom implementation of {@link IEventBus | `IEventBus`} with vitest.
 *
 * IMPORT_PATH: `"@daiso-tech/core/event-bus/test-utilities"`
 * @group TestUtilities
 */
export function eventBusTestSuite(settings: EventBusTestSuiteSettings): void {
    const { expect, test, describe, createEventBus, beforeEach } = settings;

    const TTL = TimeSpan.fromMilliseconds(50);
    type AddEvent = {
        a: number;
        b: number;
    };

    let eventBus: IEventBus<{
        add: AddEvent;
    }>;
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
                await eventBus.addListener("add", listener);
                expect(listener.result).toBeNull();
                await eventBus.removeListener("add", listener);
            });
            test("Class instance listener", async () => {
                class Listener implements IEventListenerObject<AddEvent> {
                    result: AddEvent | null = null;
                    invoke(event: AddEvent): Promisable<void> {
                        this.result = event;
                    }
                }
                const listener = new Listener();
                await eventBus.addListener("add", listener);
                expect(listener.result).toBeNull();
                await eventBus.removeListener("add", listener);
            });
            test("Function listener", async () => {
                let result = null as AddEvent | null;
                const listener: EventListenerFn<AddEvent> = (event) => {
                    result = event;
                };
                await eventBus.addListener("add", listener);
                expect(result).toBeNull();
                await eventBus.removeListener("add", listener);
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
                await eventBus.addListener("add", listener);
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
                await LazyPromise.delay(TTL);
                expect(listener.result).toEqual(event);
                await eventBus.removeListener("add", listener);
            });
            test("Class instance listener", async () => {
                class Listener implements IEventListenerObject<AddEvent> {
                    result: AddEvent | null = null;
                    invoke(event: AddEvent): Promisable<void> {
                        this.result = event;
                    }
                }
                const listener = new Listener();
                await eventBus.addListener("add", listener);
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
                await LazyPromise.delay(TTL);
                expect(listener.result).toEqual(event);
                await eventBus.removeListener("add", listener);
            });
            test("Function listener", async () => {
                let result = null as AddEvent | null;
                const listener: EventListenerFn<AddEvent> = (event) => {
                    result = event;
                };
                await eventBus.addListener("add", listener);
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
                await LazyPromise.delay(TTL);
                expect(result).toEqual(event);
                await eventBus.removeListener("add", listener);
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
                await eventBus.addListener("add", listener);
                await eventBus.removeListener("add", listener);
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
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
                await eventBus.addListener("add", listener);
                await eventBus.removeListener("add", listener);
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
                await LazyPromise.delay(TTL);
                expect(listener.result).toBeNull();
            });
            test("Function listener", async () => {
                let result = null as AddEvent | null;
                const listener: EventListenerFn<AddEvent> = (event) => {
                    result = event;
                };
                await eventBus.addListener("add", listener);
                await eventBus.removeListener("add", listener);
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
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
                const unsubscribe = await eventBus.subscribe("add", listener);
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
                const unsubscribe = await eventBus.subscribe("add", listener);
                expect(listener.result).toBeNull();
                await unsubscribe();
            });
            test("Function listener", async () => {
                let result = null as AddEvent | null;
                const listener: EventListenerFn<AddEvent> = (event) => {
                    result = event;
                };
                const unsubscribe = await eventBus.subscribe("add", listener);
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
                const unsubscribe = await eventBus.subscribe("add", listener);
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
                await LazyPromise.delay(TTL);
                expect(listener.result).toEqual(event);
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
                const unsubscribe = await eventBus.subscribe("add", listener);
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
                await LazyPromise.delay(TTL);
                expect(listener.result).toEqual(event);
                await unsubscribe();
            });
            test("Function listener", async () => {
                let result = null as AddEvent | null;
                const listener: EventListenerFn<AddEvent> = (event) => {
                    result = event;
                };
                const unsubscribe = await eventBus.subscribe("add", listener);
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
                await LazyPromise.delay(TTL);
                expect(result).toEqual(event);
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
                const unsubscribe = await eventBus.subscribe("add", listener);
                await unsubscribe();
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
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
                const unsubscribe = await eventBus.subscribe("add", listener);
                await unsubscribe();
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
                await LazyPromise.delay(TTL);
                expect(listener.result).toBeNull();
            });
            test("Function listener", async () => {
                let result = null as AddEvent | null;
                const listener: EventListenerFn<AddEvent> = (event) => {
                    result = event;
                };
                const unsubscribe = await eventBus.subscribe("add", listener);
                await unsubscribe();
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
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
                await eventBus.subscribe("add", listener);
                await eventBus.removeListener("add", listener);
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
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
                await eventBus.subscribe("add", listener);
                await eventBus.removeListener("add", listener);
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
                await LazyPromise.delay(TTL);
                expect(listener.result).toBeNull();
            });
            test("Function listener", async () => {
                let result = null as AddEvent | null;
                const listener: EventListenerFn<AddEvent> = (event) => {
                    result = event;
                };
                await eventBus.subscribe("add", listener);
                await eventBus.removeListener("add", listener);
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
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
                await eventBus.subscribeOnce("add", listener);
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
                await eventBus.subscribeOnce("add", listener);
                expect(listener.result).toBeNull();
            });
            test("Function listener", async () => {
                let result: AddEvent | null = null;
                const listener: EventListenerFn<AddEvent> = (event) => {
                    result = event;
                };
                await eventBus.subscribeOnce("add", listener);
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
                await eventBus.subscribeOnce("add", listener);
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
                await LazyPromise.delay(TTL);
                expect(listener.result).toEqual(event);
            });
            test("Class instance listener", async () => {
                class Listener implements IEventListenerObject<AddEvent> {
                    result: AddEvent | null = null;
                    invoke(event: AddEvent): Promisable<void> {
                        this.result = event;
                    }
                }
                const listener = new Listener();
                await eventBus.subscribeOnce("add", listener);
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
                await LazyPromise.delay(TTL);
                expect(listener.result).toEqual(event);
            });
            test("Function listener", async () => {
                let result: AddEvent | null = null;
                const listener: EventListenerFn<AddEvent> = (event) => {
                    result = event;
                };
                await eventBus.subscribeOnce("add", listener);
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
                await LazyPromise.delay(TTL);
                expect(result).toEqual(event);
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
                await eventBus.subscribeOnce("add", listener);
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
                await eventBus.dispatch("add", event);
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
                await eventBus.subscribeOnce("add", listener);
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
                await eventBus.dispatch("add", event);
                await LazyPromise.delay(TTL);
                expect(listener.i).toBe(1);
            });
            test("Function listener", async () => {
                let i = 0;
                const listener: EventListenerFn<AddEvent> = () => {
                    i++;
                };
                await eventBus.subscribeOnce("add", listener);
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
                await eventBus.dispatch("add", event);
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
                    "add",
                    listener,
                );
                await unsubscribe();
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
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
                    "add",
                    listener,
                );
                await unsubscribe();
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
                await LazyPromise.delay(TTL);
                expect(listener.result).toBeNull();
            });
            test("Function listener", async () => {
                let result = null as AddEvent | null;
                const listener: EventListenerFn<AddEvent> = (event) => {
                    result = event;
                };
                const unsubscribe = await eventBus.subscribeOnce(
                    "add",
                    listener,
                );
                await unsubscribe();
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
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
                await eventBus.subscribeOnce("add", listener);
                await eventBus.removeListener("add", listener);
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
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
                await eventBus.subscribeOnce("add", listener);
                await eventBus.removeListener("add", listener);
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
                await LazyPromise.delay(TTL);
                expect(listener.result).toBeNull();
            });
            test("Function listener", async () => {
                let result = null as AddEvent | null;
                const listener: EventListenerFn<AddEvent> = (event) => {
                    result = event;
                };
                await eventBus.subscribeOnce("add", listener);
                await eventBus.removeListener("add", listener);
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
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
                await eventBus.listenOnce("add", listener);
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
                await eventBus.listenOnce("add", listener);
                expect(listener.result).toBeNull();
            });
            test("Function listener", async () => {
                let result: AddEvent | null = null;
                const listener: EventListenerFn<AddEvent> = (event) => {
                    result = event;
                };
                await eventBus.listenOnce("add", listener);
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
                await eventBus.listenOnce("add", listener);
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
                await LazyPromise.delay(TTL);
                expect(listener.result).toEqual(event);
            });
            test("Class instance listener", async () => {
                class Listener implements IEventListenerObject<AddEvent> {
                    result: AddEvent | null = null;
                    invoke(event: AddEvent): Promisable<void> {
                        this.result = event;
                    }
                }
                const listener = new Listener();
                await eventBus.listenOnce("add", listener);
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
                await LazyPromise.delay(TTL);
                expect(listener.result).toEqual(event);
            });
            test("Function listener", async () => {
                let result: AddEvent | null = null;
                const listener: EventListenerFn<AddEvent> = (event) => {
                    result = event;
                };
                await eventBus.listenOnce("add", listener);
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
                await LazyPromise.delay(TTL);
                expect(result).toEqual(event);
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
                await eventBus.listenOnce("add", listener);
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
                await eventBus.dispatch("add", event);
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
                await eventBus.listenOnce("add", listener);
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
                await eventBus.dispatch("add", event);
                await LazyPromise.delay(TTL);
                expect(listener.i).toBe(1);
            });
            test("Function listener", async () => {
                let i = 0;
                const listener: EventListenerFn<AddEvent> = () => {
                    i++;
                };
                await eventBus.listenOnce("add", listener);
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
                await eventBus.dispatch("add", event);
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
                await eventBus.listenOnce("add", listener);
                await eventBus.removeListener("add", listener);
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
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
                await eventBus.listenOnce("add", listener);
                await eventBus.removeListener("add", listener);
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
                await LazyPromise.delay(TTL);
                expect(listener.result).toBeNull();
            });
            test("Function listener", async () => {
                let result = null as AddEvent | null;
                const listener: EventListenerFn<AddEvent> = (event) => {
                    result = event;
                };
                await eventBus.listenOnce("add", listener);
                await eventBus.removeListener("add", listener);
                const event: AddEvent = {
                    a: 1,
                    b: 2,
                };
                await eventBus.dispatch("add", event);
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
            eventBus.asPromise("add").then(listener);
            expect(result).toBeNull();
        });
        test("Should be AddEvent when listener added and event is triggered", async () => {
            let result: AddEvent | null = null;
            const listener: EventListenerFn<AddEvent> = (event) => {
                result = event;
            };
            eventBus.asPromise("add").then(listener);
            const event: AddEvent = {
                a: 1,
                b: 2,
            };
            await eventBus.dispatch("add", event);
            await LazyPromise.delay(TTL);
            expect(result).toEqual(event);
        });
    });
}
