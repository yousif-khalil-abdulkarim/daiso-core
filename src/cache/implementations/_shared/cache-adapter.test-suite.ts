/**
 * @module Cache
 */

import {
    type TestAPI,
    type SuiteAPI,
    type ExpectStatic,
    type beforeEach,
} from "vitest";
import { TypeCacheError, type ICacheAdapter } from "@/cache/contracts/_module";
import { type Promisable } from "@/utilities/_module";
import { TimeSpan } from "@/utilities/_module";
import { delay } from "@/async/_module";

/**
 * @group Utilities
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
 * @group Utilities
 * @example
 * ```ts
 * import Redis from "ioredis";
 * import { afterEach, beforeEach, describe, expect, test } from "vitest";
 * import { RedisContainer, type StartedRedisContainer } from "@testcontainers/redis";
 * import { SuperJsonSerializer, TimeSpan, RedisCacheAdapter, cacheAdapterTestSuite } from "@daiso-tech/core";
 *
 * const timeout = TimeSpan.fromMinutes(2);
 * describe("class: RedisCacheAdapter", () => {
 *   let client: Redis;
 *   let startedContainer: StartedRedisContainer;
 *   const serializer = new SuperJsonSerializer();
 *   beforeEach(async () => {
 *     startedContainer = await new RedisContainer("redis:7.4.2").start();
 *     client = new Redis(startedContainer.getConnectionUrl());
 *   }, timeout.toMilliseconds());
 *   afterEach(async () => {
 *     await client.quit();
 *     await startedContainer.stop();
 *   }, timeout.toMilliseconds());
 *   cacheAdapterTestSuite({
 *     createAdapter: () =>
 *       new RedisCacheAdapter(client, {
 *         serializer,
 *       }),
 *     test,
 *     beforeEach,
 *     expect,
 *     describe,
 *   });
 * });
 * ```
 */
export function cacheAdapterTestSuite(
    settings: CacheAdapterTestSuiteSettings,
): void {
    const { expect, test, createAdapter, describe, beforeEach } = settings;
    let cacheAdapter: ICacheAdapter<any>;
    beforeEach(async () => {
        cacheAdapter = await createAdapter();
    });

    const TTL = TimeSpan.fromMilliseconds(50);
    describe("method: get", () => {
        test("Should return the value when key exists", async () => {
            await cacheAdapter.add("a", 1, null);
            expect(await cacheAdapter.get("a")).toBe(1);
        });
        test("Should return null when keys doesnt exists", async () => {
            expect(await cacheAdapter.get("a")).toBeNull();
        });
        test("Should return null when key is experied", async () => {
            await cacheAdapter.add("a", 1, TTL);
            await delay(TTL);
            expect(await cacheAdapter.get("a")).toBeNull();
        });
    });
    describe("method: add", () => {
        test("Should return true when key doesnt exists", async () => {
            expect(await cacheAdapter.add("a", 1, null)).toBe(true);
        });
        test("Should return true when key is expired", async () => {
            await cacheAdapter.add("a", 1, TTL);
            await delay(TTL);
            expect(await cacheAdapter.add("a", 1, null)).toBe(true);
        });
        test("Should persist values when key doesnt exist", async () => {
            await cacheAdapter.add("a", 1, null);
            expect(await cacheAdapter.get("a")).toBe(1);
        });
        test("Should persist values when key is expired", async () => {
            await cacheAdapter.add("a", -1, TTL);
            await delay(TTL);
            await cacheAdapter.add("a", 1, null);
            expect(await cacheAdapter.get("a")).toBe(1);
        });
        test("Should return false when key exists", async () => {
            await cacheAdapter.add("a", 1, null);
            expect(await cacheAdapter.add("a", 1, null)).toBe(false);
        });
        test("Should not persist value when key exist", async () => {
            await cacheAdapter.add("a", 1, null);
            await cacheAdapter.add("a", 2, null);
            expect(await cacheAdapter.get("a")).toBe(1);
        });
    });
    describe("method: update", () => {
        test("Should return true when key exists", async () => {
            await cacheAdapter.add("a", 1, null);
            expect(await cacheAdapter.update("a", -1)).toBe(true);
        });
        test("Should persist value when key exist", async () => {
            await cacheAdapter.add("a", 1, null);
            await cacheAdapter.update("a", -1);
            expect(await cacheAdapter.get("a")).toBe(-1);
        });
        test("Should return false when key doesnt exists", async () => {
            expect(await cacheAdapter.update("a", -1)).toBe(false);
        });
        test("Should return false when key is expired", async () => {
            await cacheAdapter.add("a", 1, TTL);
            await delay(TTL);
            expect(await cacheAdapter.update("a", -1)).toBe(false);
        });
        test("Should not persist value when key doesnt exist", async () => {
            await cacheAdapter.update("a", -1);
            expect(await cacheAdapter.get("a")).toBeNull();
        });
        test("Should not persist value when key is expired", async () => {
            await cacheAdapter.add("a", 1, TTL);
            await delay(TTL);
            await cacheAdapter.update("a", -1);
            expect(await cacheAdapter.get("a")).toBeNull();
        });
    });
    describe("method: put", () => {
        test("Should return only true when key exists", async () => {
            await cacheAdapter.add("a", 1, null);
            expect(await cacheAdapter.put("a", -1, null)).toBe(true);
        });
        test("Should persist value when key exist", async () => {
            await cacheAdapter.add("a", 1, null);
            await cacheAdapter.put("a", -1, null);
            expect(await cacheAdapter.get("a")).toBe(-1);
        });
        test("Should return false when key doesnt exists", async () => {
            expect(await cacheAdapter.put("a", -1, null)).toBe(false);
        });
        test("Should return false when key is expired", async () => {
            await cacheAdapter.add("a", 1, TTL);
            await delay(TTL);
            expect(await cacheAdapter.put("a", -1, null)).toBe(false);
        });
        test("Should persist values when key doesnt exist", async () => {
            await cacheAdapter.put("a", -1, null);
            expect(await cacheAdapter.get("a")).toBe(-1);
        });
        test("Should persist values when key is expired", async () => {
            await cacheAdapter.add("a", 1, TTL);
            await delay(TTL);
            await cacheAdapter.put("a", -1, null);
            expect(await cacheAdapter.get("a")).toBe(-1);
        });
    });
    describe("method: remove", () => {
        test("Should return only true when key exists", async () => {
            await cacheAdapter.add("a", 1, null);
            expect(await cacheAdapter.remove("a")).toBe(true);
        });
        test("Should persist removal when key exist", async () => {
            await cacheAdapter.add("a", 1, null);
            await cacheAdapter.remove("a");
            expect(await cacheAdapter.get("a")).toBeNull();
        });
        test("Should persist removal when key is expired", async () => {
            await cacheAdapter.add("a", 1, TTL);
            await delay(TTL);
            await cacheAdapter.remove("a");
            expect(await cacheAdapter.get("a")).toBeNull();
        });
        test("Should return false when key doesnt exists", async () => {
            expect(await cacheAdapter.remove("a")).toBe(false);
        });
        test("Should return false when key is expired", async () => {
            await cacheAdapter.add("a", 1, TTL);
            await delay(TTL);
            expect(await cacheAdapter.remove("a")).toBe(false);
        });
    });
    describe("method: increment", () => {
        test("Should return true when key exists", async () => {
            await cacheAdapter.add("a", 1, null);
            expect(await cacheAdapter.increment("a", 1)).toBe(true);
        });
        test("Should persist increment when key exists", async () => {
            await cacheAdapter.add("a", 1, null);
            await cacheAdapter.increment("a", 1);
            expect(await cacheAdapter.get("a")).toBe(2);
        });
        test("Should return false when key doesnt exists", async () => {
            expect(await cacheAdapter.increment("a", 1)).toBe(false);
        });
        test("Should return false when key is expired", async () => {
            await cacheAdapter.add("a", 1, TTL);
            await delay(TTL);
            expect(await cacheAdapter.increment("a", 1)).toBe(false);
        });
        test("Should not persist increment when key doesnt exists", async () => {
            await cacheAdapter.increment("a", 1);
            expect(await cacheAdapter.get("a")).toBeNull();
        });
        test("Should not persist increment when key is expired", async () => {
            await cacheAdapter.add("a", 1, TTL);
            await delay(TTL);
            await cacheAdapter.increment("a", 1);
            expect(await cacheAdapter.get("a")).toBeNull();
        });
        test("Should throw TypeCacheError key value is not number type", async () => {
            await cacheAdapter.add("a", "str", null);
            await expect(cacheAdapter.increment("a", 1)).rejects.toBeInstanceOf(
                TypeCacheError,
            );
        });
    });
    describe("method: clear", () => {
        test(`Should remove all keys that starts with "@a"`, async () => {
            await cacheAdapter.add("@a/a", 1, null);
            await cacheAdapter.add("@a/b", 2, null);
            await cacheAdapter.add("@a/c", 3, null);
            await cacheAdapter.add("@b/d", 4, null);
            await cacheAdapter.add("@b/e", 5, null);
            await cacheAdapter.add("@b/f", 6, null);
            await cacheAdapter.clear("@a");
            expect([
                await cacheAdapter.get("@a/a"),
                await cacheAdapter.get("@a/b"),
                await cacheAdapter.get("@a/c"),
                await cacheAdapter.get("@b/d"),
                await cacheAdapter.get("@b/e"),
                await cacheAdapter.get("@b/f"),
            ]).toEqual([null, null, null, 4, 5, 6]);
        });
    });
}
