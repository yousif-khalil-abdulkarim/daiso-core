/**
 * @module SharedLock
 */
import {
    type TestAPI,
    type SuiteAPI,
    type ExpectStatic,
    type beforeEach,
} from "vitest";
import type {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ISharedLock,
    ISharedLockProvider,
} from "@/shared-lock/contracts/_module-exports.js";

import type { Promisable } from "@/utilities/_module-exports.js";
import type { TimeSpan } from "@/utilities/_module-exports.js";
import type { ISerde } from "@/serde/contracts/_module-exports.js";
import { NoOpSerdeAdapter } from "@/serde/implementations/adapters/_module-exports.js";
import { Serde } from "@/serde/implementations/derivables/_module-exports.js";
import { LazyPromise } from "@/async/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/test-utilities"`
 * @group Utilities
 */
export type SharedLockProviderTestSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createSharedLockProvider: () => Promisable<{
        sharedLockProvider: ISharedLockProvider;
        serde: ISerde;
    }>;

    /**
     * @default true
     */
    includeSerdeTests?: boolean;

    /**
     * @default true
     */
    includeEventTests?: boolean;
};

/**
 * The `sharedLockProviderTestSuite` function simplifies the process of testing your custom implementation of {@link ISharedLock | `ISharedLock`} with `vitest`.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/test-utilities"`
 * @group Utilities
 * @example
 * ```ts
 * import { describe, expect, test, beforeEach } from "vitest";
 * import { MemorySharedLockAdapter } from "@daiso-tech/core/shared-lock/adapters";
 * import { SharedLockProvider } from "@daiso-tech/core/shared-lock";
 * import { EventBus } from "@daiso-tech/core/event-bus";
 * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
 * import { sharedLockProviderTestSuite } from "@daiso-tech/core/shared-lock/test-utilities";
 * import { Serde } from "@daiso-tech/core/serde";
 * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
 * import type { ISharedLockData } from "@daiso-tech/core/shared-lock/contracts";
 *
 * describe("class: SharedLockProvider", () => {
 *     sharedLockProviderTestSuite({
 *         createSharedLockProvider: () => {
 *             const serde = new Serde(new SuperJsonSerdeAdapter());
 *             const sharedLockProvider = new SharedLockProvider({
 *                 serde,
 *                 adapter: new MemorySharedLockAdapter(),
 *             });
 *             return { sharedLockProvider, serde };
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
export function sharedLockProviderTestSuite(
    settings: SharedLockProviderTestSuiteSettings,
): void {
    const {
        expect,
        test,
        createSharedLockProvider,
        describe,
        beforeEach,
        includeEventTests = true,
        includeSerdeTests = true,
    } = settings;

    let sharedLockProvider: ISharedLockProvider;
    let serde: ISerde;
    async function delay(time: TimeSpan): Promise<void> {
        await LazyPromise.delay(time.addMilliseconds(10));
    }
    const RETURN_VALUE = "RETURN_VALUE";
    describe("Reusable tests:", () => {
        beforeEach(async () => {
            const { sharedLockProvider: sharedLockProvider_, serde: serde_ } =
                await createSharedLockProvider();
            sharedLockProvider = sharedLockProvider_;
            serde = serde_;
        });
        describe("Api tests:", () => {
            test.todo("Write tests!!!");
        });
        if (includeEventTests) {
            describe("Event tests:", () => {
                test.todo("Write tests!!!");
            });
        }
        if (includeSerdeTests) {
            describe("Serde tests:", () => {
                test.todo("Write tests!!!");
            });
        }
    });
}
