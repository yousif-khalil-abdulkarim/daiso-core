/**
 * @module Cache
 */

import {
    type TestAPI,
    type SuiteAPI,
    type ExpectStatic,
    type beforeEach,
} from "vitest";
import {
    KeyNotFoundCacheError,
    type ICache,
    type NotFoundCacheEvent,
    type AddedCacheEvent,
    type DecrementedCacheEvent,
    type FoundCacheEvent,
    type IncrementedCacheEvent,
    type RemovedCacheEvent,
    type ClearedCacheEvent,
    type UpdatedCacheEvent,
    CACHE_EVENTS,
} from "@/cache/contracts/_module.js";
import { type Promisable } from "@/utilities/_module.js";
import { Task } from "@/task/implementations/_module.js";
import { TimeSpan } from "@/time-span/implementations/_module.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/test-utilities"`
 * @group TestUtilities
 */
export type CacheTestSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createCache: () => Promisable<ICache>;
};

/**
 * The `cacheTestSuite` function simplifies the process of testing your custom implementation of {@link ICache | `ICache`} with `vitest`.
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/test-utilities"`
 * @group TestUtilities
 * @example
 * ```ts
 * import { beforeEach, describe, expect, test } from "vitest";
 * import { cacheTestSuite } from "@daiso-tech/core/cache/test-utilities";
 * import { MemoryCacheAdapter } from "@daiso-tech/core/cache/memory-cache-adapter";
 * import { Cache } from "@daiso-tech/core/cache";
 *
 * describe("class: Cache", () => {
 *     cacheTestSuite({
 *       createCache: () => {
 *           return new Cache({
 *               adapter: new MemoryCacheAdapter(),
 *           });
 *       },
 *       test,
 *       beforeEach,
 *       expect,
 *       describe,
 *   });
 * });
 * ```
 */
export function cacheTestSuite(settings: CacheTestSuiteSettings): void {
    const { expect, test, createCache, describe, beforeEach } = settings;
    let cache: ICache<any>;
    beforeEach(async () => {
        cache = await createCache();
    });

    const TTL = TimeSpan.fromMilliseconds(50);
    const DELAY_TIME = TimeSpan.fromMilliseconds(50);
    describe("Api tests:", () => {
        test.todo("Write tests!!!");
    });
    describe("Event tests:", () => {
        test.todo("Write tests!!!");
    });
}
