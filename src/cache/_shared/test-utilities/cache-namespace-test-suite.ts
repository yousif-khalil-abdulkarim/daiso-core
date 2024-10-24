/**
 * @module Cache
 */
import { Cache } from "@/cache/cache";

import { type ICacheAdapter } from "@/contracts/cache/_module";
import { type ICache } from "@/contracts/cache/_module";
import {
    type TestAPI,
    type SuiteAPI,
    type beforeEach,
    type ExpectStatic,
} from "vitest";

/**
 * @group Utilities
 */
export type CacheNamespaceTestSuite = {
    describe: SuiteAPI;
    expect: ExpectStatic;
    beforeEach: typeof beforeEach;
    test: TestAPI;
    createAdapter: () => ICacheAdapter<unknown>;
};
/**
 * @group Utilities
 */
export function cacheNamespaceTestSuite(settings: CacheNamespaceTestSuite) {
    const { test, expect, describe, beforeEach, createAdapter } = settings;
    let cacheA: ICache;
    let cacheB: ICache;
    beforeEach(() => {
        cacheA = new Cache(createAdapter(), {
            namespace: "@namespace-a",
        });
        cacheB = new Cache(createAdapter(), {
            namespace: "@namespace-b",
        });
    });
    describe("Namespace tests", () => {
        test("method: has", async () => {
            await cacheA.add("a", 1);
            expect(await cacheA.has("a")).toBe(true);
            expect(await cacheB.has("a")).toBe(false);
        });
        test("method: hasMany", async () => {
            await cacheA.addMany({
                a: {
                    value: 1,
                },
                b: {
                    value: 2,
                },
            });
            expect(await cacheA.hasMany(["a", "b"])).toEqual({
                a: true,
                b: true,
            });
            expect(await cacheB.hasMany(["a", "b"])).toEqual({
                a: false,
                b: false,
            });
        });
        test("method: get", async () => {
            await cacheA.add("a", 1);
            expect(await cacheA.get("a")).toBe(1);
            expect(await cacheB.get("a")).toBeNull();
        });
        test("method: getMany", async () => {
            await cacheA.addMany({
                a: {
                    value: 1,
                },
                b: {
                    value: 2,
                },
            });
            expect(await cacheA.getMany(["a", "b"])).toEqual({
                a: 1,
                b: 2,
            });
            expect(await cacheB.getMany(["a", "b"])).toEqual({
                a: null,
                b: null,
            });
        });
        test("method: getOr", async () => {
            await cacheA.add("a", 1);
            expect(await cacheA.getOr("a", -1)).toBe(1);
            expect(await cacheB.getOr("a", -1)).toBe(-1);
        });
        test("method: getOrMany", async () => {
            await cacheA.addMany({
                a: {
                    value: 1,
                },
                b: {
                    value: 2,
                },
            });
            expect(
                await cacheA.getOrMany({
                    a: -1,
                    b: -1,
                }),
            ).toEqual({
                a: 1,
                b: 2,
            });
            expect(
                await cacheB.getOrMany({
                    a: -1,
                    b: -1,
                }),
            ).toEqual({
                a: -1,
                b: -1,
            });
        });
        test("method: add", async () => {
            await cacheA.add("a", 1);
            expect(await cacheA.get("a")).toBe(1);
            expect(await cacheB.get("a")).toBeNull();
        });
        test("method: addMany", async () => {
            await cacheA.addMany({
                a: {
                    value: 1,
                },
                b: {
                    value: 2,
                },
            });
            expect(await cacheA.getMany(["a", "b"])).toEqual({
                a: 1,
                b: 2,
            });
            expect(await cacheB.getMany(["a", "b"])).toEqual({
                a: null,
                b: null,
            });
        });
        test("method: put", async () => {
            await cacheA.put("a", 1);
            await cacheB.put("a", 2);
            expect(await cacheA.get("a")).toBe(1);
            expect(await cacheB.get("a")).toBe(2);
        });
        test("method: putMany", async () => {
            await cacheA.putMany({
                a: {
                    value: 1,
                },
                b: {
                    value: 2,
                },
            });
            await cacheB.putMany({
                a: {
                    value: 3,
                },
                b: {
                    value: 4,
                },
            });
            expect(await cacheA.getMany(["a", "b"])).toEqual({
                a: 1,
                b: 2,
            });
            expect(await cacheB.getMany(["a", "b"])).toEqual({
                a: 3,
                b: 4,
            });
        });
        test("method: remove", async () => {
            await cacheA.add("a", 1);
            await cacheB.add("a", 1);
            await cacheA.remove("a");
            expect(await cacheA.get("a")).toBeNull();
            expect(await cacheB.get("a")).toBe(1);
        });
        test("method: removeMany", async () => {
            await cacheA.addMany({
                a: {
                    value: 1,
                },
                b: {
                    value: 2,
                },
            });
            await cacheB.addMany({
                a: {
                    value: 1,
                },
                b: {
                    value: 2,
                },
            });
            await cacheA.removeMany(["a", "b"]);
            expect(await cacheA.getMany(["a", "b"])).toEqual({
                a: null,
                b: null,
            });
            expect(await cacheB.getMany(["a", "b"])).toEqual({
                a: 1,
                b: 2,
            });
        });
        test("method: getAndRemove", async () => {
            await cacheA.add("a", 1);
            await cacheB.add("a", 2);
            expect(await cacheA.getAndRemove("a")).toBe(1);
            expect(await cacheA.get("a")).toBeNull();
            expect(await cacheB.get("a")).toBe(2);
        });
        test("method: getOrAdd", async () => {
            await cacheA.getOrAdd("a", 1);
            expect(await cacheA.get("a")).toBe(1);
            expect(await cacheB.get("a")).toBeNull();
        });
        test("method: increment", async () => {
            await cacheA.add("a", 0);
            await cacheA.increment("a", 1);
            expect(await cacheA.get("a")).toBe(1);
            expect(await cacheB.get("a")).toBeNull();
        });
        test("method: decrement", async () => {
            await cacheA.add("a", 0);
            await cacheA.decrement("a", 1);
            expect(await cacheA.get("a")).toBe(-1);
            expect(await cacheB.get("a")).toBeNull();
        });
        test("method: clear", async () => {
            await cacheA.addMany({
                a: {
                    value: 1,
                },
                b: {
                    value: 2,
                },
            });
            await cacheB.addMany({
                a: {
                    value: 1,
                },
                b: {
                    value: 2,
                },
            });
            await cacheA.clear();
            expect(await cacheA.getMany(["a", "b"])).toEqual({
                a: null,
                b: null,
            });
            expect(await cacheB.getMany(["a", "b"])).toEqual({
                a: 1,
                b: 2,
            });
        });
    });
}
