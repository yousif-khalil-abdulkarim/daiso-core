/**
 * @module Storage
 */

import {
    type TestAPI,
    type ExpectStatic,
    type beforeEach,
    type SuiteAPI,
} from "vitest";
import {
    KeyNotFoundStorageError,
    type IStorage,
    type IStorageAdapter,
} from "@/storage/contracts/_module";
import { type Promisable } from "@/_shared/types";
import { Storage } from "@/storage/implementations/_module";

/**
 * @internal
 */
export type StorageNamespaceTestSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createAdapter: () => Promisable<IStorageAdapter<unknown>>;
};
/**
 * @internal
 */
export function storageNamespaceTestSuite(
    settings: StorageNamespaceTestSuiteSettings,
): void {
    const { expect, test, describe, createAdapter, beforeEach } = settings;

    let storageA: IStorage;
    let storageB: IStorage;
    beforeEach(async () => {
        storageA = new Storage(await createAdapter(), {
            namespace: "@a/",
        });
        storageB = new Storage(await createAdapter(), {
            namespace: "@b/",
        });
    });

    describe("Namespace tests:", () => {
        test("method: exists", async () => {
            await storageA.put("a", 1);
            expect(await storageA.exists("a")).toBe(true);
            expect(await storageB.exists("a")).toBe(false);
        });
        test("method: existsMany", async () => {
            await storageA.putMany({
                a: 1,
                b: 1,
            });
            expect(await storageA.existsMany(["a", "b"])).toEqual({
                a: true,
                b: true,
            });
            expect(await storageB.existsMany(["a", "b"])).toEqual({
                a: false,
                b: false,
            });
        });
        test("method: missing", async () => {
            await storageA.put("a", 1);
            expect(await storageA.missing("a")).toBe(false);
            expect(await storageB.missing("a")).toBe(true);
        });
        test("method: missingMany", async () => {
            await storageA.putMany({
                a: 1,
                b: 1,
            });
            expect(await storageA.missingMany(["a", "b"])).toEqual({
                a: false,
                b: false,
            });
            expect(await storageB.missingMany(["a", "b"])).toEqual({
                a: true,
                b: true,
            });
        });
        test("method: get", async () => {
            await storageA.put("a", 1);
            expect(await storageA.get("a")).toBe(1);
            expect(await storageB.get("a")).toBe(null);
        });
        test("method: getMany", async () => {
            await storageA.putMany({
                a: 1,
                b: 1,
            });
            expect(await storageA.getMany(["a", "b"])).toEqual({
                a: 1,
                b: 1,
            });
            expect(await storageB.getMany(["a", "b"])).toEqual({
                a: null,
                b: null,
            });
        });
        test("method: getOr", async () => {
            await storageA.put("a", 1);
            expect(await storageA.getOr("a", -1)).toBe(1);
            expect(await storageB.getOr("a", -1)).toBe(-1);
        });
        test("method: getOrMany", async () => {
            await storageA.putMany({
                a: 1,
                b: 1,
            });
            expect(
                await storageA.getOrMany({
                    a: -1,
                    b: -1,
                }),
            ).toEqual({
                a: 1,
                b: 1,
            });
            expect(
                await storageB.getOrMany({
                    a: -1,
                    b: -1,
                }),
            ).toEqual({
                a: -1,
                b: -1,
            });
        });
        test("method: getOrFail", async () => {
            await storageA.put("a", 1);
            expect(await storageA.getOrFail("a")).toBe(1);
            await expect(storageB.getOrFail("a")).rejects.toBeInstanceOf(
                KeyNotFoundStorageError,
            );
        });
        test("method: add", async () => {
            await storageA.add("a", 1);
            await storageB.add("a", 2);
            expect(await storageA.get("a")).toBe(1);
            expect(await storageB.get("a")).toBe(2);
        });
        test("method: addMany", async () => {
            await storageA.addMany({
                a: 1,
                b: 1,
            });
            await storageB.addMany({
                a: 2,
                b: 2,
            });
            expect(await storageA.getMany(["a", "b"])).toEqual({ a: 1, b: 1 });
            expect(await storageB.getMany(["a", "b"])).toEqual({ a: 2, b: 2 });
        });
        test("method: update", async () => {
            await storageA.add("a", 1);
            await storageB.add("a", 1);
            await storageA.update("a", 2);
            await storageB.update("a", 3);
            expect(await storageA.get("a")).toBe(2);
            expect(await storageB.get("a")).toBe(3);
        });
        test("method: updateMany", async () => {
            await storageA.addMany({
                a: 1,
                b: 1,
            });
            await storageB.addMany({
                a: 1,
                b: 1,
            });
            await storageA.updateMany({
                a: 2,
                b: 2,
            });
            await storageB.updateMany({
                a: 3,
                b: 3,
            });
            expect(await storageA.getMany(["a", "b"])).toEqual({ a: 2, b: 2 });
            expect(await storageB.getMany(["a", "b"])).toEqual({ a: 3, b: 3 });
        });
        test("method: put", async () => {
            await storageA.put("a", 2);
            await storageB.put("a", 3);
            expect(await storageA.get("a")).toBe(2);
            expect(await storageB.get("a")).toBe(3);
        });
        test("method: putMany", async () => {
            await storageA.putMany({
                a: 2,
                b: 2,
            });
            await storageB.putMany({
                a: 3,
                b: 3,
            });
            expect(await storageA.getMany(["a", "b"])).toEqual({ a: 2, b: 2 });
            expect(await storageB.getMany(["a", "b"])).toEqual({ a: 3, b: 3 });
        });
        test("method: remove", async () => {
            await storageA.add("a", 1);
            await storageB.add("a", 1);
            await storageA.remove("a");
            expect(await storageA.get("a")).toBeNull();
            expect(await storageB.get("a")).toBe(1);
        });
        test("method: removeMany", async () => {
            await storageA.addMany({
                a: 1,
                b: 1,
            });
            await storageB.addMany({
                a: 1,
                b: 1,
            });
            await storageA.removeMany(["a", "b"]);
            expect(await storageA.getMany(["a", "b"])).toEqual({
                a: null,
                b: null,
            });
            expect(await storageB.getMany(["a", "b"])).toEqual({ a: 1, b: 1 });
        });
        test("method: getAndRemove", async () => {
            await storageA.add("a", 1);
            await storageB.add("a", 2);
            expect(await storageA.getAndRemove("a")).toBe(1);
            expect(await storageA.get("a")).toBeNull();
            expect(await storageB.get("a")).toBe(2);
        });
        test("method: getOrAdd", async () => {
            await storageA.getOrAdd("a", 1);
            await storageB.getOrAdd("a", 2);
            expect(await storageA.get("a")).toBe(1);
            expect(await storageB.get("a")).toBe(2);
        });
        test("method: increment", async () => {
            await storageA.add("a", 1);
            await storageB.add("a", 1);
            await storageA.increment("a", 1);
            expect(await storageA.get("a")).toBe(2);
            expect(await storageB.get("a")).toBe(1);
        });
        test("method: decrement", async () => {
            await storageA.add("a", 1);
            await storageB.add("a", 1);
            await storageA.decrement("a", 1);
            expect(await storageA.get("a")).toBe(0);
            expect(await storageB.get("a")).toBe(1);
        });
        test("method: clear", async () => {
            await storageA.addMany({
                a: 1,
                b: 2,
            });
            await storageB.addMany({
                a: 1,
                b: 2,
            });
            await storageA.clear();
            expect(await storageA.getMany(["a", "b"])).toEqual({
                a: null,
                b: null,
            });
            expect(await storageB.getMany(["a", "b"])).toEqual({
                a: 1,
                b: 2,
            });
        });
    });
}
