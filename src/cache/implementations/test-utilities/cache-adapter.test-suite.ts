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
    TypeCacheError,
    type ICacheAdapter,
} from "@/cache/contracts/_module-exports.js";
import { type Promisable } from "@/utilities/_module-exports.js";
import { TimeSpan } from "@/utilities/_module-exports.js";
import { delay } from "@/async/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/implementations/test-utilities"```
 * @group Test utilities
 */
export type CacheAdapterTestSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createAdapter: () => Promisable<ICacheAdapter>;
};

/**
 * The <i>cacheAdapterTestSuite</i> function simplifies the process of testing your custom implementation of <i>{@link ICacheAdapter}</i> with <i>vitest</i>.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/implementations/test-utilities"```
 * @group Test utilities
 * @example
 * ```ts
 * import { afterEach, beforeEach, describe, expect, test } from "vitest";
 * import { cacheAdapterTestSuite } from "@daiso-tech/core/cache/implementations/test-utilities";
 * import { RedisCacheAdapter } from "@daiso-tech/core/cache/implementations/adapters";
 * import { Redis } from "ioredis";
 * import {
 *     RedisContainer,
 *     type StartedRedisContainer,
 * } from "@testcontainers/redis";
 * import { TimeSpan } from "@daiso-tech/core/utilities";
 * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/implementations/adapters";
 * import { Serde } from "@daiso-tech/core/serde/implementations/derivables";
 *
 * const timeout = TimeSpan.fromMinutes(2);
 * describe("class: RedisCacheAdapter", () => {
 *     let client: Redis;
 *     let startedContainer: StartedRedisContainer;
 *     beforeEach(async () => {
 *         startedContainer = await new RedisContainer("redis:7.4.2").start();
 *         client = new Redis(startedContainer.getConnectionUrl());
 *     }, timeout.toMilliseconds());
 *     afterEach(async () => {
 *         await client.quit();
 *         await startedContainer.stop();
 *     }, timeout.toMilliseconds());
 *     cacheAdapterTestSuite({
 *         createAdapter: () =>
 *             new RedisCacheAdapter({
 *                 database: client,
 *                 serde: new Serde(new SuperJsonSerdeAdapter()),
 *                 rootGroup: "@a",
 *             }),
 *         test,
 *         beforeEach,
 *         expect,
 *         describe,
 *     });
 * });
 *
 * ```
 */
export function cacheAdapterTestSuite(
    settings: CacheAdapterTestSuiteSettings,
): void {
    const { expect, test, createAdapter, describe, beforeEach } = settings;
    let cacheAdapterA: ICacheAdapter<any>;
    let cacheAdapterB: ICacheAdapter<any>;
    beforeEach(async () => {
        cacheAdapterA = await createAdapter();
        cacheAdapterB = cacheAdapterA.withGroup("b");
    });

    describe("Api tests:", () => {
        const TTL = TimeSpan.fromMilliseconds(50);
        describe("method: get", () => {
            test("Should return the value when key exists", async () => {
                await cacheAdapterA.add("a", 1, null);
                expect(await cacheAdapterA.get("a")).toBe(1);
            });
            test("Should return null when keys doesnt exists", async () => {
                expect(await cacheAdapterA.get("a")).toBeNull();
            });
            test("Should return null when key is experied", async () => {
                await cacheAdapterA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheAdapterA.get("a")).toBeNull();
            });
        });
        describe("method: add", () => {
            test("Should return true when key doesnt exists", async () => {
                expect(await cacheAdapterA.add("a", 1, null)).toBe(true);
            });
            test("Should return true when key is expired", async () => {
                await cacheAdapterA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheAdapterA.add("a", 1, null)).toBe(true);
            });
            test("Should persist values when key doesnt exist", async () => {
                await cacheAdapterA.add("a", 1, null);
                expect(await cacheAdapterA.get("a")).toBe(1);
            });
            test("Should persist values when key is expired", async () => {
                await cacheAdapterA.add("a", -1, TTL);
                await delay(TTL);
                await cacheAdapterA.add("a", 1, null);
                expect(await cacheAdapterA.get("a")).toBe(1);
            });
            test("Should return false when key exists", async () => {
                await cacheAdapterA.add("a", 1, null);
                expect(await cacheAdapterA.add("a", 1, null)).toBe(false);
            });
            test("Should not persist value when key exist", async () => {
                await cacheAdapterA.add("a", 1, null);
                await cacheAdapterA.add("a", 2, null);
                expect(await cacheAdapterA.get("a")).toBe(1);
            });
        });
        describe("method: update", () => {
            test("Should return true when key exists", async () => {
                await cacheAdapterA.add("a", 1, null);
                expect(await cacheAdapterA.update("a", -1)).toBe(true);
            });
            test("Should persist value when key exist", async () => {
                await cacheAdapterA.add("a", 1, null);
                await cacheAdapterA.update("a", -1);
                expect(await cacheAdapterA.get("a")).toBe(-1);
            });
            test("Should return false when key doesnt exists", async () => {
                expect(await cacheAdapterA.update("a", -1)).toBe(false);
            });
            test("Should return false when key is expired", async () => {
                await cacheAdapterA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheAdapterA.update("a", -1)).toBe(false);
            });
            test("Should not persist value when key doesnt exist", async () => {
                await cacheAdapterA.update("a", -1);
                expect(await cacheAdapterA.get("a")).toBeNull();
            });
            test("Should not persist value when key is expired", async () => {
                await cacheAdapterA.add("a", 1, TTL);
                await delay(TTL);
                await cacheAdapterA.update("a", -1);
                expect(await cacheAdapterA.get("a")).toBeNull();
            });
        });
        describe("method: put", () => {
            test("Should return only true when key exists", async () => {
                await cacheAdapterA.add("a", 1, null);
                expect(await cacheAdapterA.put("a", -1, null)).toBe(true);
            });
            test("Should persist value when key exist", async () => {
                await cacheAdapterA.add("a", 1, null);
                await cacheAdapterA.put("a", -1, null);
                expect(await cacheAdapterA.get("a")).toBe(-1);
            });
            test("Should return false when key doesnt exists", async () => {
                expect(await cacheAdapterA.put("a", -1, null)).toBe(false);
            });
            test("Should return false when key is expired", async () => {
                await cacheAdapterA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheAdapterA.put("a", -1, null)).toBe(false);
            });
            test("Should persist values when key doesnt exist", async () => {
                await cacheAdapterA.put("a", -1, null);
                expect(await cacheAdapterA.get("a")).toBe(-1);
            });
            test("Should persist values when key is expired", async () => {
                await cacheAdapterA.add("a", 1, TTL);
                await delay(TTL);
                await cacheAdapterA.put("a", -1, null);
                expect(await cacheAdapterA.get("a")).toBe(-1);
            });
            test("Should replace the ttl value", async () => {
                const ttlA = TimeSpan.fromMilliseconds(100);
                await cacheAdapterA.add("a", 1, ttlA);
                const ttlB = TimeSpan.fromMilliseconds(50);
                await cacheAdapterA.put("a", -1, ttlB);
                await delay(ttlB);
                expect(await cacheAdapterA.get("a")).toBeNull();
            });
        });
        describe("method: remove", () => {
            test("Should return only true when key exists", async () => {
                await cacheAdapterA.add("a", 1, null);
                expect(await cacheAdapterA.remove("a")).toBe(true);
            });
            test("Should persist removal when key exist", async () => {
                await cacheAdapterA.add("a", 1, null);
                await cacheAdapterA.remove("a");
                expect(await cacheAdapterA.get("a")).toBeNull();
            });
            test("Should persist removal when key is expired", async () => {
                await cacheAdapterA.add("a", 1, TTL);
                await delay(TTL);
                await cacheAdapterA.remove("a");
                expect(await cacheAdapterA.get("a")).toBeNull();
            });
            test("Should return false when key doesnt exists", async () => {
                expect(await cacheAdapterA.remove("a")).toBe(false);
            });
            test("Should return false when key is expired", async () => {
                await cacheAdapterA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheAdapterA.remove("a")).toBe(false);
            });
        });
        describe("method: increment", () => {
            test("Should return true when key exists", async () => {
                await cacheAdapterA.add("a", 1, null);
                expect(await cacheAdapterA.increment("a", 1)).toBe(true);
            });
            test("Should persist increment when key exists", async () => {
                await cacheAdapterA.add("a", 1, null);
                await cacheAdapterA.increment("a", 1);
                expect(await cacheAdapterA.get("a")).toBe(2);
            });
            test("Should return false when key doesnt exists", async () => {
                expect(await cacheAdapterA.increment("a", 1)).toBe(false);
            });
            test("Should return false when key is expired", async () => {
                await cacheAdapterA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheAdapterA.increment("a", 1)).toBe(false);
            });
            test("Should not persist increment when key doesnt exists", async () => {
                await cacheAdapterA.increment("a", 1);
                expect(await cacheAdapterA.get("a")).toBeNull();
            });
            test("Should not persist increment when key is expired", async () => {
                await cacheAdapterA.add("a", 1, TTL);
                await delay(TTL);
                await cacheAdapterA.increment("a", 1);
                expect(await cacheAdapterA.get("a")).toBeNull();
            });
            test("Should throw TypeCacheError key value is not number type", async () => {
                await cacheAdapterA.add("a", "str", null);
                await expect(
                    cacheAdapterA.increment("a", 1),
                ).rejects.toBeInstanceOf(TypeCacheError);
            });
        });
        describe("method: clear", () => {
            test(`Should remove all keys`, async () => {
                await cacheAdapterA.add("a", 1, null);
                await cacheAdapterA.add("b", 2, null);
                await cacheAdapterA.add("c", 3, null);
                await cacheAdapterA.clear();
                expect([
                    await cacheAdapterA.get("a"),
                    await cacheAdapterA.get("b"),
                    await cacheAdapterA.get("c"),
                ]).toEqual([null, null, null]);
            });
        });
    });
    describe("Group tests:", () => {
        test("method: get", async () => {
            await cacheAdapterA.put("a", 1, null);
            expect(await cacheAdapterA.get("a")).toBe(1);
            expect(await cacheAdapterB.get("a")).toBeNull();
        });
        test("method: add", async () => {
            await cacheAdapterA.add("a", 1, null);
            await cacheAdapterB.add("a", 2, null);
            expect(await cacheAdapterA.get("a")).toBe(1);
            expect(await cacheAdapterB.get("a")).toBe(2);
        });
        test("method: update", async () => {
            await cacheAdapterA.add("a", 1, null);
            await cacheAdapterB.add("a", 1, null);
            await cacheAdapterA.update("a", 2);
            await cacheAdapterB.update("a", 3);
            expect(await cacheAdapterA.get("a")).toBe(2);
            expect(await cacheAdapterB.get("a")).toBe(3);
        });
        test("method: put", async () => {
            await cacheAdapterA.put("a", 2, null);
            await cacheAdapterB.put("a", 3, null);
            expect(await cacheAdapterA.get("a")).toBe(2);
            expect(await cacheAdapterB.get("a")).toBe(3);
        });
        test("method: remove", async () => {
            await cacheAdapterA.add("a", 1, null);
            await cacheAdapterB.add("a", 1, null);
            await cacheAdapterA.remove("a");
            expect(await cacheAdapterA.get("a")).toBeNull();
            expect(await cacheAdapterB.get("a")).toBe(1);
        });
        test("method: increment", async () => {
            await cacheAdapterA.add("a", 1, null);
            await cacheAdapterB.add("a", 1, null);
            await cacheAdapterA.increment("a", 1);
            expect(await cacheAdapterA.get("a")).toBe(2);
            expect(await cacheAdapterB.get("a")).toBe(1);
        });
        test("method: clear", async () => {
            await cacheAdapterA.add("a", 1, null);
            await cacheAdapterA.add("b", 2, null);
            await cacheAdapterB.add("a", 1, null);
            await cacheAdapterB.add("b", 2, null);
            await cacheAdapterA.clear();

            expect([
                await cacheAdapterA.get("a"),
                await cacheAdapterA.get("b"),
                await cacheAdapterB.get("a"),
                await cacheAdapterB.get("b"),
            ]).toEqual([null, null, 1, 2]);
        });
    });
}
