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
} from "@/storage/contracts/_module";
import { type Promisable } from "@/_shared/types";

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
export function storageAdapterApiTestSuite(
    settings: StorageApiTestSuiteSettings,
): void {
    const { expect, test, createAdapter, describe, beforeEach } = settings;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let storageAdapter: IStorageAdapter<any>;
    beforeEach(async () => {
        storageAdapter = await createAdapter();
    });

    describe("Api tests:", () => {
        describe("method: getMany", () => {
            test("Should return only values when all keys exists", async () => {
                await storageAdapter.addMany({
                    a: 1,
                    b: 1,
                });
                expect(await storageAdapter.getMany(["a", "b"])).toEqual({
                    a: 1,
                    b: 1,
                });
            });
            test("Should return only null when all keys doesnt exists", async () => {
                expect(await storageAdapter.getMany(["a", "b"])).toEqual({
                    a: null,
                    b: null,
                });
            });
            test("Should return values and null when some keys exists", async () => {
                await storageAdapter.addMany({ a: 1 });
                expect(await storageAdapter.getMany(["a", "b"])).toEqual({
                    a: 1,
                    b: null,
                });
            });
        });
        describe("method: addMany", () => {
            test("Should return only true when all keys doesnt exists", async () => {
                expect(
                    await storageAdapter.addMany({
                        a: 1,
                        b: 1,
                    }),
                ).toEqual({
                    a: true,
                    b: true,
                });
            });
            test("Should persist values when all keys doesnt exist", async () => {
                await storageAdapter.addMany({
                    a: 1,
                    b: 1,
                });
                expect(await storageAdapter.getMany(["a", "b"])).toEqual({
                    a: 1,
                    b: 1,
                });
            });
            test("Should return only false when all keys exists", async () => {
                await storageAdapter.addMany({
                    a: 1,
                    b: 1,
                });
                expect(
                    await storageAdapter.addMany({
                        a: 1,
                        b: 1,
                    }),
                ).toEqual({
                    a: false,
                    b: false,
                });
            });
            test("Should not persist values when key exist", async () => {
                await storageAdapter.addMany({
                    a: 1,
                    b: 1,
                });
                await storageAdapter.addMany({
                    a: 2,
                    b: 2,
                });
                expect(await storageAdapter.getMany(["a", "b"])).toEqual({
                    a: 1,
                    b: 1,
                });
            });
            test("Should return true and false when some keys exists", async () => {
                await storageAdapter.addMany({ a: 1 });
                expect(
                    await storageAdapter.addMany({
                        a: 1,
                        b: 1,
                    }),
                ).toEqual({
                    a: false,
                    b: true,
                });
            });
            test("Should persist and not persist values when some keys exists", async () => {
                await storageAdapter.addMany({
                    a: 1,
                });
                await storageAdapter.addMany({
                    a: 2,
                    b: 2,
                });
                expect(await storageAdapter.getMany(["a", "b"])).toEqual({
                    a: 1,
                    b: 2,
                });
            });
        });
        describe("method: updateMany", () => {
            test("Should return only true when all keys exists", async () => {
                await storageAdapter.addMany({
                    a: 1,
                    b: 1,
                });
                expect(
                    await storageAdapter.updateMany({ a: -1, b: -1 }),
                ).toEqual({
                    a: true,
                    b: true,
                });
            });
            test("Should persist values when all keys exist", async () => {
                await storageAdapter.addMany({
                    a: 1,
                    b: 1,
                });
                await storageAdapter.updateMany({ a: -1, b: -1 });
                expect(await storageAdapter.getMany(["a", "b"])).toEqual({
                    a: -1,
                    b: -1,
                });
            });
            test("Should return only false when all keys doesnt exists", async () => {
                expect(
                    await storageAdapter.updateMany({ a: -1, b: -1 }),
                ).toEqual({
                    a: false,
                    b: false,
                });
            });
            test("Should not persist values when all keys doesnt exist", async () => {
                await storageAdapter.updateMany({ a: -1, b: -1 });
                expect(await storageAdapter.getMany(["a", "b"])).toEqual({
                    a: null,
                    b: null,
                });
            });
            test("Should return true and false when some keys exists", async () => {
                await storageAdapter.addMany({ a: 1 });
                expect(
                    await storageAdapter.updateMany({ a: -1, b: -1 }),
                ).toEqual({
                    a: true,
                    b: false,
                });
            });
            test("Should persist and not persist values when some keys exists", async () => {
                await storageAdapter.addMany({ a: 1 });
                await storageAdapter.updateMany({ a: -1, b: -1 });
                expect(await storageAdapter.getMany(["a", "b"])).toEqual({
                    a: -1,
                    b: null,
                });
            });
        });
        describe("method: putMany", () => {
            test("Should return only true when all keys exists", async () => {
                await storageAdapter.addMany({
                    a: 1,
                    b: 1,
                });
                expect(await storageAdapter.putMany({ a: -1, b: -1 })).toEqual({
                    a: true,
                    b: true,
                });
            });
            test("Should persist values when all keys exist", async () => {
                await storageAdapter.addMany({
                    a: 1,
                    b: 1,
                });
                await storageAdapter.putMany({ a: -1, b: -1 });
                expect(await storageAdapter.getMany(["a", "b"])).toEqual({
                    a: -1,
                    b: -1,
                });
            });
            test("Should return only false when all keys doesnt exists", async () => {
                expect(await storageAdapter.putMany({ a: -1, b: -1 })).toEqual({
                    a: false,
                    b: false,
                });
            });
            test("Should persist values when all keys doesnt exist", async () => {
                await storageAdapter.putMany({ a: -1, b: -1 });
                expect(await storageAdapter.getMany(["a", "b"])).toEqual({
                    a: -1,
                    b: -1,
                });
            });
            test("Should return true and false when some keys exists", async () => {
                await storageAdapter.addMany({ a: 1 });
                expect(await storageAdapter.putMany({ a: -1, b: -1 })).toEqual({
                    a: true,
                    b: false,
                });
            });
            test("Should persist all values when some keys exists", async () => {
                await storageAdapter.addMany({ a: 1 });
                await storageAdapter.putMany({ a: -1, b: -1 });
                expect(await storageAdapter.getMany(["a", "b"])).toEqual({
                    a: -1,
                    b: -1,
                });
            });
        });
        describe("method: removeMany", () => {
            test("Should return only true when all keys exists", async () => {
                await storageAdapter.addMany({
                    a: 1,
                    b: 1,
                });
                expect(await storageAdapter.removeMany(["a", "b"])).toEqual({
                    a: true,
                    b: true,
                });
            });
            test("Should persist values when all keys exist", async () => {
                await storageAdapter.addMany({
                    a: 1,
                    b: 1,
                });
                await storageAdapter.removeMany(["a", "b"]);
                expect(await storageAdapter.getMany(["a", "b"])).toEqual({
                    a: null,
                    b: null,
                });
            });
            test("Should return only false when all keys doesnt exists", async () => {
                expect(await storageAdapter.removeMany(["a", "b"])).toEqual({
                    a: false,
                    b: false,
                });
            });
            test("Should return true and false when some keys exists", async () => {
                await storageAdapter.addMany({ a: 1 });
                expect(await storageAdapter.removeMany(["a", "b"])).toEqual({
                    a: true,
                    b: false,
                });
            });
        });
        describe("method: increment", () => {
            test("Should return true when key exists", async () => {
                await storageAdapter.addMany({ a: 1 });
                expect(await storageAdapter.increment("a", 1)).toBe(true);
            });
            test("Should persist increment when key exists", async () => {
                await storageAdapter.addMany({ a: 1 });
                await storageAdapter.increment("a", 1);
                expect(await storageAdapter.getMany(["a"])).toEqual({ a: 2 });
            });
            test("Should return false when key doesnt exists", async () => {
                expect(await storageAdapter.increment("a", 1)).toBe(false);
            });
            test("Should not persist increment when key doesnt exists", async () => {
                await storageAdapter.increment("a", 1);
                expect(await storageAdapter.getMany(["a"])).toEqual({
                    a: null,
                });
            });
            test("Should throw TypeStorageError key value is not number type", async () => {
                await storageAdapter.addMany({ a: "str" });
                await expect(
                    storageAdapter.increment("a", 1),
                ).rejects.toBeInstanceOf(TypeStorageError);
            });
        });
        describe("method: clear", () => {
            test("Should remove all keys", async () => {
                await storageAdapter.addMany({
                    "@a/a": 1,
                    "@a/b": 2,
                    "@a/c": 3,
                    "@b/d": 4,
                    "@b/e": 5,
                    "@b/f": 6,
                });
                await storageAdapter.clear("@a/");
                expect(
                    await storageAdapter.getMany([
                        "@a/a",
                        "@a/b",
                        "@a/c",
                        "@b/d",
                        "@b/e",
                        "@b/f",
                    ]),
                ).toEqual({
                    "@a/a": null,
                    "@a/b": null,
                    "@a/c": null,
                    "@b/d": 4,
                    "@b/e": 5,
                    "@b/f": 6,
                });
            });
        });
    });
}
