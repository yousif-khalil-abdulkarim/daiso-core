/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * @module RateLimiter
 */

import {
    type TestAPI,
    type SuiteAPI,
    type ExpectStatic,
    type beforeEach,
} from "vitest";
import { type IRateLimiterStorageAdapter } from "@/rate-limiter/contracts/_module.js";
import { type Promisable } from "@/utilities/_module.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/test-utilities"`
 * @group TestUtilities
 */
export type RateLimiterStorageAdapterTestSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createAdapter: () => Promisable<IRateLimiterStorageAdapter>;
};

/**
 * The `rateLimiterStorageAdapterTestSuite` function simplifies the process of testing your custom implementation of {@link IRateLimiterStorageAdapter | `IRateLimiterStorageAdapter`} with `vitest`.
 *
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/test-utilities"`
 * @group TestUtilities
 * @example
 * ```ts
 * import { afterEach, beforeEach, describe, expect, test } from "vitest";
 * import { rateLimiterStorageAdapterTestSuite } from "@daiso-tech/core/rate-limiter/test-utilities";
 * import { MemoryRateLimiterStorageAdapter } from "@daiso-tech/core/rate-limiter/memory-rate-limiter-storage-adapter";
 * import { TimeSpan } from "@daiso-tech/core/time-span" from "@daiso-tech/core/time-span";
 * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/super-json-serde-adapter";
 * import { Serde } from "@daiso-tech/core/serde";
 *
 * describe("class: MemoryRateLimiterStorageAdapter", () => {
 *     rateLimiterStorageAdapterTestSuite({
 *         createAdapter: () =>
 *             new MemoryRateLimiterStorageAdapter(),
 *         test,
 *         beforeEach,
 *         expect,
 *         describe,
 *     });
 * });
 * ```
 */
export function rateLimiterStorageAdapterTestSuite(
    settings: RateLimiterStorageAdapterTestSuiteSettings,
): void {
    const { expect, test, createAdapter, describe, beforeEach } = settings;
    let adapter: IRateLimiterStorageAdapter<string>;

    describe("Reusable tests:", () => {
        beforeEach(async () => {
            adapter =
                (await createAdapter()) as IRateLimiterStorageAdapter<string>;
        });

        describe("method: transaction upsert", () => {
            test.todo("Write tests!!!");
        });
        describe("method: transaction find", () => {
            test.todo("Write tests!!!");
        });
        describe("method: find", () => {
            test.todo("Write tests!!!");
        });
        describe("method: remove", () => {
            test.todo("Write tests!!!");
        });
    });
}
