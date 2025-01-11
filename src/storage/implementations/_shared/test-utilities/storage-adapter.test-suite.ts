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
    TypeStorageError,
    type IStorageAdapter,
} from "@/storage/contracts/_module";
import { type Promisable } from "@/_shared/types";

/**
 * @group Utilities
 */
export type StorageAdapterTestSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createAdapter: () => Promisable<IStorageAdapter>;
};
/**
 * The <i>storageAdapterTestSuite</i> function simplifies the process of testing your custom implementation of <i>{@link IStorageAdapter}</i>.
 * @example
 * ```ts
 * import { storageAdapterTestSuite, MemoryStorageAdapter } from "@daiso-tech/core";
 * import { expext, test, describe, beforeEach } from "vitest";
 *
 * describe("class: MemoryStorageAdapter", () => {
 *   storageAdapterTestSuite({
 *     createAdapter: () => new MemoryStorageAdapter(),
 *     test,
 *     beforeEach,
 *     expect,
 *     describe,
 *   });
 * });
 * ```
 * @group Utilities
 */
export function storageAdapterTestSuite(
    settings: StorageAdapterTestSuiteSettings,
): void {
    const { expect, test, createAdapter, describe, beforeEach } = settings;
    let storageAdapter: IStorageAdapter<any>;
    beforeEach(async () => {
        storageAdapter = await createAdapter();
    });

    describe("method: get", () => {
        test("Should return the value when key exists", async () => {
            await storageAdapter.add("a", 1);
            expect(await storageAdapter.get("a")).toBe(1);
        });
        test("Should return null when keys doesnt exists", async () => {
            expect(await storageAdapter.get("a")).toBeNull();
        });
    });
    describe("method: add", () => {
        test("Should return true when key doesnt exists", async () => {
            expect(await storageAdapter.add("a", 1)).toBe(true);
        });
        test("Should persist values when all keys doesnt exist", async () => {
            await storageAdapter.add("a", 1);
            expect(await storageAdapter.get("a")).toBe(1);
        });
        test("Should return false when key exists", async () => {
            await storageAdapter.add("a", 1);
            expect(await storageAdapter.add("a", 1)).toBe(false);
        });
        test("Should not persist value when key exist", async () => {
            await storageAdapter.add("a", 1);
            await storageAdapter.add("a", 2);
            expect(await storageAdapter.get("a")).toBe(1);
        });
    });
    describe("method: update", () => {
        test("Should return true when key exists", async () => {
            await storageAdapter.add("a", 1);
            expect(await storageAdapter.update("a", -1)).toBe(true);
        });
        test("Should persist value when key exist", async () => {
            await storageAdapter.add("a", 1);
            await storageAdapter.update("a", -1);
            expect(await storageAdapter.get("a")).toBe(-1);
        });
        test("Should return false when key doesnt exists", async () => {
            expect(await storageAdapter.update("a", -1)).toBe(false);
        });
        test("Should not persist value when key doesnt exist", async () => {
            await storageAdapter.update("a", -1);
            expect(await storageAdapter.get("a")).toBeNull();
        });
    });
    describe("method: put", () => {
        test("Should return only true when key exists", async () => {
            await storageAdapter.add("a", 1);
            expect(await storageAdapter.put("a", -1)).toBe(true);
        });
        test("Should persist value when key exist", async () => {
            await storageAdapter.add("a", 1);
            await storageAdapter.put("a", -1);
            expect(await storageAdapter.get("a")).toBe(-1);
        });
        test("Should return false when key doesnt exists", async () => {
            expect(await storageAdapter.put("a", -1)).toBe(false);
        });
        test("Should persist values when key doesnt exist", async () => {
            await storageAdapter.put("a", -1);
            expect(await storageAdapter.get("a")).toBe(-1);
        });
    });
    describe("method: remove", () => {
        test("Should return only true when key exists", async () => {
            await storageAdapter.add("a", 1);
            expect(await storageAdapter.remove("a")).toBe(true);
        });
        test("Should persist value when key exist", async () => {
            await storageAdapter.add("a", 1);
            await storageAdapter.remove("a");
            expect(await storageAdapter.get("a")).toBeNull();
        });
        test("Should return false when key doesnt exists", async () => {
            expect(await storageAdapter.remove("a")).toBe(false);
        });
    });
    describe("method: increment", () => {
        test("Should return true when key exists", async () => {
            await storageAdapter.add("a", 1);
            expect(await storageAdapter.increment("a", 1)).toBe(true);
        });
        test("Should persist increment when key exists", async () => {
            await storageAdapter.add("a", 1);
            await storageAdapter.increment("a", 1);
            expect(await storageAdapter.get("a")).toBe(2);
        });
        test("Should return false when key doesnt exists", async () => {
            expect(await storageAdapter.increment("a", 1)).toBe(false);
        });
        test("Should not persist increment when key doesnt exists", async () => {
            await storageAdapter.increment("a", 1);
            expect(await storageAdapter.get("a")).toBeNull();
        });
        test("Should throw TypeStorageError key value is not number type", async () => {
            await storageAdapter.add("a", "str");
            await expect(
                storageAdapter.increment("a", 1),
            ).rejects.toBeInstanceOf(TypeStorageError);
        });
    });
    describe("method: clear", () => {
        test("Should remove all keys", async () => {
            await storageAdapter.add("@a/a", 1);
            await storageAdapter.add("@a/b", 2);
            await storageAdapter.add("@a/c", 3);
            await storageAdapter.add("@b/d", 4);
            await storageAdapter.add("@b/e", 5);
            await storageAdapter.add("@b/f", 6);
            await storageAdapter.clear("@a");
            expect([
                await storageAdapter.get("@a/a"),
                await storageAdapter.get("@a/b"),
                await storageAdapter.get("@a/c"),
                await storageAdapter.get("@b/d"),
                await storageAdapter.get("@b/e"),
                await storageAdapter.get("@b/f"),
            ]).toEqual([null, null, null, 4, 5, 6]);
        });
    });
}
