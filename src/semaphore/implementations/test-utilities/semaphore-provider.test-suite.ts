/**
 * @module Semaphore
 */
import {
    type TestAPI,
    type SuiteAPI,
    type ExpectStatic,
    type beforeEach,
} from "vitest";
import type {
    ISemaphoreProvider,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ISemaphore,
} from "@/semaphore/contracts/_module-exports.js";
import { type Promisable } from "@/utilities/_module-exports.js";
import type { TimeSpan } from "@/utilities/_module-exports.js";
import type { ISerde } from "@/serde/contracts/_module-exports.js";
import { NoOpSerdeAdapter } from "@/serde/implementations/adapters/_module-exports.js";
import { Serde } from "@/serde/implementations/derivables/_module-exports.js";
import { LazyPromise } from "@/async/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/test-utilities"`
 * @group Utilities
 */
export type SemaphoreProviderTestSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createSemaphoreProvider: () => Promisable<ISemaphoreProvider>;
    serde?: ISerde;
};

/**
 * The `semaphoreProviderTestSuite` function simplifies the process of testing your custom implementation of {@link ISemaphore | `ISemaphore`} with `vitest`.
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/test-utilities"`
 * @group Utilities
 * @example
 * ```ts
 * import { describe, expect, test, beforeEach } from "vitest";
 * import { MemorySemaphoreAdapter } from "@daiso-tech/core/semaphore/adapters";
 * import { SemaphoreProvider } from "@daiso-tech/core/semaphore";
 * import { EventBus } from "@daiso-tech/core/event-bus";
 * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
 * import { semaphoreProviderTestSuite } from "@daiso-tech/core/semaphore/test-utilities";
 * import { Serde } from "@daiso-tech/core/serde";
 * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
 * import type { ISemaphoreData } from "@daiso-tech/core/semaphore/contracts";
 *
 * describe("class: SemaphoreProvider", () => {
 *     const serde = new Serde(new SuperJsonSerdeAdapter());
 *     let map: Map<string, ISemaphoreData>;
 *     semaphoreProviderTestSuite({
 *         createSemaphoreProvider: () => {
 *             return new SemaphoreProvider({
 *                 serde,
 *                 adapter: new MemorySemaphoreAdapter(),
 *             });
 *         },
 *         beforeEach,
 *         describe,
 *         expect,
 *         test,
 *         serde,
 *     });
 * });
 * ```
 */
export function semaphoreProviderTestSuite(
    settings: SemaphoreProviderTestSuiteSettings,
): void {
    const {
        expect,
        test,
        createSemaphoreProvider,
        describe,
        beforeEach,
        serde = new Serde(new NoOpSerdeAdapter()),
    } = settings;
    let provider: ISemaphoreProvider;
    beforeEach(async () => {
        provider = await createSemaphoreProvider();
    });

    async function delay(time: TimeSpan): Promise<void> {
        await LazyPromise.delay(time);
    }

    describe("Api tests:", () => {
        test.todo("Write tests");
    });
    describe("Event tests:", () => {
        test.todo("Write tests");
    });
    describe("Serde tests:", () => {
        test.todo("Write tests");
    });
}
