/**
 * @module Cache
 */

import { Promisable } from "@/_shared/types";
import { delay } from "@/_shared/utilities";
import { Cache } from "@/cache/cache";
import {
    CacheError,
    TypeCacheError,
    type ICache,
    type ICacheAdapter,
} from "@/contracts/cache/_module";
import {
    type TestAPI,
    type SuiteAPI,
    type beforeEach,
    type ExpectStatic,
} from "vitest";

/**
 * @group Utilities
 */
export type CacheApiTestSuite = {
    describe: SuiteAPI;
    expect: ExpectStatic;
    beforeEach: typeof beforeEach;
    test: TestAPI;
    createAdapter: () => Promisable<ICacheAdapter<unknown>>;
};
/**
 * @group Utilities
 */
export function cacheApiTestSuite(settings: CacheApiTestSuite) {
    const { test, expect, describe, beforeEach, createAdapter } = settings;
    let cache: ICache;
    beforeEach(async () => {
        const adapter = await createAdapter();
        cache = new Cache(adapter);
    });
    describe("Api tests", () => {
        describe("method: has", () => {
            test("Should return true when given existing key", async () => {
                await cache.add("a", 1);
                expect(await cache.has("a")).toBe(true);
            });
            test("Should return false when given none existing key", async () => {
                expect(await cache.has("a")).toBe(false);
            });
        });
        describe("method: hasMany", () => {
            test("Should return only true when given existing keys", async () => {
                await cache.addMany({
                    a: {
                        value: 1,
                    },
                    b: {
                        value: 1,
                    },
                    c: {
                        value: 1,
                    },
                });
                expect(await cache.hasMany(["a", "b", "c"])).toEqual({
                    a: true,
                    b: true,
                    c: true,
                });
            });
            test("Should return only false when given none existing keys", async () => {
                expect(await cache.hasMany(["a", "b", "c"])).toEqual({
                    a: false,
                    b: false,
                    c: false,
                });
            });
            test("Should return both false and true when given existing and none existing keys", async () => {
                await cache.addMany({
                    a: {
                        value: 1,
                    },
                    b: {
                        value: 1,
                    },
                });
                expect(await cache.hasMany(["a", "b", "c", "d"])).toEqual({
                    a: true,
                    b: true,
                    c: false,
                    d: false,
                });
            });
        });
        describe("method: get", () => {
            test("Should return the value when given existing key", async () => {
                await cache.add("a", 1);
                expect(await cache.get("a")).toBe(1);
            });
            test("Should return null when given none existing key", async () => {
                expect(await cache.get("a")).toBeNull();
            });
        });
        describe("method: getMany", () => {
            test("Should return only the values when given existing keys", async () => {
                await cache.addMany({
                    a: {
                        value: 1,
                    },
                    b: {
                        value: 1,
                    },
                    c: {
                        value: 1,
                    },
                });
                expect(await cache.getMany(["a", "b", "c"])).toEqual({
                    a: 1,
                    b: 1,
                    c: 1,
                });
            });
            test("Should return only null when given none existing keys", async () => {
                expect(await cache.getMany(["a", "b", "c"])).toEqual({
                    a: null,
                    b: null,
                    c: null,
                });
            });
            test("Should return both the values and null when given existing and none existing keys", async () => {
                await cache.addMany({
                    a: {
                        value: 1,
                    },
                    b: {
                        value: 1,
                    },
                });
                expect(await cache.getMany(["a", "b", "c", "d"])).toEqual({
                    a: 1,
                    b: 1,
                    c: null,
                    d: null,
                });
            });
        });
        describe("method: getOr", () => {
            test("Should return the value when given existing key", async () => {
                await cache.add("a", 1);
                expect(await cache.getOr("a", -1)).toBe(1);
            });
            describe("Should return default value when given none existing key", () => {
                test("Eager default value", async () => {
                    expect(await cache.getOr("a", -1)).toBe(-1);
                });
                test("Lazy default value", async () => {
                    expect(await cache.getOr("a", () => -1)).toBe(-1);
                });
                test("Async lazy default value", async () => {
                    expect(
                        await cache.getOr("a", () => Promise.resolve(-1)),
                    ).toBe(-1);
                });
            });
        });
        describe("method: getOrMany", () => {
            test("Should return only the values when given existing keys", async () => {
                await cache.addMany({
                    a: {
                        value: 1,
                    },
                    b: {
                        value: 1,
                    },
                    c: {
                        value: 1,
                    },
                });
                expect(
                    await cache.getOrMany({
                        a: -1,
                        b: -1,
                        c: -1,
                    }),
                ).toEqual({
                    a: 1,
                    b: 1,
                    c: 1,
                });
            });
            describe("Should return only default values when given none existing keys", () => {
                test("Eager", async () => {
                    expect(
                        await cache.getOrMany({
                            a: -1,
                            b: -1,
                            c: -1,
                        }),
                    ).toEqual({
                        a: -1,
                        b: -1,
                        c: -1,
                    });
                });
                test("Lazy", async () => {
                    expect(
                        await cache.getOrMany({
                            a: () => -1,
                            b: () => -1,
                            c: () => -1,
                        }),
                    ).toEqual({
                        a: -1,
                        b: -1,
                        c: -1,
                    });
                });
                test("Async lazy", async () => {
                    expect(
                        await cache.getOrMany({
                            a: () => Promise.resolve(-1),
                            b: () => Promise.resolve(-1),
                            c: () => Promise.resolve(-1),
                        }),
                    ).toEqual({
                        a: -1,
                        b: -1,
                        c: -1,
                    });
                });
            });
            test("Should return both the values and null when given existing and none existing keys", async () => {
                await cache.addMany({
                    a: {
                        value: 1,
                    },
                    b: {
                        value: 1,
                    },
                });
                expect(
                    await cache.getOrMany({
                        a: -1,
                        b: -1,
                        c: -1,
                        d: -1,
                    }),
                ).toEqual({
                    a: 1,
                    b: 1,
                    c: -1,
                    d: -1,
                });
            });
        });
        describe("method: add", () => {
            test("Should return true when key doesnt exist", async () => {
                expect(await cache.add("a", 1)).toBe(true);
            });
            test("Should return false when key exist", async () => {
                await cache.add("a", 1);
                expect(await cache.add("a", 1)).toBe(false);
            });
            test("Should persist insertion when key doesnt exist", async () => {
                await cache.add("a", 1);
                expect(await cache.get("a")).toBe(1);
            });
            test("Should not persist insertion when key exist", async () => {
                await cache.add("a", 1);
                await cache.add("a", 2);
                expect(await cache.get("a")).toBe(1);
            });
            test("Should remove key after given ttl", async () => {
                await cache.add("a", 1, 20);
                await delay(30);
                expect(await cache.get("a")).toBeNull();
            });
        });
        describe("method: addMany", () => {
            test("Should return only true when given none existing keys", async () => {
                expect(
                    await cache.addMany({
                        a: {
                            value: 1,
                        },
                        b: {
                            value: 1,
                        },
                    }),
                ).toEqual({
                    a: true,
                    b: true,
                });
            });
            test("Should return only false when given existing keys", async () => {
                await cache.addMany({
                    a: {
                        value: 1,
                    },
                    b: {
                        value: 1,
                    },
                });
                expect(
                    await cache.addMany({
                        a: {
                            value: 1,
                        },
                        b: {
                            value: 1,
                        },
                    }),
                ).toEqual({
                    a: false,
                    b: false,
                });
            });
            test("Should return both false and true when given existing and none existing keys", async () => {
                await cache.addMany({
                    c: {
                        value: 1,
                    },
                    d: {
                        value: 1,
                    },
                });
                expect(
                    await cache.addMany({
                        a: {
                            value: 1,
                        },
                        b: {
                            value: 1,
                        },
                        c: {
                            value: 1,
                        },
                        d: {
                            value: 1,
                        },
                    }),
                ).toEqual({
                    a: true,
                    b: true,
                    c: false,
                    d: false,
                });
            });
            test("Should persist insertions for the keys that doesnt exist", async () => {
                await cache.addMany({
                    a: {
                        value: 1,
                    },
                    b: {
                        value: 1,
                    },
                });
                expect(await cache.getMany(["a", "b"])).toEqual({
                    a: 1,
                    b: 1,
                });
            });
            test("Should not persist insertions for the keys that exist", async () => {
                await cache.addMany({
                    a: {
                        value: 1,
                    },
                    b: {
                        value: 1,
                    },
                });
                await cache.addMany({
                    a: {
                        value: 2,
                    },
                    b: {
                        value: 2,
                    },
                });
                expect(await cache.getMany(["a", "b"])).toEqual({
                    a: 1,
                    b: 1,
                });
            });
            test("Should remove keys after given ttl", async () => {
                await cache.addMany({
                    a: {
                        value: 1,
                        ttlInMs: 20,
                    },
                    b: {
                        value: 1,
                        ttlInMs: 20,
                    },
                });
                await delay(30);
                expect(await cache.getMany(["a", "b"])).toEqual({
                    a: null,
                    b: null,
                });
            });
        });
        describe("method: put", () => {
            test("Should return true if key exists", async () => {
                await cache.add("a", 1);
                expect(await cache.put("a", 2)).toBe(true);
            });
            test("Should return false if key doesnt exists", async () => {
                expect(await cache.put("a", 2)).toBe(false);
            });
            test("Should persist insertion when given none existing key", async () => {
                await cache.put("a", 1);
                expect(await cache.get("a")).toBe(1);
            });
            test("Should persist removal when given none existing key and ttl", async () => {
                await cache.put("a", 1, 20);
                await delay(30);
                expect(await cache.get("a")).toBeNull();
            });
            test("Should persist replacement when given existing key", async () => {
                await cache.add("a", 1);
                await cache.put("a", 2);
                expect(await cache.get("a")).toBe(2);
            });
            test("Should change tll when given existing key and ttl", async () => {
                await cache.add("a", 1, 20);
                await cache.put("a", 2, 50);
                await delay(30);
                expect(await cache.get("a")).toBe(2);
                await delay(30);
                expect(await cache.get("a")).toBeNull();
            });
        });
        describe("method: putMany", () => {
            test("Should return only true when given existing keys", async () => {
                await cache.addMany({
                    a: {
                        value: 1,
                    },
                    b: {
                        value: 1,
                    },
                });
                expect(
                    await cache.putMany({
                        a: {
                            value: 2,
                        },
                        b: {
                            value: 2,
                        },
                    }),
                ).toEqual({
                    a: true,
                    b: true,
                });
            });
            test("Should return only false when given none existing keys", async () => {
                expect(
                    await cache.putMany({
                        a: {
                            value: 2,
                        },
                        b: {
                            value: 2,
                        },
                    }),
                ).toEqual({
                    a: false,
                    b: false,
                });
            });
            test("Should return both false and true when given existing and none existing keys", async () => {
                await cache.addMany({
                    a: {
                        value: 1,
                    },
                    b: {
                        value: 1,
                    },
                });
                expect(
                    await cache.putMany({
                        a: {
                            value: 2,
                        },
                        b: {
                            value: 2,
                        },
                        c: {
                            value: 2,
                        },
                        d: {
                            value: 2,
                        },
                    }),
                ).toEqual({
                    a: true,
                    b: true,
                    c: false,
                    d: false,
                });
            });
            test("Should persist insertions when given none existing keys", async () => {
                await cache.putMany({
                    a: {
                        value: 2,
                    },
                    b: {
                        value: 2,
                    },
                });
                expect(await cache.getMany(["a", "b"])).toEqual({
                    a: 2,
                    b: 2,
                });
            });
            test("Should persist removals when given none existing keys and ttl", async () => {
                await cache.putMany({
                    a: {
                        value: 2,
                        ttlInMs: 20,
                    },
                    b: {
                        value: 2,
                        ttlInMs: 20,
                    },
                });
                await delay(30);
                expect(await cache.getMany(["a", "b"])).toEqual({
                    a: null,
                    b: null,
                });
            });
            test("Should persist replacement when given existing keys", async () => {
                await cache.addMany({
                    a: {
                        value: 1,
                    },
                    b: {
                        value: 1,
                    },
                });
                await cache.putMany({
                    a: {
                        value: 2,
                    },
                    b: {
                        value: 2,
                    },
                });
                expect(await cache.getMany(["a", "b"])).toEqual({
                    a: 2,
                    b: 2,
                });
            });
            test("Should change tll when given existing keys and ttl", async () => {
                await cache.addMany({
                    a: {
                        value: 1,
                        ttlInMs: 20,
                    },
                    b: {
                        value: 1,
                        ttlInMs: 20,
                    },
                });
                await cache.putMany({
                    a: {
                        value: 2,
                        ttlInMs: 50,
                    },
                    b: {
                        value: 2,
                        ttlInMs: 50,
                    },
                });
                await delay(30);
                expect(await cache.getMany(["a", "b"])).toEqual({
                    a: 2,
                    b: 2,
                });
                await delay(30);
                expect(await cache.getMany(["a", "b"])).toEqual({
                    a: null,
                    b: null,
                });
            });
        });
        describe("method: remove", () => {
            test("Should return true when key exists", async () => {
                await cache.add("a", 1);
                expect(await cache.remove("a")).toBe(true);
            });
            test("Should return false when key doesnt exists", async () => {
                expect(await cache.remove("a")).toBe(false);
            });
            test("Should presist removal when given existing key", async () => {
                await cache.add("a", 1);
                await cache.remove("a");
                expect(await cache.get("a")).toBeNull();
            });
        });
        describe("method: removeMany", () => {
            test("Should return only true when given existing keys", async () => {
                await cache.addMany({
                    a: {
                        value: 1,
                    },
                    b: {
                        value: 1,
                    },
                });
                expect(await cache.removeMany(["a", "b"])).toEqual({
                    a: true,
                    b: true,
                });
            });
            test("Should return only false when given none existing keys", async () => {
                expect(await cache.removeMany(["a", "b"])).toEqual({
                    a: false,
                    b: false,
                });
            });
            test("Should return both false and true when given existing and none existing keys", async () => {
                await cache.addMany({
                    a: {
                        value: 1,
                    },
                    b: {
                        value: 1,
                    },
                });
                expect(await cache.removeMany(["a", "b", "c", "d"])).toEqual({
                    a: true,
                    b: true,
                    c: false,
                    d: false,
                });
            });
            test("Should perist removal when given existing keys", async () => {
                await cache.addMany({
                    a: {
                        value: 1,
                    },
                    b: {
                        value: 1,
                    },
                });
                await cache.removeMany(["a", "b"]);
                expect(await cache.getMany(["a", "b"])).toEqual({
                    a: null,
                    b: null,
                });
            });
        });
        describe("method: getAndRemove", () => {
            test("Should return the value when key exists", async () => {
                await cache.add("a", 1);
                expect(await cache.getAndRemove("a")).toBe(1);
            });
            test("Should perist key removal when key exists", async () => {
                await cache.add("a", 1);
                await cache.getAndRemove("a");
                expect(await cache.get("a")).toBeNull();
            });
            test("Should return null when key doesnt exists", async () => {
                expect(await cache.getAndRemove("a")).toBeNull();
            });
        });
        describe("method: getOrAdd", () => {
            test("Should return the value when key exists", async () => {
                await cache.add("a", 1);
                expect(await cache.getOrAdd("a", -1)).toBe(1);
            });
            test("Should persist insertion value when key doesnt exists", async () => {
                await cache.getOrAdd("a", -1);
                expect(await cache.get("a")).toBe(-1);
            });
            describe("Should return insert value when key doesnt exists", () => {
                test("Eager insert value", async () => {
                    expect(await cache.getOrAdd("a", -1)).toBe(-1);
                });
                test("Lazy insert value", async () => {
                    expect(await cache.getOrAdd("a", () => -1)).toBe(-1);
                });
                test("Async lazy insert value", async () => {
                    expect(
                        await cache.getOrAdd("a", () => Promise.resolve(-1)),
                    ).toBe(-1);
                });
            });
            test("Should remove key when inserting and given ttl", async () => {
                await cache.getOrAdd("a", -1, 20);
                await delay(30);
                expect(await cache.get("a")).toBe(null);
            });
        });
        describe("method: increment", () => {
            test("Should return true if key exists", async () => {
                await cache.add("a", 0);
                expect(await cache.increment("a", 1)).toBe(true);
            });
            test("Should return false if key doesnt exists", async () => {
                expect(await cache.increment("a", 1)).toBe(false);
            });
            test("Should increment if key exists", async () => {
                await cache.add("a", 1);
                await cache.increment("a", 1);
                expect(await cache.get("a")).toBe(2);
            });
            test("Should do nothing when key doesn't exists", async () => {
                await cache.increment("a", 1);
                expect(await cache.get("a")).toBeNull();
            });
            test("Should throw CacheError when given none number type key", async () => {
                await cache.add("a", "abra");
                await expect(cache.increment("a", 1)).rejects.toBeInstanceOf(
                    CacheError,
                );
            });
            test("Should throw TypeCacheError when given none number type key", async () => {
                await cache.add("a", "abra");
                await expect(cache.increment("a", 1)).rejects.toBeInstanceOf(
                    TypeCacheError,
                );
            });
        });
        describe("method: decrement", () => {
            test("Should return true if key exists", async () => {
                await cache.add("a", 0);
                expect(await cache.decrement("a", 1)).toBe(true);
            });
            test("Should return false if key doesnt exists", async () => {
                expect(await cache.decrement("a", 1)).toBe(false);
            });
            test("Should decrement if key exists", async () => {
                await cache.add("a", 1);
                await cache.decrement("a", 1);
                expect(await cache.get("a")).toBe(0);
            });
            test("Should do nothing when key doesn't exists", async () => {
                await cache.decrement("a", 1);
                expect(await cache.get("a")).toBeNull();
            });
            test("Should throw CacheError when given none number type key", async () => {
                await cache.add("a", "abra");
                await expect(cache.decrement("a", 1)).rejects.toBeInstanceOf(
                    CacheError,
                );
            });
            test("Should throw TypeCacheError when given none number type key", async () => {
                await cache.add("a", "abra");
                await expect(cache.decrement("a", 1)).rejects.toBeInstanceOf(
                    TypeCacheError,
                );
            });
        });
        describe("method: clear", () => {
            test("Should remove all keys", async () => {
                await cache.addMany({
                    a: {
                        value: 1,
                    },
                    b: {
                        value: 1,
                    },
                    c: {
                        value: 1,
                    },
                    d: {
                        value: 1,
                    },
                });
                await cache.clear();
                expect(await cache.getMany(["a", "b", "c", "d"])).toEqual({
                    a: null,
                    b: null,
                    c: null,
                    d: null,
                });
            });
        });
    });
}
