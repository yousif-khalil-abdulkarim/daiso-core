/**
 * @module Storage
 */

import {
    type TestAPI,
    type SuiteAPI,
    type ExpectStatic,
    type beforeEach,
} from "vitest";
import {
    type IStorageAdapter,
    TypeStorageError,
    type IStorage,
    KeyNotFoundStorageError,
} from "@/storage/contracts/_module";
import { type Promisable } from "@/_shared/types";
import { Storage } from "@/storage/implementations/_module";

/**
 * @internal
 */
export type StorageApiTestSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createAdapter: () => Promisable<IStorageAdapter<unknown>>;
};
/**
 * @internal
 */
export function storageApiTestSuite(
    settings: StorageApiTestSuiteSettings,
): void {
    const { expect, test, createAdapter, describe, beforeEach } = settings;
    let storage: IStorage;
    beforeEach(async () => {
        storage = new Storage(await createAdapter());
    });

    describe("Api tests:", () => {
        describe("method: exists", () => {
            test("Should return true when key exists", async () => {
                await storage.add("a", 1);
                expect(await storage.exists("a")).toBe(true);
            });
            test("Should return false when key doesnt exists", async () => {
                expect(await storage.exists("a")).toBe(false);
            });
        });
        describe("method: existsMany", () => {
            test("Should return only true when all keys exists", async () => {
                await storage.addMany({
                    a: 1,
                    b: 1,
                });
                expect(await storage.existsMany(["a", "b"])).toEqual({
                    a: true,
                    b: true,
                });
            });
            test("Should return only false when all keys doesnt exists", async () => {
                expect(await storage.existsMany(["a", "b"])).toEqual({
                    a: false,
                    b: false,
                });
            });
            test("Should return true and false when some keys exists", async () => {
                await storage.add("a", 1);
                expect(await storage.existsMany(["a", "b"])).toEqual({
                    a: true,
                    b: false,
                });
            });
        });
        describe("method: missing", () => {
            test("Should return false when key exists", async () => {
                await storage.add("a", 1);
                expect(await storage.missing("a")).toBe(false);
            });
            test("Should return true when key doesnt exists", async () => {
                expect(await storage.missing("a")).toBe(true);
            });
        });
        describe("method: missingMany", () => {
            test("Should return only false when all keys exists", async () => {
                await storage.addMany({
                    a: 1,
                    b: 1,
                });
                expect(await storage.missingMany(["a", "b"])).toEqual({
                    a: false,
                    b: false,
                });
            });
            test("Should return only true when all keys doesnt exists", async () => {
                expect(await storage.missingMany(["a", "b"])).toEqual({
                    a: true,
                    b: true,
                });
            });
            test("Should return true and false when some keys exists", async () => {
                await storage.add("a", 1);
                expect(await storage.missingMany(["a", "b"])).toEqual({
                    a: false,
                    b: true,
                });
            });
        });
        describe("method: get", () => {
            test("Should return value when key exists", async () => {
                await storage.add("a", 1);
                expect(await storage.get("a")).toBe(1);
            });
            test("Should return null when key doesnt exists", async () => {
                expect(await storage.get("a")).toBeNull();
            });
        });
        describe("method: getMany", () => {
            test("Should return only values when all keys exists", async () => {
                await storage.addMany({
                    a: 1,
                    b: 1,
                });
                expect(await storage.getMany(["a", "b"])).toEqual({
                    a: 1,
                    b: 1,
                });
            });
            test("Should return only null when all keys doesnt exists", async () => {
                expect(await storage.getMany(["a", "b"])).toEqual({
                    a: null,
                    b: null,
                });
            });
            test("Should return values and null when some keys exists", async () => {
                await storage.add("a", 1);
                expect(await storage.getMany(["a", "b"])).toEqual({
                    a: 1,
                    b: null,
                });
            });
        });
        describe("method: getOr", () => {
            test("Should return value when key exists", async () => {
                await storage.add("a", 1);
                expect(await storage.getOr("a", -1)).toBe(1);
            });
            describe("Should return default value when key doesnt exists", () => {
                test("Eager", async () => {
                    expect(await storage.getOr("a", -1)).toBe(-1);
                });
                test("Lazy", async () => {
                    expect(await storage.getOr("a", () => -1)).toBe(-1);
                });
                test("Async lazy", async () => {
                    expect(
                        await storage.getOr("a", () => Promise.resolve(-1)),
                    ).toBe(-1);
                });
            });
        });
        describe("method: getOrFail", () => {
            test("Should return value when key exists", async () => {
                await storage.add("a", 1);
                expect(await storage.getOrFail("a")).toBe(1);
            });
            test("Should throw KeyNotFoundStorageError value when key doesnt exists", async () => {
                await expect(storage.getOrFail("a")).rejects.toBeInstanceOf(
                    KeyNotFoundStorageError,
                );
            });
        });
        describe("method: getOrMany", () => {
            test("Should return only values when all keys exists", async () => {
                await storage.addMany({
                    a: 1,
                    b: 1,
                });
                expect(await storage.getOrMany({ a: -1, b: -1 })).toEqual({
                    a: 1,
                    b: 1,
                });
            });
            describe("Should return only default values when all keys doesnt exists", () => {
                test("Eager", async () => {
                    expect(await storage.getOrMany({ a: -1, b: -1 })).toEqual({
                        a: -1,
                        b: -1,
                    });
                });
                test("Lazy", async () => {
                    expect(
                        await storage.getOrMany({ a: () => -1, b: () => -1 }),
                    ).toEqual({
                        a: -1,
                        b: -1,
                    });
                });
                test("Async lazy", async () => {
                    expect(
                        await storage.getOrMany({
                            a: () => Promise.resolve(-1),
                            b: () => Promise.resolve(-1),
                        }),
                    ).toEqual({
                        a: -1,
                        b: -1,
                    });
                });
            });
            test("Should return values and default values when some keys exists", async () => {
                await storage.add("a", 1);
                expect(await storage.getOrMany({ a: -1, b: -1 })).toEqual({
                    a: 1,
                    b: -1,
                });
            });
        });
        describe("method: add", () => {
            test("Should return true when key doesnt exist", async () => {
                expect(await storage.add("a", 1)).toBe(true);
            });
            test("Should persist value when key doesnt exist", async () => {
                await storage.add("a", 1);
                expect(await storage.get("a")).toBe(1);
            });
            test("Should return false when key exist", async () => {
                await storage.add("a", 1);
                expect(await storage.add("a", 1)).toBe(false);
            });
            test("Should not persist value when key exist", async () => {
                await storage.add("a", 1);
                await storage.add("a", 2);
                expect(await storage.get("a")).toBe(1);
            });
        });
        describe("method: addMany", () => {
            test("Should return only true when all keys doesnt exists", async () => {
                expect(
                    await storage.addMany({
                        a: 1,
                        b: 1,
                    }),
                ).toEqual({
                    a: true,
                    b: true,
                });
            });
            test("Should persist values when all keys doesnt exist", async () => {
                await storage.addMany({
                    a: 1,
                    b: 1,
                });
                expect(await storage.getMany(["a", "b"])).toEqual({
                    a: 1,
                    b: 1,
                });
            });
            test("Should return only false when all keys exists", async () => {
                await storage.addMany({
                    a: 1,
                    b: 1,
                });
                expect(
                    await storage.addMany({
                        a: 1,
                        b: 1,
                    }),
                ).toEqual({
                    a: false,
                    b: false,
                });
            });
            test("Should not persist values when key exist", async () => {
                await storage.addMany({
                    a: 1,
                    b: 1,
                });
                await storage.addMany({
                    a: 2,
                    b: 2,
                });
                expect(await storage.getMany(["a", "b"])).toEqual({
                    a: 1,
                    b: 1,
                });
            });
            test("Should return true and false when some keys exists", async () => {
                await storage.add("a", 1);
                expect(
                    await storage.addMany({
                        a: 1,
                        b: 1,
                    }),
                ).toEqual({
                    a: false,
                    b: true,
                });
            });
            test("Should persist and not persist values when some keys exists", async () => {
                await storage.addMany({
                    a: 1,
                });
                await storage.addMany({
                    a: 2,
                    b: 2,
                });
                expect(await storage.getMany(["a", "b"])).toEqual({
                    a: 1,
                    b: 2,
                });
            });
        });
        describe("method: update", () => {
            test("Should return true when key exists", async () => {
                await storage.add("a", 1);
                expect(await storage.update("a", -1)).toBe(true);
            });
            test("Should persist update when key exists", async () => {
                await storage.add("a", 1);
                await storage.update("a", -1);
                expect(await storage.get("a")).toBe(-1);
            });
            test("Should return false when key doesnt exists", async () => {
                expect(await storage.update("a", -1)).toBe(false);
            });
            test("Should not persist update when key doesnt exists", async () => {
                await storage.update("a", -1);
                expect(await storage.get("a")).toBeNull();
            });
        });
        describe("method: updateMany", () => {
            test("Should return only true when all keys exists", async () => {
                await storage.addMany({
                    a: 1,
                    b: 1,
                });
                expect(await storage.updateMany({ a: -1, b: -1 })).toEqual({
                    a: true,
                    b: true,
                });
            });
            test("Should persist values when all keys exist", async () => {
                await storage.addMany({
                    a: 1,
                    b: 1,
                });
                await storage.updateMany({ a: -1, b: -1 });
                expect(await storage.getMany(["a", "b"])).toEqual({
                    a: -1,
                    b: -1,
                });
            });
            test("Should return only false when all keys doesnt exists", async () => {
                expect(await storage.updateMany({ a: -1, b: -1 })).toEqual({
                    a: false,
                    b: false,
                });
            });
            test("Should not persist values when all keys doesnt exist", async () => {
                await storage.updateMany({ a: -1, b: -1 });
                expect(await storage.getMany(["a", "b"])).toEqual({
                    a: null,
                    b: null,
                });
            });
            test("Should return true and false when some keys exists", async () => {
                await storage.add("a", 1);
                expect(await storage.updateMany({ a: -1, b: -1 })).toEqual({
                    a: true,
                    b: false,
                });
            });
            test("Should persist and not persist values when some keys exists", async () => {
                await storage.add("a", 1);
                await storage.updateMany({ a: -1, b: -1 });
                expect(await storage.getMany(["a", "b"])).toEqual({
                    a: -1,
                    b: null,
                });
            });
        });
        describe("method: put", () => {
            test("Should return true when key exists", async () => {
                await storage.add("a", 1);
                expect(await storage.put("a", -1)).toBe(true);
            });
            test("Should persist update when key exists", async () => {
                await storage.add("a", 1);
                await storage.put("a", -1);
                expect(await storage.get("a")).toBe(-1);
            });
            test("Should return false when key doesnt exists", async () => {
                expect(await storage.put("a", -1)).toBe(false);
            });
            test("Should persist insertion when key doesnt exists", async () => {
                await storage.put("a", -1);
                expect(await storage.get("a")).toBe(-1);
            });
        });
        describe("method: putMany", () => {
            test("Should return only true when all keys exists", async () => {
                await storage.addMany({
                    a: 1,
                    b: 1,
                });
                expect(await storage.putMany({ a: -1, b: -1 })).toEqual({
                    a: true,
                    b: true,
                });
            });
            test("Should persist values when all keys exist", async () => {
                await storage.addMany({
                    a: 1,
                    b: 1,
                });
                await storage.putMany({ a: -1, b: -1 });
                expect(await storage.getMany(["a", "b"])).toEqual({
                    a: -1,
                    b: -1,
                });
            });
            test("Should return only false when all keys doesnt exists", async () => {
                expect(await storage.putMany({ a: -1, b: -1 })).toEqual({
                    a: false,
                    b: false,
                });
            });
            test("Should persist values when all keys doesnt exist", async () => {
                await storage.putMany({ a: -1, b: -1 });
                expect(await storage.getMany(["a", "b"])).toEqual({
                    a: -1,
                    b: -1,
                });
            });
            test("Should return true and false when some keys exists", async () => {
                await storage.add("a", 1);
                expect(await storage.putMany({ a: -1, b: -1 })).toEqual({
                    a: true,
                    b: false,
                });
            });
            test("Should persist all values when some keys exists", async () => {
                await storage.add("a", 1);
                await storage.putMany({ a: -1, b: -1 });
                expect(await storage.getMany(["a", "b"])).toEqual({
                    a: -1,
                    b: -1,
                });
            });
        });
        describe("method: remove", () => {
            test("Should return true when key exists", async () => {
                await storage.add("a", 1);
                expect(await storage.remove("a")).toBe(true);
            });
            test("Should persist removal when key exists", async () => {
                await storage.add("a", 1);
                await storage.remove("a");
                expect(await storage.get("a")).toBeNull();
            });
            test("Should return false when key doesnt exists", async () => {
                expect(await storage.remove("a")).toBe(false);
            });
        });
        describe("method: removeMany", () => {
            test("Should return only true when all keys exists", async () => {
                await storage.addMany({
                    a: 1,
                    b: 1,
                });
                expect(await storage.removeMany(["a", "b"])).toEqual({
                    a: true,
                    b: true,
                });
            });
            test("Should persist values when all keys exist", async () => {
                await storage.addMany({
                    a: 1,
                    b: 1,
                });
                await storage.removeMany(["a", "b"]);
                expect(await storage.getMany(["a", "b"])).toEqual({
                    a: null,
                    b: null,
                });
            });
            test("Should return only false when all keys doesnt exists", async () => {
                expect(await storage.removeMany(["a", "b"])).toEqual({
                    a: false,
                    b: false,
                });
            });
            test("Should return true and false when some keys exists", async () => {
                await storage.add("a", 1);
                expect(await storage.removeMany(["a", "b"])).toEqual({
                    a: true,
                    b: false,
                });
            });
        });
        describe("method: getAndRemove", () => {
            test("Should return value when key exists", async () => {
                await storage.add("a", 1);
                expect(await storage.getAndRemove("a")).toBe(1);
            });
            test("Should return null when key doesnt exists", async () => {
                expect(await storage.getAndRemove("a")).toBeNull();
            });
            test("Should persist removal when key exists", async () => {
                await storage.add("a", 1);
                await storage.getAndRemove("a");
                expect(await storage.get("a")).toBeNull();
            });
        });
        describe("method: getOrAdd", () => {
            test("Should return value when key exists", async () => {
                await storage.add("a", 1);
                expect(await storage.getOrAdd("a", -1)).toBe(1);
            });
            describe("Should return defaultValue when key doesnt exists", () => {
                test("Eager", async () => {
                    expect(await storage.getOrAdd("a", -1)).toBe(-1);
                });
                test("Lazy", async () => {
                    expect(await storage.getOrAdd("a", () => -1)).toBe(-1);
                });
                test("Async lazy", async () => {
                    expect(
                        await storage.getOrAdd("a", () => Promise.resolve(-1)),
                    ).toBe(-1);
                });
            });
            describe("Should persist insertion when key doesnt exists", () => {
                test("Eager", async () => {
                    await storage.getOrAdd("a", -1);
                    expect(await storage.get("a")).toBe(-1);
                });
                test("Lazy", async () => {
                    await storage.getOrAdd("a", () => -1);
                    expect(await storage.get("a")).toBe(-1);
                });
                test("Async lazy", async () => {
                    await storage.getOrAdd("a", () => Promise.resolve(-1));
                    expect(await storage.get("a")).toBe(-1);
                });
            });
        });
        describe("method: increment", () => {
            test("Should return true when key exists", async () => {
                await storage.add("a", 1);
                expect(await storage.increment("a", 1)).toBe(true);
            });
            test("Should persist increment when key exists", async () => {
                await storage.add("a", 1);
                await storage.increment("a", 1);
                expect(await storage.get("a")).toBe(2);
            });
            test("Should return false when key doesnt exists", async () => {
                expect(await storage.increment("a", 1)).toBe(false);
            });
            test("Should not persist increment when key doesnt exists", async () => {
                await storage.increment("a", 1);
                expect(await storage.get("a")).toBeNull();
            });
            test("Should throw TypeStorageError key value is not number type", async () => {
                await storage.add("a", "str");
                await expect(storage.increment("a", 1)).rejects.toBeInstanceOf(
                    TypeStorageError,
                );
            });
        });
        describe("method: decrement", () => {
            test("Should return true when key exists", async () => {
                await storage.add("a", 1);
                expect(await storage.decrement("a", 1)).toBe(true);
            });
            test("Should persist decrement when key exists", async () => {
                await storage.add("a", 1);
                await storage.decrement("a", 1);
                expect(await storage.get("a")).toBe(0);
            });
            test("Should return false when key doesnt exists", async () => {
                expect(await storage.decrement("a", 1)).toBe(false);
            });
            test("Should not persist decrement when key doesnt exists", async () => {
                await storage.decrement("a", 1);
                expect(await storage.get("a")).toBeNull();
            });
            test("Should throw TypeStorageError key value is not number type", async () => {
                await storage.add("a", "str");
                await expect(storage.decrement("a", 1)).rejects.toBeInstanceOf(
                    TypeStorageError,
                );
            });
        });
        describe("method: clear", () => {
            test("Should remove all keys", async () => {
                await storage.addMany({
                    a: 1,
                    b: 2,
                    c: 3,
                    d: 4,
                    e: 5,
                    f: 6,
                });
                await storage.clear();
                expect(
                    await storage.getMany(["a", "b", "c", "d", "e", "f"]),
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
}
