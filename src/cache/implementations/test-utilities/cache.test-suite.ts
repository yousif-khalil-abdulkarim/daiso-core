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
    KeyNotFoundCacheEvent,
    KeyFoundCacheEvent,
    TypeCacheError,
    type IGroupableCache,
    type ICache,
    KeyAddedCacheEvent,
    KeyUpdatedCacheEvent,
    KeyRemovedCacheEvent,
    KeysClearedCacheEvent,
    KeyIncrementedCacheEvent,
    KeyDecrementedCacheEvent,
} from "@/cache/contracts/_module-exports";
import { type Promisable } from "@/utilities/_module-exports";
import { TimeSpan } from "@/utilities/_module-exports";
import { delay, LazyPromise } from "@/async/_module-exports";

/**
 * @group Utilities
 */
export type CacheTestSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createCache: () => Promisable<IGroupableCache>;
};

/**
 * The <i>cacheTestSuite</i> function simplifies the process of testing your custom implementation of <i>{@link ICache}</i> with <i>vitest</i>.
 * @group Utilities
 * @example
 * ```ts
 * import Redis from "ioredis";
 * import { afterEach, beforeEach, describe, expect, test } from "vitest";
 * import { RedisContainer, type StartedRedisContainer } from "@testcontainers/redis";
 * import { SuperJsonSerde, TimeSpan, RedisCacheAdapter, cacheTestSuite, MemorycacheAdapter } from "@daiso-tech/core";
 *
 * const TIMEOUT = TimeSpan.fromMinutes(2);
 * describe("class: Cache", () => {
 *   let database: Redis;
 *   let startedContainer: StartedRedisContainer;
 *   const eventBus = new EventBus({
 *     adapter: new MemorycacheAdapter({
 *       rootGroup: "@global"
 *     })
 *   }):
 *   const serde = new SuperJsonSerde();
 *   beforeEach(async () => {
 *     startedContainer = await new RedisContainer("redis:7.4.2").start();
 *     database = new Redis(startedContainer.getConnectionUrl());
 *   }, TIMEOUT.toMilliseconds());
 *   afterEach(async () => {
 *     await database.quit();
 *     await startedContainer.stop();
 *   }, TIMEOUT.toMilliseconds());
 *   cacheTestSuite({
 *     createCache: () =>
 *       new Cache(
 *         new RedisCacheAdapter({
 *           database,
 *           serde,
 *           rootGroup: "@a",
 *         }),
 *         { eventBus }
 *       ),
 *     test,
 *     beforeEach,
 *     expect,
 *     describe,
 *   });
 * });
 * ```
 */
export function cacheTestSuite(settings: CacheTestSuiteSettings): void {
    const { expect, test, createCache, describe, beforeEach } = settings;
    let cacheA: ICache<any>;
    let cacheB: ICache<any>;
    beforeEach(async () => {
        const cache = await createCache();
        cacheA = cache;
        cacheB = cache.withGroup("b");
    });
    describe("Api tests:", () => {
        const TTL = TimeSpan.fromMilliseconds(50);
        describe("method: exists", () => {
            test("Should return true when key exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.exists("a")).toBe(true);
            });
            test("Should return false when key doesnt exists", async () => {
                expect(await cacheA.exists("a")).toBe(false);
            });
            test("Should return false when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheA.exists("a")).toBe(false);
            });
        });
        describe("method: existsMany", () => {
            test("Should return only true when all keys exists", async () => {
                await cacheA.addMany({
                    a: { value: 1 },
                    b: { value: 1 },
                });
                expect(await cacheA.existsMany(["a", "b"])).toEqual({
                    a: true,
                    b: true,
                });
            });
            test("Should return only false when all keys doesnt exists", async () => {
                expect(await cacheA.existsMany(["a", "b"])).toEqual({
                    a: false,
                    b: false,
                });
            });
            test("Should return true and false when some keys exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.existsMany(["a", "b"])).toEqual({
                    a: true,
                    b: false,
                });
            });
            test("Should return false when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheA.existsMany(["a"])).toEqual({
                    a: false,
                });
            });
        });
        describe("method: missing", () => {
            test("Should return false when key exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.missing("a")).toBe(false);
            });
            test("Should return true when key doesnt exists", async () => {
                expect(await cacheA.missing("a")).toBe(true);
            });
            test("Should return true when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheA.missing("a")).toBe(true);
            });
        });
        describe("method: missingMany", () => {
            test("Should return only false when all keys exists", async () => {
                await cacheA.addMany({
                    a: { value: 1 },
                    b: { value: 1 },
                });
                expect(await cacheA.missingMany(["a", "b"])).toEqual({
                    a: false,
                    b: false,
                });
            });
            test("Should return only true when all keys doesnt exists", async () => {
                expect(await cacheA.missingMany(["a", "b"])).toEqual({
                    a: true,
                    b: true,
                });
            });
            test("Should return true and false when some keys exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.missingMany(["a", "b"])).toEqual({
                    a: false,
                    b: true,
                });
            });
            test("Should return true when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheA.missingMany(["a"])).toEqual({
                    a: true,
                });
            });
        });
        describe("method: get", () => {
            test("Should return value when key exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.get("a")).toBe(1);
            });
            test("Should return null when key doesnt exists", async () => {
                expect(await cacheA.get("a")).toBeNull();
            });
            test("Should return null when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheA.get("a")).toBeNull();
            });
        });
        describe("method: getMany", () => {
            test("Should return only values when all keys exists", async () => {
                await cacheA.addMany({
                    a: { value: 1 },
                    b: { value: 1 },
                });
                expect(await cacheA.getMany(["a", "b"])).toEqual({
                    a: 1,
                    b: 1,
                });
            });
            test("Should return only null when all keys doesnt exists", async () => {
                expect(await cacheA.getMany(["a", "b"])).toEqual({
                    a: null,
                    b: null,
                });
            });
            test("Should return values and null when some keys exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.getMany(["a", "b"])).toEqual({
                    a: 1,
                    b: null,
                });
            });
            test("Should return null when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheA.getMany(["a"])).toEqual({ a: null });
            });
        });
        describe("method: getOr", () => {
            test("Should return value when key exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.getOr("a", -1)).toBe(1);
            });
            describe("Should return default value when key doesnt exists", () => {
                test("Value", async () => {
                    expect(await cacheA.getOr("a", -1)).toBe(-1);
                });
                test("Function", async () => {
                    expect(await cacheA.getOr("a", () => -1)).toBe(-1);
                });
                test("Async function", async () => {
                    expect(
                        await cacheA.getOr("a", () => Promise.resolve(-1)),
                    ).toBe(-1);
                });
                test("LazyPromise", async () => {
                    expect(
                        await cacheA.getOr(
                            "a",
                            new LazyPromise(() => Promise.resolve(-1)),
                        ),
                    ).toBe(-1);
                });
            });
            describe("Should return default value when key is expired", () => {
                test("Value", async () => {
                    await cacheA.add("a", 1, TTL);
                    await delay(TTL);
                    expect(await cacheA.getOr("a", -1)).toBe(-1);
                });
                test("Function", async () => {
                    await cacheA.add("a", 1, TTL);
                    await delay(TTL);
                    expect(await cacheA.getOr("a", () => -1)).toBe(-1);
                });
                test("Async function", async () => {
                    await cacheA.add("a", 1, TTL);
                    await delay(TTL);
                    expect(
                        await cacheA.getOr("a", () => Promise.resolve(-1)),
                    ).toBe(-1);
                });
                test("LazyPromise", async () => {
                    await cacheA.add("a", 1, TTL);
                    await delay(TTL);
                    expect(
                        await cacheA.getOr(
                            "a",
                            new LazyPromise(() => Promise.resolve(-1)),
                        ),
                    ).toBe(-1);
                });
            });
        });
        describe("method: getOrFail", () => {
            test("Should return value when key exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.getOrFail("a")).toBe(1);
            });
            test("Should throw KeyNotFoundCacheError value when key doesnt exists", async () => {
                await expect(cacheA.getOrFail("a")).rejects.toBeInstanceOf(
                    KeyNotFoundCacheError,
                );
            });
            test("Should throw KeyNotFoundCacheError value when key is expired exists", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                await expect(cacheA.getOrFail("a")).rejects.toBeInstanceOf(
                    KeyNotFoundCacheError,
                );
            });
        });
        describe("method: getOrMany", () => {
            test("Should return only values when all keys exists", async () => {
                await cacheA.addMany({
                    a: { value: 1 },
                    b: { value: 1 },
                });
                expect(await cacheA.getOrMany({ a: -1, b: -1 })).toEqual({
                    a: 1,
                    b: 1,
                });
            });
            describe("Should return only default values when all keys doesnt exists", () => {
                test("Value", async () => {
                    expect(await cacheA.getOrMany({ a: -1, b: -1 })).toEqual({
                        a: -1,
                        b: -1,
                    });
                });
                test("Function", async () => {
                    expect(
                        await cacheA.getOrMany({ a: () => -1, b: () => -1 }),
                    ).toEqual({
                        a: -1,
                        b: -1,
                    });
                });
                test("Async function", async () => {
                    expect(
                        await cacheA.getOrMany({
                            a: () => Promise.resolve(-1),
                            b: () => Promise.resolve(-1),
                        }),
                    ).toEqual({
                        a: -1,
                        b: -1,
                    });
                });
                test("LazyPromise", async () => {
                    expect(
                        await cacheA.getOrMany({
                            a: new LazyPromise(() => Promise.resolve(-1)),
                            b: new LazyPromise(() => Promise.resolve(-1)),
                        }),
                    ).toEqual({
                        a: -1,
                        b: -1,
                    });
                });
            });
            describe("Should return default value when key is expired", () => {
                test("Value", async () => {
                    await cacheA.add("a", 1, TTL);
                    await delay(TTL);
                    expect(
                        await cacheA.getOrMany({
                            a: -1,
                        }),
                    ).toEqual({
                        a: -1,
                    });
                });
                test("Function", async () => {
                    await cacheA.add("a", 1, TTL);
                    await delay(TTL);
                    expect(
                        await cacheA.getOrMany({
                            a: () => -1,
                        }),
                    ).toEqual({
                        a: -1,
                    });
                });
                test("Async function", async () => {
                    await cacheA.add("a", 1, TTL);
                    await delay(TTL);
                    expect(
                        await cacheA.getOrMany({
                            a: () => Promise.resolve(-1),
                        }),
                    ).toEqual({
                        a: -1,
                    });
                });
                test("LazyPromise", async () => {
                    await cacheA.add("a", 1, TTL);
                    await delay(TTL);
                    expect(
                        await cacheA.getOrMany({
                            a: new LazyPromise(() => Promise.resolve(-1)),
                        }),
                    ).toEqual({
                        a: -1,
                    });
                });
            });
            test("Should return values and default values when some keys exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.getOrMany({ a: -1, b: -1 })).toEqual({
                    a: 1,
                    b: -1,
                });
            });
        });
        describe("method: add", () => {
            test("Should return true when key doesnt exist", async () => {
                expect(await cacheA.add("a", 1)).toBe(true);
            });
            test("Should return true when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheA.add("a", 1)).toBe(true);
            });
            test("Should persist value when key doesnt exist", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.get("a")).toBe(1);
            });
            test("Should persist value when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                await cacheA.add("a", 1);
                expect(await cacheA.get("a")).toBe(1);
            });
            test("Should return false when key exist", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.add("a", 1)).toBe(false);
            });
            test("Should not persist value when key exist", async () => {
                await cacheA.add("a", 1);
                await cacheA.add("a", 2);
                expect(await cacheA.get("a")).toBe(1);
            });
        });
        describe("method: addMany", () => {
            test("Should return only true when all keys doesnt exists", async () => {
                expect(
                    await cacheA.addMany({
                        a: { value: 1 },
                        b: { value: 1 },
                    }),
                ).toEqual({
                    a: true,
                    b: true,
                });
            });
            test("Should return true when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheA.addMany({ a: { value: 1 } })).toEqual({
                    a: true,
                });
            });
            test("Should persist values when all keys doesnt exist", async () => {
                await cacheA.addMany({
                    a: { value: 1 },
                    b: { value: 1 },
                });
                expect(await cacheA.getMany(["a", "b"])).toEqual({
                    a: 1,
                    b: 1,
                });
            });
            test("Should persist value when key is expired", async () => {
                await cacheA.add("a", -1, TTL);
                await delay(TTL);
                await cacheA.addMany({ a: { value: 1 } });
                expect(await cacheA.get("a")).toBe(1);
            });
            test("Should return only false when all keys exists", async () => {
                await cacheA.addMany({
                    a: { value: 1 },
                    b: { value: 1 },
                });
                expect(
                    await cacheA.addMany({
                        a: { value: 1 },
                        b: { value: 1 },
                    }),
                ).toEqual({
                    a: false,
                    b: false,
                });
            });
            test("Should not persist values when key exist", async () => {
                await cacheA.addMany({
                    a: { value: 1 },
                    b: { value: 1 },
                });
                await cacheA.addMany({
                    a: { value: 1 },
                    b: { value: 1 },
                });
                expect(await cacheA.getMany(["a", "b"])).toEqual({
                    a: 1,
                    b: 1,
                });
            });
            test("Should return true and false when some keys exists", async () => {
                await cacheA.add("a", 1);
                expect(
                    await cacheA.addMany({
                        a: { value: 1 },
                        b: { value: 1 },
                    }),
                ).toEqual({
                    a: false,
                    b: true,
                });
            });
            test("Should persist and not persist values when some keys exists", async () => {
                await cacheA.addMany({
                    a: { value: 1 },
                });
                await cacheA.addMany({
                    a: { value: 1 },
                    b: { value: 2 },
                });
                expect(await cacheA.getMany(["a", "b"])).toEqual({
                    a: 1,
                    b: 2,
                });
            });
        });
        describe("method: update", () => {
            test("Should return true when key exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.update("a", -1)).toBe(true);
            });
            test("Should persist update when key exists", async () => {
                await cacheA.add("a", 1);
                await cacheA.update("a", -1);
                expect(await cacheA.get("a")).toBe(-1);
            });
            test("Should return false when key doesnt exists", async () => {
                expect(await cacheA.update("a", -1)).toBe(false);
            });
            test("Should return false when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheA.update("a", -1)).toBe(false);
            });
            test("Should not persist update when key doesnt exists", async () => {
                await cacheA.update("a", -1);
                expect(await cacheA.get("a")).toBeNull();
            });
            test("Should not persist update when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                await cacheA.update("a", -1);
                expect(await cacheA.get("a")).toBeNull();
            });
        });
        describe("method: updateMany", () => {
            test("Should return only true when all keys exists", async () => {
                await cacheA.addMany({
                    a: { value: 1 },
                    b: { value: 1 },
                });
                expect(await cacheA.updateMany({ a: -1, b: -1 })).toEqual({
                    a: true,
                    b: true,
                });
            });
            test("Should persist values when all keys exist", async () => {
                await cacheA.addMany({
                    a: { value: 1 },
                    b: { value: 1 },
                });
                await cacheA.updateMany({ a: -1, b: -1 });
                expect(await cacheA.getMany(["a", "b"])).toEqual({
                    a: -1,
                    b: -1,
                });
            });
            test("Should return only false when all keys doesnt exists", async () => {
                expect(await cacheA.updateMany({ a: -1, b: -1 })).toEqual({
                    a: false,
                    b: false,
                });
            });
            test("Should return false when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheA.updateMany({ a: -1 })).toEqual({
                    a: false,
                });
            });
            test("Should not persist values when all keys doesnt exist", async () => {
                await cacheA.updateMany({ a: -1, b: -1 });
                expect(await cacheA.getMany(["a", "b"])).toEqual({
                    a: null,
                    b: null,
                });
            });
            test("Should not persist update when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                await cacheA.updateMany({ a: -1 });
                expect(await cacheA.get("a")).toBeNull();
            });
            test("Should return true and false when some keys exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.updateMany({ a: -1, b: -1 })).toEqual({
                    a: true,
                    b: false,
                });
            });
            test("Should persist and not persist values when some keys exists", async () => {
                await cacheA.add("a", 1);
                await cacheA.updateMany({ a: -1, b: -1 });
                expect(await cacheA.getMany(["a", "b"])).toEqual({
                    a: -1,
                    b: null,
                });
            });
        });
        describe("method: put", () => {
            test("Should return true when key exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.put("a", -1)).toBe(true);
            });
            test("Should persist update when key exists", async () => {
                await cacheA.add("a", 1);
                await cacheA.put("a", -1);
                expect(await cacheA.get("a")).toBe(-1);
            });
            test("Should return false when key doesnt exists", async () => {
                expect(await cacheA.put("a", -1)).toBe(false);
            });
            test("Should return false when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheA.put("a", -1)).toBe(false);
            });
            test("Should persist insertion when key doesnt exists", async () => {
                await cacheA.put("a", -1);
                expect(await cacheA.get("a")).toBe(-1);
            });
            test("Should persist insertion when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                await cacheA.put("a", -1);
                expect(await cacheA.get("a")).toBe(-1);
            });
            test("Should replace the ttl value", async () => {
                const ttlA = TimeSpan.fromMilliseconds(100);
                await cacheA.add("a", 1, ttlA);
                const ttlB = TimeSpan.fromMilliseconds(50);
                await cacheA.put("a", -1, ttlB);
                await delay(ttlB);
                expect(await cacheA.get("a")).toBeNull();
            });
        });
        describe("method: putMany", () => {
            test("Should return only true when all keys exists", async () => {
                await cacheA.addMany({
                    a: { value: 1 },
                    b: { value: 1 },
                });
                expect(
                    await cacheA.putMany({
                        a: { value: -1 },
                        b: { value: -1 },
                    }),
                ).toEqual({
                    a: true,
                    b: true,
                });
            });
            test("Should persist values when all keys exist", async () => {
                await cacheA.addMany({
                    a: { value: 1 },
                    b: { value: 1 },
                });
                await cacheA.putMany({ a: { value: -1 }, b: { value: -1 } });
                expect(await cacheA.getMany(["a", "b"])).toEqual({
                    a: -1,
                    b: -1,
                });
            });
            test("Should return only false when all keys doesnt exists", async () => {
                expect(
                    await cacheA.putMany({
                        a: { value: -1 },
                        b: { value: -1 },
                    }),
                ).toEqual({
                    a: false,
                    b: false,
                });
            });
            test("Should return false when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheA.putMany({ a: { value: -1 } })).toEqual({
                    a: false,
                });
            });
            test("Should persist values when all keys doesnt exist", async () => {
                await cacheA.putMany({ a: { value: -1 }, b: { value: -1 } });
                expect(await cacheA.getMany(["a", "b"])).toEqual({
                    a: -1,
                    b: -1,
                });
            });
            test("Should persist insertion when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                await cacheA.putMany({ a: { value: -1 } });
                expect(await cacheA.get("a")).toBe(-1);
            });
            test("Should return true and false when some keys exists", async () => {
                await cacheA.add("a", 1);
                expect(
                    await cacheA.putMany({
                        a: { value: -1 },
                        b: { value: -1 },
                    }),
                ).toEqual({
                    a: true,
                    b: false,
                });
            });
            test("Should persist all values when some keys exists", async () => {
                await cacheA.add("a", 1);
                await cacheA.putMany({ a: { value: -1 }, b: { value: -1 } });
                expect(await cacheA.getMany(["a", "b"])).toEqual({
                    a: -1,
                    b: -1,
                });
            });
            test("Should replace the ttl value", async () => {
                const ttlA = TimeSpan.fromMilliseconds(100);
                await cacheA.add("a", 1, ttlA);
                const ttlB = TimeSpan.fromMilliseconds(50);
                await cacheA.putMany({
                    a: {
                        value: -1,
                        ttl: ttlB,
                    },
                });
                await delay(ttlB);
                expect(await cacheA.get("a")).toBeNull();
            });
        });
        describe("method: remove", () => {
            test("Should return true when key exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.remove("a")).toBe(true);
            });
            test("Should persist removal when key exists", async () => {
                await cacheA.add("a", 1);
                await cacheA.remove("a");
                expect(await cacheA.get("a")).toBeNull();
            });
            test("Should return false when key doesnt exists", async () => {
                expect(await cacheA.remove("a")).toBe(false);
            });
            test("Should return false when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheA.remove("a")).toBe(false);
            });
        });
        describe("method: removeMany", () => {
            test("Should return only true when all keys exists", async () => {
                await cacheA.addMany({
                    a: { value: 1 },
                    b: { value: 1 },
                });
                expect(await cacheA.removeMany(["a", "b"])).toEqual({
                    a: true,
                    b: true,
                });
            });
            test("Should persist values when all keys exist", async () => {
                await cacheA.addMany({
                    a: { value: 1 },
                    b: { value: 1 },
                });
                await cacheA.removeMany(["a", "b"]);
                expect(await cacheA.getMany(["a", "b"])).toEqual({
                    a: null,
                    b: null,
                });
            });
            test("Should return only false when all keys doesnt exists", async () => {
                expect(await cacheA.removeMany(["a", "b"])).toEqual({
                    a: false,
                    b: false,
                });
            });
            test("Should return false when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheA.removeMany(["a"])).toEqual({ a: false });
            });
            test("Should return true and false when some keys exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.removeMany(["a", "b"])).toEqual({
                    a: true,
                    b: false,
                });
            });
        });
        describe("method: getAndRemove", () => {
            test("Should return value when key exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.getAndRemove("a")).toBe(1);
            });
            test("Should return null when key doesnt exists", async () => {
                expect(await cacheA.getAndRemove("a")).toBeNull();
            });
            test("Should return null when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheA.getAndRemove("a")).toBeNull();
            });
            test("Should persist removal when key exists", async () => {
                await cacheA.add("a", 1);
                await cacheA.getAndRemove("a");
                expect(await cacheA.get("a")).toBeNull();
            });
        });
        describe("method: getOrAdd", () => {
            test("Should return value when key exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.getOrAdd("a", -1)).toBe(1);
            });
            describe("Should persist insertion when key doesnt exists", () => {
                test("Value", async () => {
                    await cacheA.getOrAdd("a", -1);
                    expect(await cacheA.get("a")).toBe(-1);
                });
                test("Function", async () => {
                    await cacheA.getOrAdd("a", () => -1);
                    expect(await cacheA.get("a")).toBe(-1);
                });
                test("Async function", async () => {
                    await cacheA.getOrAdd("a", () => Promise.resolve(-1));
                    expect(await cacheA.get("a")).toBe(-1);
                });
                test("LazyPromise", async () => {
                    await cacheA.getOrAdd(
                        "a",
                        new LazyPromise(() => Promise.resolve(-1)),
                    );
                    expect(await cacheA.get("a")).toBe(-1);
                });
            });
            describe("Should persist insertion when key is expired", () => {
                test("Value", async () => {
                    await cacheA.add("a", 1, TTL);
                    await delay(TTL);
                    await cacheA.getOrAdd("a", -1);
                    expect(await cacheA.get("a")).toBe(-1);
                });
                test("Function", async () => {
                    await cacheA.add("a", 1, TTL);
                    await delay(TTL);
                    await cacheA.getOrAdd("a", () => -1);
                    expect(await cacheA.get("a")).toBe(-1);
                });
                test("Async function", async () => {
                    await cacheA.add("a", 1, TTL);
                    await delay(TTL);
                    await cacheA.getOrAdd("a", () => Promise.resolve(-1));
                    expect(await cacheA.get("a")).toBe(-1);
                });
                test("LazyPromise", async () => {
                    await cacheA.add("a", 1, TTL);
                    await delay(TTL);
                    await cacheA.getOrAdd(
                        "a",
                        new LazyPromise(() => Promise.resolve(-1)),
                    );
                    expect(await cacheA.get("a")).toBe(-1);
                });
            });
        });
        describe("method: increment", () => {
            test("Should return true when key exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.increment("a", 1)).toBe(true);
            });
            test("Should persist increment when key exists", async () => {
                await cacheA.add("a", 1);
                await cacheA.increment("a", 1);
                expect(await cacheA.get("a")).toBe(2);
            });
            test("Should return false when key doesnt exists", async () => {
                expect(await cacheA.increment("a", 1)).toBe(false);
            });
            test("Should return false when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheA.increment("a", 1)).toBe(false);
            });
            test("Should not persist increment when key doesnt exists", async () => {
                await cacheA.increment("a", 1);
                expect(await cacheA.get("a")).toBeNull();
            });
            test("Should not persist increment when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                await cacheA.increment("a", 1);
                expect(await cacheA.get("a")).toBeNull();
            });
            test("Should throw TypeCacheError key value is not number type", async () => {
                await cacheA.add("a", "str");
                await expect(cacheA.increment("a", 1)).rejects.toBeInstanceOf(
                    TypeCacheError,
                );
            });
        });
        describe("method: decrement", () => {
            test("Should return true when key exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.decrement("a", 1)).toBe(true);
            });
            test("Should persist decrement when key exists", async () => {
                await cacheA.add("a", 1);
                await cacheA.decrement("a", 1);
                expect(await cacheA.get("a")).toBe(0);
            });
            test("Should return false when key doesnt exists", async () => {
                expect(await cacheA.decrement("a", 1)).toBe(false);
            });
            test("Should return false when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheA.decrement("a", 1)).toBe(false);
            });
            test("Should not persist decrement when key doesnt exists", async () => {
                await cacheA.decrement("a", 1);
                expect(await cacheA.get("a")).toBeNull();
            });
            test("Should not persist decrement when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                await cacheA.decrement("a", 1);
                expect(await cacheA.get("a")).toBeNull();
            });
            test("Should throw TypeCacheError key value is not number type", async () => {
                await cacheA.add("a", "str");
                await expect(cacheA.decrement("a", 1)).rejects.toBeInstanceOf(
                    TypeCacheError,
                );
            });
        });
        describe("method: clear", () => {
            test("Should remove all keys", async () => {
                await cacheA.addMany({
                    a: { value: 1 },
                    b: { value: 2 },
                    c: { value: 3 },
                    d: { value: 4 },
                    e: { value: 5 },
                    f: { value: 6 },
                });
                await cacheA.clear();
                expect(
                    await cacheA.getMany(["a", "b", "c", "d", "e", "f"]),
                ).toEqual({
                    a: null,
                    b: null,
                    c: null,
                    d: null,
                    e: null,
                    f: null,
                });
            });
        });
    });
    describe("Event tests:", () => {
        const delayTime = TimeSpan.fromMilliseconds(50);
        describe("method: exists", () => {
            test("Should dispatch KeyNotFoundCacheEvent when key doesnt exists", async () => {
                let event_ = null as KeyNotFoundCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyNotFoundCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.exists("a");
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyNotFoundCacheEvent);
                expect(event_?.fields.key).toBe("a");
                await unsubscribe();
            });
            test("Should dispatch KeyFoundCacheEvent when key exists", async () => {
                let event_ = null as KeyFoundCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyFoundCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.add("a", 1);
                await cacheA.exists("a");
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyFoundCacheEvent);
                expect(event_?.fields.key).toBe("a");
                expect(event_?.fields.value).toBe(1);
                await unsubscribe();
            });
        });
        describe("method: existsMany", () => {
            test("Should dispatch KeyNotFoundCacheEvent when key doesnt exists", async () => {
                let event_ = null as KeyNotFoundCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyNotFoundCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.existsMany(["a"]);
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyNotFoundCacheEvent);
                expect(event_?.fields.key).toBe("a");
                await unsubscribe();
            });
            test("Should dispatch KeyFoundCacheEvent when key exists", async () => {
                let event_ = null as KeyFoundCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyFoundCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.add("a", 1);
                await cacheA.existsMany(["a"]);
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyFoundCacheEvent);
                expect(event_?.fields.key).toBe("a");
                expect(event_?.fields.value).toBe(1);
                await unsubscribe();
            });
        });
        describe("method: missing", () => {
            test("Should dispatch KeyNotFoundCacheEvent when key doesnt exists", async () => {
                let event_ = null as KeyNotFoundCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyNotFoundCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.missing("a");
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyNotFoundCacheEvent);
                expect(event_?.fields.key).toBe("a");
                await unsubscribe();
            });
            test("Should dispatch KeyFoundCacheEvent when key exists", async () => {
                let event_ = null as KeyFoundCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyFoundCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.add("a", 1);
                await cacheA.missing("a");
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyFoundCacheEvent);
                expect(event_?.fields.key).toBe("a");
                expect(event_?.fields.value).toBe(1);
                await unsubscribe();
            });
        });
        describe("method: missingMany", () => {
            test("Should dispatch KeyNotFoundCacheEvent when key doesnt exists", async () => {
                let event_ = null as KeyNotFoundCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyNotFoundCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.missingMany(["a"]);
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyNotFoundCacheEvent);
                expect(event_?.fields.key).toBe("a");
                await unsubscribe();
            });
            test("Should dispatch KeyFoundCacheEvent when key exists", async () => {
                let event_ = null as KeyFoundCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyFoundCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.add("a", 1);
                await cacheA.missingMany(["a"]);
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyFoundCacheEvent);
                expect(event_?.fields.key).toBe("a");
                expect(event_?.fields.value).toBe(1);
                await unsubscribe();
            });
        });
        describe("method: get", () => {
            test("Should dispatch KeyNotFoundCacheEvent when key doesnt exists", async () => {
                let event_ = null as KeyNotFoundCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyNotFoundCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.get("a");
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyNotFoundCacheEvent);
                expect(event_?.fields.key).toBe("a");
                await unsubscribe();
            });
            test("Should dispatch KeyFoundCacheEvent when key exists", async () => {
                let event_ = null as KeyFoundCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyFoundCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.add("a", 1);
                await cacheA.get("a");
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyFoundCacheEvent);
                expect(event_?.fields.key).toBe("a");
                expect(event_?.fields.value).toBe(1);
                await unsubscribe();
            });
        });
        describe("method: getMany", () => {
            test("Should dispatch KeyNotFoundCacheEvent when key doesnt exists", async () => {
                let event_ = null as KeyNotFoundCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyNotFoundCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.getMany(["a"]);
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyNotFoundCacheEvent);
                expect(event_?.fields.key).toBe("a");
                await unsubscribe();
            });
            test("Should dispatch KeyFoundCacheEvent when key exists", async () => {
                let event_ = null as KeyFoundCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyFoundCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.add("a", 1);
                await cacheA.getMany(["a"]);
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyFoundCacheEvent);
                expect(event_?.fields.key).toBe("a");
                expect(event_?.fields.value).toBe(1);
                await unsubscribe();
            });
        });
        describe("method: getOr", () => {
            test("Should dispatch KeyNotFoundCacheEvent when key doesnt exists", async () => {
                let event_ = null as KeyNotFoundCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyNotFoundCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.getOr("a", 1);
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyNotFoundCacheEvent);
                expect(event_?.fields.key).toBe("a");
                await unsubscribe();
            });
            test("Should dispatch KeyFoundCacheEvent when key exists", async () => {
                let event_ = null as KeyFoundCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyFoundCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.add("a", 1);
                await cacheA.getOr("a", 1);
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyFoundCacheEvent);
                expect(event_?.fields.key).toBe("a");
                expect(event_?.fields.value).toBe(1);
                await unsubscribe();
            });
        });
        describe("method: getOrMany", () => {
            test("Should dispatch KeyNotFoundCacheEvent when key doesnt exists", async () => {
                let event_ = null as KeyNotFoundCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyNotFoundCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.getOrMany({ a: 1 });
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyNotFoundCacheEvent);
                expect(event_?.fields.key).toBe("a");
                await unsubscribe();
            });
            test("Should dispatch KeyFoundCacheEvent when key exists", async () => {
                let event_ = null as KeyFoundCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyFoundCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.add("a", 1);
                await cacheA.getOrMany({ a: 1 });
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyFoundCacheEvent);
                expect(event_?.fields.key).toBe("a");
                expect(event_?.fields.value).toBe(1);
                await unsubscribe();
            });
        });
        describe("method: getOrFail", () => {
            test("Should dispatch KeyNotFoundCacheEvent when key doesnt exists", async () => {
                let event_ = null as KeyNotFoundCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyNotFoundCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                try {
                    await cacheA.getOrFail("a");
                } catch {
                    /* Empty */
                }
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyNotFoundCacheEvent);
                expect(event_?.fields.key).toBe("a");
                await unsubscribe();
            });
            test("Should dispatch KeyFoundCacheEvent when key exists", async () => {
                let event_ = null as KeyFoundCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyFoundCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.add("a", 1);
                await cacheA.getOrFail("a");
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyFoundCacheEvent);
                expect(event_?.fields.key).toBe("a");
                expect(event_?.fields.value).toBe(1);
                await unsubscribe();
            });
        });
        describe("method: add", () => {
            test("Should dispatch KeyAddedCacheEvent when key doesnt exists", async () => {
                let event_ = null as KeyAddedCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyAddedCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                const ttl = TimeSpan.fromMilliseconds(20);
                await cacheA.add("a", 1, ttl);
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyAddedCacheEvent);
                expect(event_?.fields.key).toBe("a");
                expect(event_?.fields.value).toBe(1);
                expect(event_?.fields.ttl?.toMilliseconds()).toBe(
                    ttl.toMilliseconds(),
                );
                await unsubscribe();
            });
        });
        describe("method: addMany", () => {
            test("Should dispatch KeyAddedCacheEvent when key doesnt exists", async () => {
                let event_ = null as KeyAddedCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyAddedCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                const ttl = TimeSpan.fromMilliseconds(20);
                await cacheA.addMany({ a: { value: 1, ttl } });
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyAddedCacheEvent);
                expect(event_?.fields.key).toBe("a");
                expect(event_?.fields.value).toBe(1);
                expect(event_?.fields.ttl?.toMilliseconds()).toBe(
                    ttl.toMilliseconds(),
                );
                await unsubscribe();
            });
        });
        describe("method: update", () => {
            test("Should dispatch KeyUpdatedCacheEvent when key exists", async () => {
                let event_ = null as KeyUpdatedCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyUpdatedCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.add("a", 1);
                await cacheA.update("a", 2);
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyUpdatedCacheEvent);
                expect(event_?.fields.key).toBe("a");
                expect(event_?.fields.value).toBe(2);
                await unsubscribe();
            });
            test("Should dispatch KeyNotFoundCacheEvent when key doesnt exists", async () => {
                let event_ = null as KeyNotFoundCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyNotFoundCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.update("a", 2);
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyNotFoundCacheEvent);
                expect(event_?.fields.key).toBe("a");
                await unsubscribe();
            });
        });
        describe("method: updateMany", () => {
            test("Should dispatch KeyUpdatedCacheEvent when key exists", async () => {
                let event_ = null as KeyUpdatedCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyUpdatedCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.add("a", 1);
                await cacheA.updateMany({ a: 2 });
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyUpdatedCacheEvent);
                expect(event_?.fields.key).toBe("a");
                expect(event_?.fields.value).toBe(2);
                await unsubscribe();
            });
            test("Should dispatch KeyNotFoundCacheEvent when key doesnt exists", async () => {
                let event_ = null as KeyNotFoundCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyNotFoundCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.updateMany({ a: 2 });
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyNotFoundCacheEvent);
                expect(event_?.fields.key).toBe("a");
                await unsubscribe();
            });
        });
        describe("method: put", () => {
            test("Should dispatch KeyAddedCacheEvent when key doesnt exists", async () => {
                let event_ = null as KeyAddedCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyAddedCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                const ttl = TimeSpan.fromMilliseconds(20);
                await cacheA.put("a", 1, ttl);
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyAddedCacheEvent);
                expect(event_?.fields.key).toBe("a");
                expect(event_?.fields.value).toBe(1);
                expect(event_?.fields.ttl?.toMilliseconds()).toBe(
                    ttl.toMilliseconds(),
                );
                await unsubscribe();
            });
            test("Should dispatch KeyUpdatedCacheEvent when key exists", async () => {
                let event_ = null as KeyUpdatedCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyUpdatedCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.put("a", 1);
                await cacheA.put("a", 2);
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyUpdatedCacheEvent);
                expect(event_?.fields.key).toBe("a");
                expect(event_?.fields.value).toBe(2);
                await unsubscribe();
            });
        });
        describe("method: putMany", () => {
            test("Should dispatch KeyAddedCacheEvent when key exists", async () => {
                let event_ = null as KeyAddedCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyAddedCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                const ttl = TimeSpan.fromMilliseconds(20);
                await cacheA.putMany({ a: { value: 1, ttl } });
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyAddedCacheEvent);
                expect(event_?.fields.key).toBe("a");
                expect(event_?.fields.value).toBe(1);
                expect(event_?.fields.ttl?.toMilliseconds()).toBe(
                    ttl.toMilliseconds(),
                );
                await unsubscribe();
            });
            test("Should dispatch KeyUpdatedCacheEvent when key exists", async () => {
                let event_ = null as KeyUpdatedCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyUpdatedCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );

                const ttl = TimeSpan.fromMilliseconds(20);
                await cacheA.putMany({ a: { value: 1, ttl } });
                await cacheA.putMany({ a: { value: 2, ttl } });
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyUpdatedCacheEvent);
                expect(event_?.fields.key).toBe("a");
                expect(event_?.fields.value).toBe(2);
                await unsubscribe();
            });
        });
        describe("method: remove", () => {
            test("Should dispatch KeyRemovedCacheEvent when key exists", async () => {
                let event_ = null as KeyRemovedCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyRemovedCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.add("a", 1);
                await cacheA.remove("a");
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyRemovedCacheEvent);
                expect(event_?.fields.key).toBe("a");
                await unsubscribe();
            });
            test("Should dispatch KeyNotFoundCacheEvent when key doesnt exists", async () => {
                let event_ = null as KeyNotFoundCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyNotFoundCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.remove("a");
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyNotFoundCacheEvent);
                expect(event_?.fields.key).toBe("a");
                await unsubscribe();
            });
        });
        describe("method: removeMany", () => {
            test("Should dispatch KeyRemovedCacheEvent when key doesnt exists", async () => {
                let event_ = null as KeyRemovedCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyRemovedCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.add("a", 1);
                await cacheA.removeMany(["a"]);
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyRemovedCacheEvent);
                expect(event_?.fields.key).toBe("a");
                await unsubscribe();
            });
            test("Should dispatch KeyNotFoundCacheEvent when key doesnt exists", async () => {
                let event_ = null as KeyNotFoundCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyNotFoundCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.removeMany(["a"]);
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyNotFoundCacheEvent);
                expect(event_?.fields.key).toBe("a");
                await unsubscribe();
            });
        });
        describe("method: getAndRemove", () => {
            test("Should dispatch KeyNotFoundCacheEvent when key doesnt exists", async () => {
                let event_ = null as KeyNotFoundCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyNotFoundCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.getAndRemove("a");
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyNotFoundCacheEvent);
                expect(event_?.fields.key).toBe("a");
                await unsubscribe();
            });
            test("Should dispatch KeyFoundCacheEvent when key exists", async () => {
                let event_ = null as KeyFoundCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyFoundCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.add("a", 1);
                await cacheA.getAndRemove("a");
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyFoundCacheEvent);
                expect(event_?.fields.key).toBe("a");
                expect(event_?.fields.value).toBe(1);
                await unsubscribe();
            });
            test("Should dispatch KeyRemovedCacheEvent when key exists", async () => {
                let event_ = null as KeyRemovedCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyRemovedCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.add("a", 1);
                await cacheA.getAndRemove("a");
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyRemovedCacheEvent);
                expect(event_?.fields.key).toBe("a");
                await unsubscribe();
            });
        });
        describe("method: getOrAdd", () => {
            test("Should dispatch KeyNotFoundCacheEvent when key doesnt exists", async () => {
                let event_ = null as KeyNotFoundCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyNotFoundCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.getOrAdd("a", 1);
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyNotFoundCacheEvent);
                expect(event_?.fields.key).toBe("a");
                await unsubscribe();
            });
            test("Should dispatch KeyFoundCacheEvent when key exists", async () => {
                let event_ = null as KeyFoundCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyFoundCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.add("a", 1);
                await cacheA.getOrAdd("a", 1);
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyFoundCacheEvent);
                expect(event_?.fields.key).toBe("a");
                expect(event_?.fields.value).toBe(1);
                await unsubscribe();
            });
            test("Should dispatch KeyAddedCacheEvent when key exists", async () => {
                let event_ = null as KeyAddedCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyAddedCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                const ttl = TimeSpan.fromMilliseconds(50);
                await cacheA.getOrAdd("a", 1, ttl);
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyAddedCacheEvent);
                expect(event_?.fields.key).toBe("a");
                expect(event_?.fields.value).toBe(1);
                expect(event_?.fields.ttl?.toMilliseconds()).toBe(
                    ttl.toMilliseconds(),
                );
                await unsubscribe();
            });
        });
        describe("method: increment", () => {
            test("Should dispatch KeyIncrementedCacheEvent when key exists", async () => {
                let event_ = null as KeyIncrementedCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyIncrementedCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.add("a", 1);
                await cacheA.increment("a", 1);
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyIncrementedCacheEvent);
                expect(event_?.fields.key).toBe("a");
                expect(event_?.fields.value).toBe(1);
                await unsubscribe();
            });
            test("Should dispatch KeyNotFoundCacheEvent when key doesnt exists", async () => {
                let event_ = null as KeyNotFoundCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyNotFoundCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.increment("a", 1);
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyNotFoundCacheEvent);
                expect(event_?.fields.key).toBe("a");
                await unsubscribe();
            });
        });
        describe("method: decrement", () => {
            test("Should dispatch KeyDecrementedCacheEvent when key exists", async () => {
                let event_ = null as KeyDecrementedCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyDecrementedCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.add("a", 1);
                await cacheA.decrement("a", 1);
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyDecrementedCacheEvent);
                expect(event_?.fields.key).toBe("a");
                expect(event_?.fields.value).toBe(1);
                await unsubscribe();
            });
            test("Should dispatch KeyNotFoundCacheEvent when key doesnt exists", async () => {
                let event_ = null as KeyNotFoundCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeyNotFoundCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.decrement("a", 1);
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeyNotFoundCacheEvent);
                expect(event_?.fields.key).toBe("a");
                await unsubscribe();
            });
        });
        describe("method: clear", () => {
            test("Should dispatch KeysClearedCacheEvent when key doesnt exists", async () => {
                let event_ = null as KeysClearedCacheEvent | null;
                const unsubscribe = await cacheA.subscribe(
                    KeysClearedCacheEvent,
                    (event) => {
                        event_ = event;
                    },
                );
                await cacheA.addMany({
                    a: { value: 1 },
                    b: { value: 2 },
                    c: { value: 3 },
                });
                await cacheA.clear();
                await delay(delayTime);
                expect(event_).toBeInstanceOf(KeysClearedCacheEvent);
                await unsubscribe();
            });
        });
    });
    describe("Group tests:", () => {
        test("method: exists", async () => {
            await cacheA.put("a", 1);
            expect(await cacheA.exists("a")).toBe(true);
            expect(await cacheB.exists("a")).toBe(false);
        });
        test("method: existsMany", async () => {
            await cacheA.putMany({
                a: { value: 1 },
                b: { value: 1 },
            });
            expect(await cacheA.existsMany(["a", "b"])).toEqual({
                a: true,
                b: true,
            });
            expect(await cacheB.existsMany(["a", "b"])).toEqual({
                a: false,
                b: false,
            });
        });
        test("method: missing", async () => {
            await cacheA.put("a", 1);
            expect(await cacheA.missing("a")).toBe(false);
            expect(await cacheB.missing("a")).toBe(true);
        });
        test("method: missingMany", async () => {
            await cacheA.putMany({
                a: { value: 1 },
                b: { value: 1 },
            });
            expect(await cacheA.missingMany(["a", "b"])).toEqual({
                a: false,
                b: false,
            });
            expect(await cacheB.missingMany(["a", "b"])).toEqual({
                a: true,
                b: true,
            });
        });
        test("method: get", async () => {
            await cacheA.put("a", 1);
            expect(await cacheA.get("a")).toBe(1);
            expect(await cacheB.get("a")).toBeNull();
        });
        test("method: getMany", async () => {
            await cacheA.putMany({
                a: { value: 1 },
                b: { value: 1 },
            });
            expect(await cacheA.getMany(["a", "b"])).toEqual({
                a: 1,
                b: 1,
            });
            expect(await cacheB.getMany(["a", "b"])).toEqual({
                a: null,
                b: null,
            });
        });
        test("method: getOr", async () => {
            await cacheA.put("a", 1);
            expect(await cacheA.getOr("a", -1)).toBe(1);
            expect(await cacheB.getOr("a", -1)).toBe(-1);
        });
        test("method: getOrMany", async () => {
            await cacheA.putMany({
                a: { value: 1 },
                b: { value: 1 },
            });
            expect(
                await cacheA.getOrMany({
                    a: -1,
                    b: -1,
                }),
            ).toEqual({
                a: 1,
                b: 1,
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
        test("method: getOrFail", async () => {
            await cacheA.put("a", 1);
            expect(await cacheA.getOrFail("a")).toBe(1);
            await expect(cacheB.getOrFail("a")).rejects.toBeInstanceOf(
                KeyNotFoundCacheError,
            );
        });
        test("method: add", async () => {
            await cacheA.add("a", 1);
            await cacheB.add("a", 2);
            expect(await cacheA.get("a")).toBe(1);
            expect(await cacheB.get("a")).toBe(2);
        });
        test("method: addMany", async () => {
            await cacheA.addMany({
                a: { value: 1 },
                b: { value: 1 },
            });
            await cacheB.addMany({
                a: { value: 2 },
                b: { value: 2 },
            });
            expect(await cacheA.getMany(["a", "b"])).toEqual({ a: 1, b: 1 });
            expect(await cacheB.getMany(["a", "b"])).toEqual({ a: 2, b: 2 });
        });
        test("method: update", async () => {
            await cacheA.add("a", 1);
            await cacheB.add("a", 1);
            await cacheA.update("a", 2);
            await cacheB.update("a", 3);
            expect(await cacheA.get("a")).toBe(2);
            expect(await cacheB.get("a")).toBe(3);
        });
        test("method: updateMany", async () => {
            await cacheA.addMany({
                a: { value: 1 },
                b: { value: 1 },
            });
            await cacheB.addMany({
                a: { value: 1 },
                b: { value: 1 },
            });
            await cacheA.updateMany({
                a: 2,
                b: 2,
            });
            await cacheB.updateMany({
                a: 3,
                b: 3,
            });
            expect(await cacheA.getMany(["a", "b"])).toEqual({ a: 2, b: 2 });
            expect(await cacheB.getMany(["a", "b"])).toEqual({ a: 3, b: 3 });
        });
        test("method: put", async () => {
            await cacheA.put("a", 2);
            await cacheB.put("a", 3);
            expect(await cacheA.get("a")).toBe(2);
            expect(await cacheB.get("a")).toBe(3);
        });
        test("method: putMany", async () => {
            await cacheA.putMany({
                a: { value: 2 },
                b: { value: 2 },
            });
            await cacheB.putMany({
                a: { value: 3 },
                b: { value: 3 },
            });
            expect(await cacheA.getMany(["a", "b"])).toEqual({ a: 2, b: 2 });
            expect(await cacheB.getMany(["a", "b"])).toEqual({ a: 3, b: 3 });
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
                a: { value: 1 },
                b: { value: 1 },
            });
            await cacheB.addMany({
                a: { value: 1 },
                b: { value: 1 },
            });
            await cacheA.removeMany(["a", "b"]);
            expect(await cacheA.getMany(["a", "b"])).toEqual({
                a: null,
                b: null,
            });
            expect(await cacheB.getMany(["a", "b"])).toEqual({ a: 1, b: 1 });
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
            await cacheB.getOrAdd("a", 2);
            expect(await cacheA.get("a")).toBe(1);
            expect(await cacheB.get("a")).toBe(2);
        });
        test("method: increment", async () => {
            await cacheA.add("a", 1);
            await cacheB.add("a", 1);
            await cacheA.increment("a", 1);
            expect(await cacheA.get("a")).toBe(2);
            expect(await cacheB.get("a")).toBe(1);
        });
        test("method: decrement", async () => {
            await cacheA.add("a", 1);
            await cacheB.add("a", 1);
            await cacheA.decrement("a", 1);
            expect(await cacheA.get("a")).toBe(0);
            expect(await cacheB.get("a")).toBe(1);
        });
        test("method: clear", async () => {
            await cacheA.addMany({
                a: { value: 1 },
                b: { value: 2 },
            });
            await cacheB.addMany({
                a: { value: 1 },
                b: { value: 2 },
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
        test("method: addListener / dispatch", async () => {
            let result_a: KeyAddedCacheEvent | null = null;
            await cacheA.addListener(KeyAddedCacheEvent, (event) => {
                result_a = event;
            });

            let result_b: KeyAddedCacheEvent | null = null;
            await cacheB.addListener(KeyAddedCacheEvent, (event) => {
                result_b = event;
            });

            await cacheA.add("a", 1);

            expect(result_a).toBeInstanceOf(KeyAddedCacheEvent);
            expect(result_b).toBeNull();
        });
        test("method: addListenerMany / dispatch", async () => {
            let result_a: KeyAddedCacheEvent | null = null;
            await cacheA.addListenerMany([KeyAddedCacheEvent], (event) => {
                result_a = event;
            });

            let result_b: KeyAddedCacheEvent | null = null;
            await cacheB.addListenerMany([KeyAddedCacheEvent], (event) => {
                result_b = event;
            });

            await cacheA.add("a", 1);

            expect(result_a).toBeInstanceOf(KeyAddedCacheEvent);
            expect(result_b).toBeNull();
        });
        test("method: removeListener / addListener / dispatch", async () => {
            let result_a: KeyAddedCacheEvent | null = null;
            await cacheA.addListener(KeyAddedCacheEvent, (event) => {
                result_a = event;
            });

            let result_b: KeyAddedCacheEvent | null = null;
            const listenerB = (event: KeyAddedCacheEvent) => {
                result_b = event;
            };
            await cacheB.addListener(KeyAddedCacheEvent, listenerB);
            await cacheB.removeListener(KeyAddedCacheEvent, listenerB);

            await cacheA.add("a", 1);
            await cacheB.add("a", 1);

            expect(result_a).toBeInstanceOf(KeyAddedCacheEvent);
            expect(result_b).toBeNull();
        });
        test("method: removeListenerMany / addListener / dispatch", async () => {
            let result_a: KeyAddedCacheEvent | null = null;
            await cacheA.addListener(KeyAddedCacheEvent, (event) => {
                result_a = event;
            });

            let result_b: KeyAddedCacheEvent | null = null;
            const listenerB = (event: KeyAddedCacheEvent) => {
                result_b = event;
            };
            await cacheB.addListener(KeyAddedCacheEvent, listenerB);
            await cacheB.removeListenerMany([KeyAddedCacheEvent], listenerB);

            await cacheA.add("a", 1);
            await cacheB.add("a", 1);

            expect(result_a).toBeInstanceOf(KeyAddedCacheEvent);
            expect(result_b).toBeNull();
        });
        test("method: subscribe / dispatch", async () => {
            let result_a: KeyAddedCacheEvent | null = null;
            await cacheA.subscribe(KeyAddedCacheEvent, (event) => {
                result_a = event;
            });

            let result_b: KeyAddedCacheEvent | null = null;
            const listenerB = (event: KeyAddedCacheEvent) => {
                result_b = event;
            };
            const unsubscribe = await cacheB.subscribe(
                KeyAddedCacheEvent,
                listenerB,
            );
            await unsubscribe();

            await cacheA.add("a", 1);
            await cacheB.add("a", 1);

            expect(result_a).toBeInstanceOf(KeyAddedCacheEvent);
            expect(result_b).toBeNull();
        });
        test("method: subscribeMany / dispatch", async () => {
            let result_a: KeyAddedCacheEvent | null = null;
            await cacheA.subscribeMany([KeyAddedCacheEvent], (event) => {
                result_a = event;
            });

            let result_b: KeyAddedCacheEvent | null = null;
            const listenerB = (event: KeyAddedCacheEvent) => {
                result_b = event;
            };
            const unsubscribe = await cacheB.subscribeMany(
                [KeyAddedCacheEvent],
                listenerB,
            );
            await unsubscribe();

            await cacheA.add("a", 1);
            await cacheB.add("a", 1);

            expect(result_a).toBeInstanceOf(KeyAddedCacheEvent);
            expect(result_b).toBeNull();
        });
    });
}
