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
    BaseEvent,
    IEventBusAdapter,
} from "@/event-bus/contracts/_module-exports.js";
import { type Promisable } from "@/utilities/_module-exports.js";
import { TimeSpan } from "@/utilities/_module-exports.js";
import { LazyPromise } from "@/async/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/event-bus/test-utilities"`
 * @group TestUtilities
 */
export type EventBusAdapterTestSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createAdapter: () => Promisable<IEventBusAdapter>;
};

/**
 * The `eventBusAdapterTestSuite` function simplifies the process of testing your custom implementation of {@link IEventBusAdapter | `IEventBusAdapter`} with vitest.
 *
 * IMPORT_PATH: `"@daiso-tech/core/event-bus/test-utilities"`
 * @group TestUtilities
 */
export function eventBusAdapterTestSuite(
    settings: EventBusAdapterTestSuiteSettings,
): void {
    const { expect, test, createAdapter, beforeEach } = settings;

    let adapter: IEventBusAdapter;
    beforeEach(async () => {
        adapter = await createAdapter();
    });

    const TTL = TimeSpan.fromMilliseconds(50);
    describe("method: addListener, removeListener, dispatch", () => {
        test("Should be null when listener added and event is not triggered", async () => {
            let result: BaseEvent | null = null;
            await adapter.addListener("event", (event: BaseEvent) => {
                result = event;
            });
            expect(result).toBeNull();
        });
        test("Should be TestEvent when listener added and event is triggered", async () => {
            let result: BaseEvent | null = null;
            await adapter.addListener("event", (event: BaseEvent) => {
                result = event;
            });
            const event = {
                type: "event",
            };
            await adapter.dispatch("event", event);
            await LazyPromise.delay(TTL);
            expect(result).toEqual(event);
        });
        test("Should be null when listener removed and event is triggered", async () => {
            let result: BaseEvent | null = null;
            const listener = (event: BaseEvent) => {
                result = event;
            };
            await adapter.addListener("event", listener);
            await adapter.removeListener("event", listener);
            const event = {
                type: "event",
            };
            await adapter.dispatch("event", event);
            await LazyPromise.delay(TTL);
            expect(result).toBeNull();
        });
    });
}
