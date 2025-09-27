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
    TypeCacheError,
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
} from "@/cache/contracts/_module-exports.js";
import { type Promisable } from "@/utilities/_module-exports.js";
import { LazyPromise } from "@/async/_module-exports.js";
import { TimeSpan } from "@/time-span/implementations/_module-exports.js";

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
 * import { MemoryCacheAdapter } from "@daiso-tech/core/cache/adapters";
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
        describe("method: exists", () => {
            test("Should return true when key exists", async () => {
                await cache.add("a", 1, null);
                await LazyPromise.delay(TTL.divide(4));
                expect(await cache.exists("a")).toBe(true);
            });
            test("Should return false when keys doesnt exists", async () => {
                expect(await cache.exists("a")).toBe(false);
            });
            test("Should return false when key is experied", async () => {
                await cache.add("a", 1, TTL);
                await LazyPromise.delay(TTL.addTimeSpan(TTL.divide(4)));
                expect(await cache.exists("a")).toBe(false);
            });
        });
        describe("method: missing", () => {
            test("Should return false when key exists", async () => {
                await cache.add("a", 1, null);
                await LazyPromise.delay(TTL.divide(4));
                expect(await cache.missing("a")).toBe(false);
            });
            test("Should return true when keys doesnt exists", async () => {
                expect(await cache.missing("a")).toBe(true);
            });
            test("Should return true when key is experied", async () => {
                await cache.add("a", 1, TTL);
                await LazyPromise.delay(TTL.addTimeSpan(TTL.divide(4)));
                expect(await cache.missing("a")).toBe(true);
            });
        });
        describe("method: get", () => {
            test("Should return the value when key exists", async () => {
                await cache.add("a", 1, null);
                await LazyPromise.delay(TTL.divide(4));
                expect(await cache.get("a")).toBe(1);
            });
            test("Should return null when keys doesnt exists", async () => {
                expect(await cache.get("a")).toBeNull();
            });
            test("Should return null when key is experied", async () => {
                await cache.add("a", 1, TTL);
                await LazyPromise.delay(TTL.addTimeSpan(TTL.divide(4)));
                expect(await cache.get("a")).toBeNull();
            });
        });
        describe("method: getOrFail", () => {
            test("Should return the value when key exists", async () => {
                await cache.add("a", 1, null);
                await LazyPromise.delay(TTL.divide(4));
                expect(await cache.getOrFail("a")).toBe(1);
            });
            test("Should throw an KeyNotFoundCacheError when keys doesnt exists", async () => {
                await expect(cache.getOrFail("a")).rejects.toBeInstanceOf(
                    KeyNotFoundCacheError,
                );
            });
            test("Should throw an KeyNotFoundCacheError when key is experied", async () => {
                await cache.add("a", 1, TTL);
                await LazyPromise.delay(TTL.addTimeSpan(TTL.divide(4)));
                await expect(cache.getOrFail("a")).rejects.toBeInstanceOf(
                    KeyNotFoundCacheError,
                );
            });
        });
        describe("method: getOr", () => {
            test("Should return value when key exists", async () => {
                await cache.add("a", 1);
                expect(await cache.getOr("a", -1)).toBe(1);
            });
            describe("Should return default value when key doesnt exists", () => {
                test("Value", async () => {
                    expect(await cache.getOr("a", -1)).toBe(-1);
                });
                test("Function", async () => {
                    expect(await cache.getOr("a", () => -1)).toBe(-1);
                });
                test("Async function", async () => {
                    expect(
                        await cache.getOr("a", () => Promise.resolve(-1)),
                    ).toBe(-1);
                });
                test("LazyPromise", async () => {
                    expect(
                        await cache.getOr(
                            "a",
                            new LazyPromise(() => Promise.resolve(-1)),
                        ),
                    ).toBe(-1);
                });
            });
            describe("Should return default value when key is expired", () => {
                test("Value", async () => {
                    await cache.add("a", 1, TTL);
                    await LazyPromise.delay(TTL);
                    expect(await cache.getOr("a", -1)).toBe(-1);
                });
                test("Function", async () => {
                    await cache.add("a", 1, TTL);
                    await LazyPromise.delay(TTL);
                    expect(await cache.getOr("a", () => -1)).toBe(-1);
                });
                test("Async function", async () => {
                    await cache.add("a", 1, TTL);
                    await LazyPromise.delay(TTL);
                    expect(
                        await cache.getOr("a", () => Promise.resolve(-1)),
                    ).toBe(-1);
                });
                test("LazyPromise", async () => {
                    await cache.add("a", 1, TTL);
                    await LazyPromise.delay(TTL);
                    expect(
                        await cache.getOr(
                            "a",
                            new LazyPromise(() => Promise.resolve(-1)),
                        ),
                    ).toBe(-1);
                });
            });
        });
        describe("method: getAndRemove", () => {
            test("Should return value when key exists", async () => {
                await cache.add("a", 1, null);
                await LazyPromise.delay(TTL.divide(4));
                expect(await cache.getAndRemove("a")).toBe(1);
            });
            test("Should return null when key doesnt exists", async () => {
                expect(await cache.getAndRemove("a")).toBeNull();
            });
            test("Should return null when key is expired", async () => {
                await cache.add("a", 1, TTL);
                await LazyPromise.delay(TTL.addTimeSpan(TTL.divide(4)));
                expect(await cache.getAndRemove("a")).toBeNull();
            });
            test("Should persist removal when key exists", async () => {
                await cache.add("a", 1, null);
                await LazyPromise.delay(TTL.divide(4));
                await cache.getAndRemove("a");
                await LazyPromise.delay(TTL.divide(4));
                expect(await cache.get("a")).toBeNull();
            });
        });
        describe("method: getOrAdd", () => {
            test("Should return value when key exists", async () => {
                await cache.add("a", 1);
                expect(await cache.getOrAdd("a", -1)).toBe(1);
            });
            describe("Should persist insertion when key doesnt exists", () => {
                test("Value", async () => {
                    await cache.getOrAdd("a", -1);
                    expect(await cache.get("a")).toBe(-1);
                });
                test("Function", async () => {
                    await cache.getOrAdd("a", () => -1);
                    expect(await cache.get("a")).toBe(-1);
                });
                test("Async function", async () => {
                    await cache.getOrAdd("a", () => Promise.resolve(-1));
                    expect(await cache.get("a")).toBe(-1);
                });
                test("LazyPromise", async () => {
                    await cache.getOrAdd(
                        "a",
                        new LazyPromise(() => Promise.resolve(-1)),
                    );
                    expect(await cache.get("a")).toBe(-1);
                });
            });
            describe("Should persist insertion when key is expired", () => {
                test("Value", async () => {
                    await cache.add("a", 1, TTL);
                    await LazyPromise.delay(TTL);
                    await cache.getOrAdd("a", -1);
                    expect(await cache.get("a")).toBe(-1);
                });
                test("Function", async () => {
                    await cache.add("a", 1, TTL);
                    await LazyPromise.delay(TTL);
                    await cache.getOrAdd("a", () => -1);
                    expect(await cache.get("a")).toBe(-1);
                });
                test("Async function", async () => {
                    await cache.add("a", 1, TTL);
                    await LazyPromise.delay(TTL);
                    await cache.getOrAdd("a", () => Promise.resolve(-1));
                    expect(await cache.get("a")).toBe(-1);
                });
                test("LazyPromise", async () => {
                    await cache.add("a", 1, TTL);
                    await LazyPromise.delay(TTL);
                    await cache.getOrAdd(
                        "a",
                        new LazyPromise(() => Promise.resolve(-1)),
                    );
                    expect(await cache.get("a")).toBe(-1);
                });
            });
        });
        describe("method: add", () => {
            test("Should return true when key doesnt exists", async () => {
                const result = await cache.add("a", 1, null);
                await LazyPromise.delay(TTL.divide(4));
                expect(result).toBe(true);
            });
            test("Should return true when key is expired", async () => {
                await cache.add("a", 1, TTL);
                await LazyPromise.delay(TTL.addTimeSpan(TTL.divide(4)));
                expect(await cache.add("a", 1, null)).toBe(true);
            });
            test("Should persist values when key doesnt exist", async () => {
                await cache.add("a", 1, null);
                await LazyPromise.delay(TTL.divide(4));
                expect(await cache.get("a")).toBe(1);
            });
            test("Should persist values when key is expired", async () => {
                await cache.add("a", -1, TTL);
                await LazyPromise.delay(TTL.addTimeSpan(TTL.divide(4)));
                await cache.add("a", 1, null);
                expect(await cache.get("a")).toBe(1);
            });
            test("Should return false when key exists", async () => {
                await cache.add("a", 1, null);
                await LazyPromise.delay(TTL.divide(4));
                expect(await cache.add("a", 1, null)).toBe(false);
            });
            test("Should not persist value when key exist", async () => {
                await cache.add("a", 1, null);
                await LazyPromise.delay(TTL.divide(4));
                await cache.add("a", 2, null);
                await LazyPromise.delay(TTL.divide(4));
                expect(await cache.get("a")).toBe(1);
            });
        });
        describe("method: put", () => {
            test("Should return true when key exists", async () => {
                await cache.add("a", 1, null);
                await LazyPromise.delay(TTL.divide(4));
                expect(await cache.put("a", -1, null)).toBe(true);
            });
            test("Should persist value when key exist", async () => {
                await cache.add("a", 1, null);
                await LazyPromise.delay(TTL.divide(4));
                await cache.put("a", -1, null);
                await LazyPromise.delay(TTL.divide(4));
                expect(await cache.get("a")).toBe(-1);
            });
            test("Should return false when key doesnt exists", async () => {
                expect(await cache.put("a", -1, null)).toBe(false);
            });
            test("Should return false when key is expired", async () => {
                await cache.add("a", 1, TTL);
                await LazyPromise.delay(TTL.addTimeSpan(TTL.divide(4)));
                expect(await cache.put("a", -1, null)).toBe(false);
            });
            test("Should persist values when key doesnt exist", async () => {
                await cache.put("a", -1, null);
                await LazyPromise.delay(TTL.divide(4));
                expect(await cache.get("a")).toBe(-1);
            });
            test("Should persist values when key is expired", async () => {
                await cache.add("a", 1, TTL);
                await LazyPromise.delay(TTL.addTimeSpan(TTL.divide(4)));
                await cache.put("a", -1, null);
                await LazyPromise.delay(TTL.divide(4));
                expect(await cache.get("a")).toBe(-1);
            });
            test("Should replace the ttl value", async () => {
                const ttlA = TimeSpan.fromMilliseconds(100);
                await cache.add("a", 1, ttlA);
                await LazyPromise.delay(TTL.divide(4));
                const ttlB = TimeSpan.fromMilliseconds(50);
                await cache.put("a", -1, ttlB);
                await LazyPromise.delay(ttlB);
                expect(await cache.get("a")).toBeNull();
            });
        });
        describe("method: update", () => {
            test("Should return true when key exists", async () => {
                await cache.add("a", 1, null);
                await LazyPromise.delay(TTL.divide(4));
                expect(await cache.update("a", -1)).toBe(true);
            });
            test("Should persist value when key exist", async () => {
                await cache.add("a", 1, null);
                await LazyPromise.delay(TTL.divide(4));
                await cache.update("a", -1);
                await LazyPromise.delay(TTL.divide(4));
                expect(await cache.get("a")).toBe(-1);
            });
            test("Should return false when key doesnt exists", async () => {
                expect(await cache.update("a", -1)).toBe(false);
            });
            test("Should return false when key is expired", async () => {
                await cache.add("a", 1, TTL);
                await LazyPromise.delay(TTL.addTimeSpan(TTL.divide(4)));
                expect(await cache.update("a", -1)).toBe(false);
            });
            test("Should not persist value when key doesnt exist", async () => {
                await cache.update("a", -1);
                await LazyPromise.delay(TTL.divide(4));
                expect(await cache.get("a")).toBeNull();
            });
            test("Should not persist value when key is expired", async () => {
                await cache.add("a", 1, TTL);
                await LazyPromise.delay(TTL.addTimeSpan(TTL.divide(4)));
                await cache.update("a", -1);
                expect(await cache.get("a")).toBeNull();
            });
        });
        describe("method: increment", () => {
            test("Should return true when key exists", async () => {
                await cache.add("a", 1, null);
                await LazyPromise.delay(TTL.divide(4));
                expect(await cache.increment("a", 1)).toBe(true);
            });
            test("Should persist increment when key exists", async () => {
                await cache.add("a", 1, null);
                await LazyPromise.delay(TTL.divide(4));
                await cache.increment("a", 1);
                await LazyPromise.delay(TTL.divide(4));
                expect(await cache.get("a")).toBe(2);
            });
            test("Should return false when key doesnt exists", async () => {
                expect(await cache.increment("a", 1)).toBe(false);
            });
            test("Should return false when key is expired", async () => {
                await cache.add("a", 1, TTL);
                await LazyPromise.delay(TTL.addTimeSpan(TTL.divide(4)));
                expect(await cache.increment("a", 1)).toBe(false);
            });
            test("Should not persist increment when key doesnt exists", async () => {
                await cache.increment("a", 1);
                await LazyPromise.delay(TTL.divide(4));
                expect(await cache.get("a")).toBeNull();
            });
            test("Should not persist increment when key is expired", async () => {
                await cache.add("a", 1, TTL);
                await LazyPromise.delay(TTL.addTimeSpan(TTL.divide(4)));
                await cache.increment("a", 1);
                expect(await cache.get("a")).toBeNull();
            });
            test("Should throw TypeCacheError key value is not number type", async () => {
                await cache.add("a", "str", null);
                await LazyPromise.delay(TTL.divide(4));
                await expect(cache.increment("a", 1)).rejects.toBeInstanceOf(
                    TypeCacheError,
                );
            });
        });
        describe("method: decrement", () => {
            test("Should return true when key exists", async () => {
                await cache.add("a", 1, null);
                await LazyPromise.delay(TTL.divide(4));
                expect(await cache.decrement("a", 1)).toBe(true);
            });
            test("Should persist decrement when key exists", async () => {
                await cache.add("a", 1, null);
                await LazyPromise.delay(TTL.divide(4));
                await cache.decrement("a", 1);
                await LazyPromise.delay(TTL.divide(4));
                expect(await cache.get("a")).toBe(0);
            });
            test("Should return false when key doesnt exists", async () => {
                expect(await cache.decrement("a", 1)).toBe(false);
            });
            test("Should return false when key is expired", async () => {
                await cache.add("a", 1, TTL);
                await LazyPromise.delay(TTL.addTimeSpan(TTL.divide(4)));
                expect(await cache.decrement("a", 1)).toBe(false);
            });
            test("Should not persist decrement when key doesnt exists", async () => {
                await cache.decrement("a", 1);
                await LazyPromise.delay(TTL.divide(4));
                expect(await cache.get("a")).toBeNull();
            });
            test("Should not persist decrement when key is expired", async () => {
                await cache.add("a", 1, TTL);
                await LazyPromise.delay(TTL.addTimeSpan(TTL.divide(4)));
                await cache.decrement("a", 1);
                expect(await cache.get("a")).toBeNull();
            });
            test("Should throw TypeCacheError key value is not number type", async () => {
                await cache.add("a", "str", null);
                await LazyPromise.delay(TTL.divide(4));
                await expect(cache.decrement("a", 1)).rejects.toBeInstanceOf(
                    TypeCacheError,
                );
            });
        });
        describe("method: remove", () => {
            test("Should return true when key exists", async () => {
                await cache.add("a", 1, null);
                await LazyPromise.delay(TTL.divide(4));

                const result = await cache.remove("a");

                expect(result).toBe(true);
            });
            test("Should persist the key removal when key exists", async () => {
                await cache.add("a", 1, null);
                await LazyPromise.delay(TTL.divide(4));

                await cache.remove("a");
                await LazyPromise.delay(TTL.divide(4));

                expect(await cache.get("a")).toEqual(null);
            });
        });
        describe("method: removeMany", () => {
            test("Should return true when one key exists", async () => {
                await cache.add("a", 1, null);
                await LazyPromise.delay(TTL.divide(4));

                const result = await cache.removeMany(["a", "b", "c"]);

                expect(result).toBe(true);
            });
            test("Should persist removal of the keys that exists", async () => {
                await cache.add("a", 1, null);
                await cache.add("b", 2, null);
                await cache.add("c", 3, null);
                await LazyPromise.delay(TTL.divide(4));

                await cache.removeMany(["a", "b"]);
                await LazyPromise.delay(TTL.divide(4));

                const result = [
                    await cache.get("a"),
                    await cache.get("b"),
                    await cache.get("c"),
                ];
                expect(result).toEqual([null, null, 3]);
            });
        });
        describe("method: clear", () => {
            test("Should remove all keys", async () => {
                await cache.add("a", 1);
                await cache.add("b", 2);
                await cache.add("c", 3);
                await cache.add("d", 4);
                await cache.clear();
                const result = [
                    await cache.get("a"),
                    await cache.get("b"),
                    await cache.get("c"),
                    await cache.get("d"),
                ];
                expect(result).toStrictEqual([null, null, null, null]);
            });
        });
    });
    describe("Event tests:", () => {
        describe("method: exists", () => {
            test("Should dispatch NotFoundCacheEvent when key doesnt exists", async () => {
                let event_ = null as NotFoundCacheEvent | null;
                const unsubscribe = await cache.subscribe(
                    CACHE_EVENTS.NOT_FOUND,
                    (event) => {
                        event_ = event;
                    },
                );
                await cache.exists("a");
                await LazyPromise.delay(DELAY_TIME);
                expect(event_?.key).toBe("a");
                await unsubscribe();
            });
            test("Should dispatch FoundCacheEvent when key exists", async () => {
                let event_ = null as FoundCacheEvent | null;
                const unsubscribe = await cache.subscribe(
                    CACHE_EVENTS.FOUND,
                    (event) => {
                        event_ = event;
                    },
                );
                await cache.add("a", 1);
                await cache.exists("a");
                await LazyPromise.delay(DELAY_TIME);
                expect(event_?.key).toBe("a");
                expect(event_?.value).toBe(1);
                await unsubscribe();
            });
        });
        describe("method: missing", () => {
            test("Should dispatch NotFoundCacheEvent when key doesnt exists", async () => {
                let event_ = null as NotFoundCacheEvent | null;
                const unsubscribe = await cache.subscribe(
                    CACHE_EVENTS.NOT_FOUND,
                    (event) => {
                        event_ = event;
                    },
                );
                await cache.missing("a");
                await LazyPromise.delay(DELAY_TIME);
                expect(event_?.key).toBe("a");
                await unsubscribe();
            });
            test("Should dispatch FoundCacheEvent when key exists", async () => {
                let event_ = null as FoundCacheEvent | null;
                const unsubscribe = await cache.subscribe(
                    CACHE_EVENTS.FOUND,
                    (event) => {
                        event_ = event;
                    },
                );
                await cache.add("a", 1);
                await cache.missing("a");
                await LazyPromise.delay(DELAY_TIME);
                expect(event_?.key).toBe("a");
                expect(event_?.value).toBe(1);
                await unsubscribe();
            });
        });
        describe("method: get", () => {
            test("Should dispatch NotFoundCacheEvent when key doesnt exists", async () => {
                let event_ = null as NotFoundCacheEvent | null;
                const unsubscribe = await cache.subscribe(
                    CACHE_EVENTS.NOT_FOUND,
                    (event) => {
                        event_ = event;
                    },
                );
                await cache.get("a");
                await LazyPromise.delay(DELAY_TIME);
                expect(event_?.key).toBe("a");
                await unsubscribe();
            });
            test("Should dispatch FoundCacheEvent when key exists", async () => {
                let event_ = null as FoundCacheEvent | null;
                const unsubscribe = await cache.subscribe(
                    CACHE_EVENTS.FOUND,
                    (event) => {
                        event_ = event;
                    },
                );
                await cache.add("a", 1);
                await cache.get("a");
                await LazyPromise.delay(DELAY_TIME);
                expect(event_?.key).toBe("a");
                expect(event_?.value).toBe(1);
                await unsubscribe();
            });
        });
        describe("method: getOr", () => {
            test("Should dispatch NotFoundCacheEvent when key doesnt exists", async () => {
                let event_ = null as NotFoundCacheEvent | null;
                const unsubscribe = await cache.subscribe(
                    CACHE_EVENTS.NOT_FOUND,
                    (event) => {
                        event_ = event;
                    },
                );
                await cache.getOr("a", 1);
                await LazyPromise.delay(DELAY_TIME);
                expect(event_?.key).toBe("a");
                await unsubscribe();
            });
            test("Should dispatch FoundCacheEvent when key exists", async () => {
                let event_ = null as FoundCacheEvent | null;
                const unsubscribe = await cache.subscribe(
                    CACHE_EVENTS.FOUND,
                    (event) => {
                        event_ = event;
                    },
                );
                await cache.add("a", 1);
                await cache.getOr("a", 1);
                await LazyPromise.delay(DELAY_TIME);
                expect(event_?.key).toBe("a");
                expect(event_?.value).toBe(1);
                await unsubscribe();
            });
        });
        describe("method: getOrFail", () => {
            test("Should dispatch NotFoundCacheEvent when key doesnt exists", async () => {
                let event_ = null as NotFoundCacheEvent | null;
                const unsubscribe = await cache.subscribe(
                    CACHE_EVENTS.NOT_FOUND,
                    (event) => {
                        event_ = event;
                    },
                );
                try {
                    await cache.getOrFail("a");
                } catch {
                    /* Empty */
                }
                await LazyPromise.delay(DELAY_TIME);
                expect(event_?.key).toBe("a");
                await unsubscribe();
            });
            test("Should dispatch FoundCacheEvent when key exists", async () => {
                let event_ = null as FoundCacheEvent | null;
                const unsubscribe = await cache.subscribe(
                    CACHE_EVENTS.FOUND,
                    (event) => {
                        event_ = event;
                    },
                );
                await cache.add("a", 1);
                await cache.getOrFail("a");
                await LazyPromise.delay(DELAY_TIME);
                expect(event_?.key).toBe("a");
                expect(event_?.value).toBe(1);
                await unsubscribe();
            });
        });
        describe("method: add", () => {
            test("Should dispatch AddedCacheEvent when key doesnt exists", async () => {
                let event_ = null as AddedCacheEvent | null;
                const unsubscribe = await cache.subscribe(
                    CACHE_EVENTS.WRITTEN,
                    (event) => {
                        if (event.type === "added") {
                            event_ = event;
                        }
                    },
                );
                const ttl = TimeSpan.fromMilliseconds(20);
                await cache.add("a", 1, ttl);
                await LazyPromise.delay(DELAY_TIME);
                expect(event_?.key).toBe("a");
                expect(event_?.value).toBe(1);
                expect(event_?.ttl?.toMilliseconds()).toBe(
                    ttl.toMilliseconds(),
                );
                await unsubscribe();
            });
        });
        describe("method: update", () => {
            test("Should dispatch UpdatedCacheEvent when key exists", async () => {
                let event_ = null as UpdatedCacheEvent | null;
                const unsubscribe = await cache.subscribe(
                    CACHE_EVENTS.WRITTEN,
                    (event) => {
                        if (event.type === "updated") {
                            event_ = event;
                        }
                    },
                );
                await cache.add("a", 1);
                await cache.update("a", 2);
                await LazyPromise.delay(DELAY_TIME);
                expect(event_?.key).toBe("a");
                expect(event_?.value).toBe(2);
                await unsubscribe();
            });
            test("Should dispatch NotFoundCacheEvent when key doesnt exists", async () => {
                let event_ = null as NotFoundCacheEvent | null;
                const unsubscribe = await cache.subscribe(
                    CACHE_EVENTS.NOT_FOUND,
                    (event) => {
                        event_ = event;
                    },
                );
                await cache.update("a", 2);
                await LazyPromise.delay(DELAY_TIME);
                expect(event_?.key).toBe("a");
                await unsubscribe();
            });
        });
        describe("method: put", () => {
            test("Should dispatch AddedCacheEvent when key doesnt exists", async () => {
                let event_ = null as AddedCacheEvent | null;
                const unsubscribe = await cache.subscribe(
                    CACHE_EVENTS.WRITTEN,
                    (event) => {
                        if (event.type === "added") {
                            event_ = event;
                        }
                    },
                );
                const ttl = TimeSpan.fromMilliseconds(20);
                await cache.put("a", 1, ttl);
                await LazyPromise.delay(DELAY_TIME);
                expect(event_?.key).toBe("a");
                expect(event_?.value).toBe(1);
                expect(event_?.ttl?.toMilliseconds()).toBe(
                    ttl.toMilliseconds(),
                );
                await unsubscribe();
            });
            test("Should dispatch UpdatedCacheEvent when key exists", async () => {
                let event_ = null as UpdatedCacheEvent | null;
                const unsubscribe = await cache.subscribe(
                    CACHE_EVENTS.WRITTEN,
                    (event) => {
                        if (event.type === "updated") {
                            event_ = event;
                        }
                    },
                );
                await cache.put("a", 1);
                await cache.put("a", 2);
                await LazyPromise.delay(DELAY_TIME);
                expect(event_?.key).toBe("a");
                expect(event_?.value).toBe(2);
                await unsubscribe();
            });
        });
        describe("method: remove", () => {
            test("Should dispatch RemovedCacheEvent when key exists", async () => {
                let event_ = null as RemovedCacheEvent | null;
                const unsubscribe = await cache.subscribe(
                    CACHE_EVENTS.WRITTEN,
                    (event) => {
                        if (event.type === "removed") {
                            event_ = event;
                        }
                    },
                );
                await cache.add("a", 1);
                await cache.remove("a");
                await LazyPromise.delay(DELAY_TIME);
                expect(event_?.key).toBe("a");
                await unsubscribe();
            });
            test("Should dispatch NotFoundCacheEvent when key doesnt exists", async () => {
                let event_ = null as NotFoundCacheEvent | null;
                const unsubscribe = await cache.subscribe(
                    CACHE_EVENTS.NOT_FOUND,
                    (event) => {
                        event_ = event;
                    },
                );
                await cache.remove("a");
                await LazyPromise.delay(DELAY_TIME);
                expect(event_?.key).toBe("a");
                await unsubscribe();
            });
        });
        describe("method: removeMany", () => {
            test("Should dispatch RemovedCacheEvent when key doesnt exists", async () => {
                let event_ = null as RemovedCacheEvent | null;
                const unsubscribe = await cache.subscribe(
                    CACHE_EVENTS.WRITTEN,
                    (event) => {
                        if (event.type === "removed") {
                            event_ = event;
                        }
                    },
                );
                await cache.add("a", 1);
                await cache.removeMany(["a"]);
                await LazyPromise.delay(DELAY_TIME);
                expect(event_?.key).toBe("a");
                await unsubscribe();
            });
            test("Should dispatch NotFoundCacheEvent when key doesnt exists", async () => {
                let event_ = null as NotFoundCacheEvent | null;
                const unsubscribe = await cache.subscribe(
                    CACHE_EVENTS.NOT_FOUND,
                    (event) => {
                        event_ = event;
                    },
                );
                await cache.removeMany(["a"]);
                await LazyPromise.delay(DELAY_TIME);
                expect(event_?.key).toBe("a");
                await unsubscribe();
            });
        });
        describe("method: getAndRemove", () => {
            test("Should dispatch NotFoundCacheEvent when key doesnt exists", async () => {
                let event_ = null as NotFoundCacheEvent | null;
                const unsubscribe = await cache.subscribe(
                    CACHE_EVENTS.NOT_FOUND,
                    (event) => {
                        event_ = event;
                    },
                );
                await cache.getAndRemove("a");
                await LazyPromise.delay(DELAY_TIME);
                expect(event_?.key).toBe("a");
                await unsubscribe();
            });
            test("Should dispatch FoundCacheEvent when key exists", async () => {
                let event_ = null as FoundCacheEvent | null;
                const unsubscribe = await cache.subscribe(
                    CACHE_EVENTS.FOUND,
                    (event) => {
                        event_ = event;
                    },
                );
                await cache.add("a", 1);
                await cache.getAndRemove("a");
                await LazyPromise.delay(DELAY_TIME);
                expect(event_?.key).toBe("a");
                expect(event_?.value).toBe(1);
                await unsubscribe();
            });
            test("Should dispatch RemovedCacheEvent when key exists", async () => {
                let event_ = null as RemovedCacheEvent | null;
                const unsubscribe = await cache.subscribe(
                    CACHE_EVENTS.WRITTEN,
                    (event) => {
                        if (event.type === "removed") {
                            event_ = event;
                        }
                    },
                );
                await cache.add("a", 1);
                await cache.getAndRemove("a");
                await LazyPromise.delay(DELAY_TIME);
                expect(event_?.key).toBe("a");
                await unsubscribe();
            });
        });
        describe("method: getOrAdd", () => {
            test("Should dispatch NotFoundCacheEvent when key doesnt exists", async () => {
                let event_ = null as NotFoundCacheEvent | null;
                const unsubscribe = await cache.subscribe(
                    CACHE_EVENTS.NOT_FOUND,
                    (event) => {
                        event_ = event;
                    },
                );
                await cache.getOrAdd("a", 1);
                await LazyPromise.delay(DELAY_TIME);
                expect(event_?.key).toBe("a");
                await unsubscribe();
            });
            test("Should dispatch FoundCacheEvent when key exists", async () => {
                let event_ = null as FoundCacheEvent | null;
                const unsubscribe = await cache.subscribe(
                    CACHE_EVENTS.FOUND,
                    (event) => {
                        event_ = event;
                    },
                );
                await cache.add("a", 1);
                await cache.getOrAdd("a", 1);
                await LazyPromise.delay(DELAY_TIME);
                expect(event_?.key).toBe("a");
                expect(event_?.value).toBe(1);
                await unsubscribe();
            });
            test("Should dispatch AddedCacheEvent when key exists", async () => {
                let event_ = null as AddedCacheEvent | null;
                const unsubscribe = await cache.subscribe(
                    CACHE_EVENTS.WRITTEN,
                    (event) => {
                        if (event.type === "added") {
                            event_ = event;
                        }
                    },
                );
                const ttl = TimeSpan.fromMilliseconds(50);
                await cache.getOrAdd("a", 1, ttl);
                await LazyPromise.delay(DELAY_TIME);
                expect(event_?.key).toBe("a");
                expect(event_?.value).toBe(1);
                expect(event_?.ttl?.toMilliseconds()).toBe(
                    ttl.toMilliseconds(),
                );
                await unsubscribe();
            });
        });
        describe("method: increment", () => {
            test("Should dispatch IncrementedCacheEvent when key exists", async () => {
                let event_ = null as IncrementedCacheEvent | null;
                const unsubscribe = await cache.subscribe(
                    CACHE_EVENTS.WRITTEN,
                    (event) => {
                        if (event.type === "incremented") {
                            event_ = event;
                        }
                    },
                );
                await cache.add("a", 1);
                await cache.increment("a", 1);
                await LazyPromise.delay(DELAY_TIME);
                expect(event_?.key).toBe("a");
                expect(event_?.value).toBe(1);
                await unsubscribe();
            });
            test("Should dispatch NotFoundCacheEvent when key doesnt exists", async () => {
                let event_ = null as NotFoundCacheEvent | null;
                const unsubscribe = await cache.subscribe(
                    CACHE_EVENTS.NOT_FOUND,
                    (event) => {
                        event_ = event;
                    },
                );
                await cache.increment("a", 1);
                await LazyPromise.delay(DELAY_TIME);
                expect(event_?.key).toBe("a");
                await unsubscribe();
            });
        });
        describe("method: decrement", () => {
            test("Should dispatch DecrementedCacheEvent when key exists", async () => {
                let event_ = null as DecrementedCacheEvent | null;
                const unsubscribe = await cache.subscribe(
                    CACHE_EVENTS.WRITTEN,
                    (event) => {
                        if (event.type === "decremented") {
                            event_ = event;
                        }
                    },
                );
                await cache.add("a", 1);
                await cache.decrement("a", 1);
                await LazyPromise.delay(DELAY_TIME);
                expect(event_?.key).toBe("a");
                expect(event_?.value).toBe(1);
                await unsubscribe();
            });
            test("Should dispatch NotFoundCacheEvent when key doesnt exists", async () => {
                let event_ = null as NotFoundCacheEvent | null;
                const unsubscribe = await cache.subscribe(
                    CACHE_EVENTS.NOT_FOUND,
                    (event) => {
                        event_ = event;
                    },
                );
                await cache.decrement("a", 1);
                await LazyPromise.delay(DELAY_TIME);
                expect(event_?.key).toBe("a");
                await unsubscribe();
            });
        });
        describe("method: clear", () => {
            test("Should dispatch ClearedCacheEvent when key doesnt exists", async () => {
                let event_ = null as ClearedCacheEvent | null;
                const unsubscribe = await cache.subscribe(
                    CACHE_EVENTS.CLEARED,
                    (event) => {
                        event_ = event;
                    },
                );
                await cache.add("a", 1);
                await cache.add("b", 2);
                await cache.add("c", 3);
                await cache.clear();
                await LazyPromise.delay(DELAY_TIME);
                await unsubscribe();
                expect(event_).toStrictEqual({});
            });
        });
    });
}
