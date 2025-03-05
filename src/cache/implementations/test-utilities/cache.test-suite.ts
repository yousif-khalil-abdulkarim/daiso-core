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
    type IGroupableCache,
    type ICache,
    KeyNotFoundCacheError,
    KeyNotFoundCacheEvent,
    KeyAddedCacheEvent,
    KeyDecrementedCacheEvent,
    KeyFoundCacheEvent,
    KeyIncrementedCacheEvent,
    KeyRemovedCacheEvent,
    KeysClearedCacheEvent,
    KeyUpdatedCacheEvent,
} from "@/cache/contracts/_module-exports.js";
import { type Promisable } from "@/utilities/_module-exports.js";
import { TimeSpan } from "@/utilities/_module-exports.js";
import { delay, LazyPromise } from "@/async/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/implementations/test-utilities"```
 * @group Test utilities
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
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/implementations/test-utilities"```
 * @group Test utilities
 * @example
 * ```ts
 * import { beforeEach, describe, expect, test } from "vitest";
 * import { cacheTestSuite } from "@daiso-tech/core/cache/implementations/test-utilities";
 * import { MemoryCacheAdapter } from "@daiso-tech/core/cache/implementations/adapters";
 * import { Cache } from "@daiso-tech/core/cache/implementations/derivables";
 * import { KeyPrefixer } from "@daiso-tech/core/utilities";
 *
 * describe("class: Cache", () => {
 *     cacheTestSuite({
 *       createCache: () =>
 *           new Cache({
 *               keyPrefixer: new KeyPrefixer("cache"),
 *               adapter: new MemoryCacheAdapter(),
 *           }),
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
    let cacheA: ICache<any>;
    let cacheB: ICache<any>;
    beforeEach(async () => {
        const cache = await createCache();
        cacheA = cache;
        cacheB = cache.withGroup("b");
    });

    const TTL = TimeSpan.fromMilliseconds(50);
    const DELAY_TIME = TimeSpan.fromMilliseconds(50);
    describe("Api tests:", () => {
        describe("method: exists", () => {
            test("Should return true when key exists", async () => {
                await cacheA.add("a", 1, null);
                await delay(TTL.divide(4));
                expect(await cacheA.exists("a")).toBe(true);
            });
            test("Should return false when keys doesnt exists", async () => {
                expect(await cacheA.exists("a")).toBe(false);
            });
            test("Should return false when key is experied", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL.addTimeSpan(TTL.divide(4)));
                expect(await cacheA.exists("a")).toBe(false);
            });
        });
        describe("method: missing", () => {
            test("Should return false when key exists", async () => {
                await cacheA.add("a", 1, null);
                await delay(TTL.divide(4));
                expect(await cacheA.missing("a")).toBe(false);
            });
            test("Should return true when keys doesnt exists", async () => {
                expect(await cacheA.missing("a")).toBe(true);
            });
            test("Should return true when key is experied", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL.addTimeSpan(TTL.divide(4)));
                expect(await cacheA.missing("a")).toBe(true);
            });
        });
        describe("method: get", () => {
            test("Should return the value when key exists", async () => {
                await cacheA.add("a", 1, null);
                await delay(TTL.divide(4));
                expect(await cacheA.get("a")).toBe(1);
            });
            test("Should return null when keys doesnt exists", async () => {
                expect(await cacheA.get("a")).toBeNull();
            });
            test("Should return null when key is experied", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL.addTimeSpan(TTL.divide(4)));
                expect(await cacheA.get("a")).toBeNull();
            });
        });
        describe("method: getOrFail", () => {
            test("Should return the value when key exists", async () => {
                await cacheA.add("a", 1, null);
                await delay(TTL.divide(4));
                expect(await cacheA.getOrFail("a")).toBe(1);
            });
            test("Should throw an KeyNotFoundCacheError when keys doesnt exists", async () => {
                await expect(cacheA.getOrFail("a")).rejects.toBeInstanceOf(
                    KeyNotFoundCacheError,
                );
            });
            test("Should throw an KeyNotFoundCacheError when key is experied", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL.addTimeSpan(TTL.divide(4)));
                await expect(cacheA.getOrFail("a")).rejects.toBeInstanceOf(
                    KeyNotFoundCacheError,
                );
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
        describe("method: getAndRemove", () => {
            test("Should return value when key exists", async () => {
                await cacheA.add("a", 1, null);
                await delay(TTL.divide(4));
                expect(await cacheA.getAndRemove("a")).toBe(1);
            });
            test("Should return null when key doesnt exists", async () => {
                expect(await cacheA.getAndRemove("a")).toBeNull();
            });
            test("Should return null when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL.addTimeSpan(TTL.divide(4)));
                expect(await cacheA.getAndRemove("a")).toBeNull();
            });
            test("Should persist removal when key exists", async () => {
                await cacheA.add("a", 1, null);
                await delay(TTL.divide(4));
                await cacheA.getAndRemove("a");
                await delay(TTL.divide(4));
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
        describe("method: add", () => {
            test("Should return true when key doesnt exists", async () => {
                const result = await cacheA.add("a", 1, null);
                await delay(TTL.divide(4));
                expect(result).toBe(true);
            });
            test("Should return true when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL.addTimeSpan(TTL.divide(4)));
                expect(await cacheA.add("a", 1, null)).toBe(true);
            });
            test("Should persist values when key doesnt exist", async () => {
                await cacheA.add("a", 1, null);
                await delay(TTL.divide(4));
                expect(await cacheA.get("a")).toBe(1);
            });
            test("Should persist values when key is expired", async () => {
                await cacheA.add("a", -1, TTL);
                await delay(TTL.addTimeSpan(TTL.divide(4)));
                await cacheA.add("a", 1, null);
                expect(await cacheA.get("a")).toBe(1);
            });
            test("Should return false when key exists", async () => {
                await cacheA.add("a", 1, null);
                await delay(TTL.divide(4));
                expect(await cacheA.add("a", 1, null)).toBe(false);
            });
            test("Should not persist value when key exist", async () => {
                await cacheA.add("a", 1, null);
                await delay(TTL.divide(4));
                await cacheA.add("a", 2, null);
                await delay(TTL.divide(4));
                expect(await cacheA.get("a")).toBe(1);
            });
        });
        describe("method: put", () => {
            test("Should return true when key exists", async () => {
                await cacheA.add("a", 1, null);
                await delay(TTL.divide(4));
                expect(await cacheA.put("a", -1, null)).toBe(true);
            });
            test("Should persist value when key exist", async () => {
                await cacheA.add("a", 1, null);
                await delay(TTL.divide(4));
                await cacheA.put("a", -1, null);
                await delay(TTL.divide(4));
                expect(await cacheA.get("a")).toBe(-1);
            });
            test("Should return false when key doesnt exists", async () => {
                expect(await cacheA.put("a", -1, null)).toBe(false);
            });
            test("Should return false when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL.addTimeSpan(TTL.divide(4)));
                expect(await cacheA.put("a", -1, null)).toBe(false);
            });
            test("Should persist values when key doesnt exist", async () => {
                await cacheA.put("a", -1, null);
                await delay(TTL.divide(4));
                expect(await cacheA.get("a")).toBe(-1);
            });
            test("Should persist values when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL.addTimeSpan(TTL.divide(4)));
                await cacheA.put("a", -1, null);
                await delay(TTL.divide(4));
                expect(await cacheA.get("a")).toBe(-1);
            });
            test("Should replace the ttl value", async () => {
                const ttlA = TimeSpan.fromMilliseconds(100);
                await cacheA.add("a", 1, ttlA);
                await delay(TTL.divide(4));
                const ttlB = TimeSpan.fromMilliseconds(50);
                await cacheA.put("a", -1, ttlB);
                await delay(ttlB);
                expect(await cacheA.get("a")).toBeNull();
            });
        });
        describe("method: update", () => {
            test("Should return true when key exists", async () => {
                await cacheA.add("a", 1, null);
                await delay(TTL.divide(4));
                expect(await cacheA.update("a", -1)).toBe(true);
            });
            test("Should persist value when key exist", async () => {
                await cacheA.add("a", 1, null);
                await delay(TTL.divide(4));
                await cacheA.update("a", -1);
                await delay(TTL.divide(4));
                expect(await cacheA.get("a")).toBe(-1);
            });
            test("Should return false when key doesnt exists", async () => {
                expect(await cacheA.update("a", -1)).toBe(false);
            });
            test("Should return false when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL.addTimeSpan(TTL.divide(4)));
                expect(await cacheA.update("a", -1)).toBe(false);
            });
            test("Should not persist value when key doesnt exist", async () => {
                await cacheA.update("a", -1);
                await delay(TTL.divide(4));
                expect(await cacheA.get("a")).toBeNull();
            });
            test("Should not persist value when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL.addTimeSpan(TTL.divide(4)));
                await cacheA.update("a", -1);
                expect(await cacheA.get("a")).toBeNull();
            });
        });
        describe("method: increment", () => {
            test("Should return true when key exists", async () => {
                await cacheA.add("a", 1, null);
                await delay(TTL.divide(4));
                expect(await cacheA.increment("a", 1)).toBe(true);
            });
            test("Should persist increment when key exists", async () => {
                await cacheA.add("a", 1, null);
                await delay(TTL.divide(4));
                await cacheA.increment("a", 1);
                await delay(TTL.divide(4));
                expect(await cacheA.get("a")).toBe(2);
            });
            test("Should return false when key doesnt exists", async () => {
                expect(await cacheA.increment("a", 1)).toBe(false);
            });
            test("Should return false when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL.addTimeSpan(TTL.divide(4)));
                expect(await cacheA.increment("a", 1)).toBe(false);
            });
            test("Should not persist increment when key doesnt exists", async () => {
                await cacheA.increment("a", 1);
                await delay(TTL.divide(4));
                expect(await cacheA.get("a")).toBeNull();
            });
            test("Should not persist increment when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL.addTimeSpan(TTL.divide(4)));
                await cacheA.increment("a", 1);
                expect(await cacheA.get("a")).toBeNull();
            });
            test("Should throw TypeCacheError key value is not number type", async () => {
                await cacheA.add("a", "str", null);
                await delay(TTL.divide(4));
                await expect(cacheA.increment("a", 1)).rejects.toBeInstanceOf(
                    TypeCacheError,
                );
            });
        });
        describe("method: decrement", () => {
            test("Should return true when key exists", async () => {
                await cacheA.add("a", 1, null);
                await delay(TTL.divide(4));
                expect(await cacheA.decrement("a", 1)).toBe(true);
            });
            test("Should persist decrement when key exists", async () => {
                await cacheA.add("a", 1, null);
                await delay(TTL.divide(4));
                await cacheA.decrement("a", 1);
                await delay(TTL.divide(4));
                expect(await cacheA.get("a")).toBe(0);
            });
            test("Should return false when key doesnt exists", async () => {
                expect(await cacheA.decrement("a", 1)).toBe(false);
            });
            test("Should return false when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL.addTimeSpan(TTL.divide(4)));
                expect(await cacheA.decrement("a", 1)).toBe(false);
            });
            test("Should not persist decrement when key doesnt exists", async () => {
                await cacheA.decrement("a", 1);
                await delay(TTL.divide(4));
                expect(await cacheA.get("a")).toBeNull();
            });
            test("Should not persist decrement when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL.addTimeSpan(TTL.divide(4)));
                await cacheA.decrement("a", 1);
                expect(await cacheA.get("a")).toBeNull();
            });
            test("Should throw TypeCacheError key value is not number type", async () => {
                await cacheA.add("a", "str", null);
                await delay(TTL.divide(4));
                await expect(cacheA.decrement("a", 1)).rejects.toBeInstanceOf(
                    TypeCacheError,
                );
            });
        });
        describe("method: remove", () => {
            test("Should return true when key exists", async () => {
                await cacheA.add("a", 1, null);
                await delay(TTL.divide(4));

                const result = await cacheA.remove("a");

                expect(result).toBe(true);
            });
            test("Should persist the key removal when key exists", async () => {
                await cacheA.add("a", 1, null);
                await delay(TTL.divide(4));

                await cacheA.remove("a");
                await delay(TTL.divide(4));

                expect(await cacheA.get("a")).toEqual(null);
            });
        });
        describe("method: removeMany", () => {
            test("Should return true when one key exists", async () => {
                await cacheA.add("a", 1, null);
                await delay(TTL.divide(4));

                const result = await cacheA.removeMany(["a", "b", "c"]);

                expect(result).toBe(true);
            });
            test("Should persist removal of the keys that exists", async () => {
                await cacheA.add("a", 1, null);
                await cacheA.add("b", 2, null);
                await cacheA.add("c", 3, null);
                await delay(TTL.divide(4));

                await cacheA.removeMany(["a", "b"]);
                await delay(TTL.divide(4));

                const result = [
                    await cacheA.get("a"),
                    await cacheA.get("b"),
                    await cacheA.get("c"),
                ];
                expect(result).toEqual([null, null, 3]);
            });
        });
        describe("method: clear", () => {
            test("Should remove all keys", async () => {
                await cacheA.add("a", 1);
                await cacheA.add("b", 2);
                await cacheA.add("c", 3);
                await cacheA.add("d", 4);
                await cacheA.clear();
                const result = [
                    await cacheA.get("a"),
                    await cacheA.get("b"),
                    await cacheA.get("c"),
                    await cacheA.get("d"),
                ];
                expect(result).toStrictEqual([null, null, null, null]);
            });
        });
    });
    describe("Event tests:", () => {
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
                await delay(DELAY_TIME);
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
                await delay(DELAY_TIME);
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
                await delay(DELAY_TIME);
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
                await delay(DELAY_TIME);
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
                await delay(DELAY_TIME);
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
                await delay(DELAY_TIME);
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
                await delay(DELAY_TIME);
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
                await delay(DELAY_TIME);
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
                await delay(DELAY_TIME);
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
                await delay(DELAY_TIME);
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
                await delay(DELAY_TIME);
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
                await delay(DELAY_TIME);
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
                await delay(DELAY_TIME);
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
                await delay(DELAY_TIME);
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
                await delay(DELAY_TIME);
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
                await delay(DELAY_TIME);
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
                await delay(DELAY_TIME);
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
                await delay(DELAY_TIME);
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
                await delay(DELAY_TIME);
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
                await delay(DELAY_TIME);
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
                await delay(DELAY_TIME);
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
                await delay(DELAY_TIME);
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
                await delay(DELAY_TIME);
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
                await delay(DELAY_TIME);
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
                await delay(DELAY_TIME);
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
                await delay(DELAY_TIME);
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
                await delay(DELAY_TIME);
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
                await delay(DELAY_TIME);
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
                await delay(DELAY_TIME);
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
                await cacheA.add("a", 1);
                await cacheA.add("b", 2);
                await cacheA.add("c", 3);
                await cacheA.clear();
                await delay(DELAY_TIME);
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
        test("method: missing", async () => {
            await cacheA.put("a", 1);
            expect(await cacheA.missing("a")).toBe(false);
            expect(await cacheB.missing("a")).toBe(true);
        });
        test("method: get", async () => {
            await cacheA.put("a", 1);
            expect(await cacheA.get("a")).toBe(1);
            expect(await cacheB.get("a")).toBeNull();
        });
        test("method: getOr", async () => {
            await cacheA.put("a", 1);
            expect(await cacheA.getOr("a", -1)).toBe(1);
            expect(await cacheB.getOr("a", -1)).toBe(-1);
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
        test("method: update", async () => {
            await cacheA.add("a", 1);
            await cacheB.add("a", 1);
            await cacheA.update("a", 2);
            await cacheB.update("a", 3);
            expect(await cacheA.get("a")).toBe(2);
            expect(await cacheB.get("a")).toBe(3);
        });
        test("method: put", async () => {
            await cacheA.put("a", 2);
            await cacheB.put("a", 3);
            expect(await cacheA.get("a")).toBe(2);
            expect(await cacheB.get("a")).toBe(3);
        });
        test("method: remove", async () => {
            await cacheA.add("a", 1);
            await cacheB.add("a", 1);
            await cacheA.remove("a");
            expect(await cacheA.get("a")).toBeNull();
            expect(await cacheB.get("a")).toBe(1);
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
            await cacheA.add("a", 1);
            await cacheA.add("b", 2);
            await cacheB.add("a", 3);
            await cacheB.add("b", 4);
            await cacheA.clear();
            const resultA = [
                await cacheA.get("a"),
                await cacheA.get("b"),
                await cacheB.get("a"),
                await cacheB.get("b"),
            ];
            expect(resultA).toEqual([null, null, 3, 4]);
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
            await delay(DELAY_TIME);

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
            await delay(DELAY_TIME);

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
            await delay(DELAY_TIME);

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
            await delay(DELAY_TIME);

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
            await delay(DELAY_TIME);

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
            await delay(DELAY_TIME);

            expect(result_a).toBeInstanceOf(KeyAddedCacheEvent);
            expect(result_b).toBeNull();
        });
    });
}
