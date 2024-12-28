/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/**
 * @module Storage
 */

import {
    type TestAPI,
    type SuiteAPI,
    type ExpectStatic,
    type beforeEach,
} from "vitest";
import { type IStorageAdapter } from "@/storage/contracts/_module";
import { type RecordItem, type Promisable } from "@/_shared/types";
import { Storage } from "@/storage/implementations/_module";

/**
 * @internal
 */
export type StorageValueTestSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createAdapter: () => Promisable<IStorageAdapter<unknown>>;
};
/**
 * @internal
 */
export function storageAdapterValueTestSuite(
    settings: StorageValueTestSuiteSettings,
): void {
    const { expect, test, createAdapter, describe, beforeEach } = settings;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let storageAdapter: IStorageAdapter<any>;
    beforeEach(async () => {
        storageAdapter = new Storage(await createAdapter());
    });

    describe("Value tests:", () => {
        describe("method: getMany / addMany", () => {
            test("Should work with positive integer", async () => {
                const value = 1;
                await storageAdapter.addMany({ a: value });
                expect(await storageAdapter.getMany(["a"])).toEqual({
                    a: value,
                });
            });
            test("Should work with negative integer", async () => {
                const value = -1;
                await storageAdapter.addMany({ a: value });
                expect(await storageAdapter.getMany(["a"])).toEqual({
                    a: value,
                });
            });
            test("Should work with positive decimal", async () => {
                const value = 1.5;
                await storageAdapter.addMany({ a: value });
                expect(await storageAdapter.getMany(["a"])).toEqual({
                    a: value,
                });
            });
            test("Should work with negative decimal", async () => {
                const value = -1.5;
                await storageAdapter.addMany({ a: value });
                expect(await storageAdapter.getMany(["a"])).toEqual({
                    a: value,
                });
            });
            test("Should work with NaN", async () => {
                const value = NaN;
                await storageAdapter.addMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeNaN();
            });
            test("Should work with Infinity", async () => {
                const value = Infinity;
                await storageAdapter.addMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(isFinite(getResult as number)).toBe(false);
            });
            test("Should work with Bigint", async () => {
                const value = 20n;
                await storageAdapter.addMany({ a: value });
                expect(await storageAdapter.getMany(["a"])).toEqual({
                    a: value,
                });
            });
            test("Should work with true", async () => {
                const value = true;
                await storageAdapter.addMany({ a: value });
                expect(await storageAdapter.getMany(["a"])).toEqual({
                    a: value,
                });
            });
            test("Should work with false", async () => {
                const value = false;
                await storageAdapter.addMany({ a: value });
                expect(await storageAdapter.getMany(["a"])).toEqual({
                    a: value,
                });
            });
            test("Should work with string", async () => {
                const value = "str";
                await storageAdapter.addMany({ a: value });
                expect(await storageAdapter.getMany(["a"])).toEqual({
                    a: value,
                });
            });
            test("Should work with Date", async () => {
                const value = new Date("2024-01-01");
                await storageAdapter.addMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Date);
                expect(getResult).toEqual(value);
            });
            test("Should work with RegExp", async () => {
                const value = /test/;
                await storageAdapter.addMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(RegExp);
                expect(getResult).toEqual(value);
            });
            test("Should work with Buffer", async () => {
                const value = Buffer.from("asd");
                await storageAdapter.addMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Buffer);
                expect(getResult?.toString("base64")).toEqual(
                    value.toString("base64"),
                );
            });
            test("Should work with Uint8Array", async () => {
                const value = new Uint8Array(Buffer.from("asd"));
                await storageAdapter.addMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Uint8Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int8Array", async () => {
                const value = new Int8Array(Buffer.from("asd"));
                await storageAdapter.addMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Int8Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Uint16Array", async () => {
                const value = new Uint16Array(Buffer.from("asd"));
                await storageAdapter.addMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Uint16Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int16Array", async () => {
                const value = new Int16Array(Buffer.from("asd"));
                await storageAdapter.addMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Int16Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Uint32Array", async () => {
                const value = new Uint32Array(Buffer.from("asd"));
                await storageAdapter.addMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Uint32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int32Array", async () => {
                const value = new Int32Array(Buffer.from("asd"));
                await storageAdapter.addMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Int32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Float32Array", async () => {
                const value = new Float32Array(Buffer.from("asd"));
                await storageAdapter.addMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Float32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Float64Array", async () => {
                const value = new Float64Array(Buffer.from("asd"));
                await storageAdapter.addMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Float64Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Set", async () => {
                const value = new Set(["a", "b", "c"]);
                await storageAdapter.addMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Set);
                expect(getResult).toEqual(value);
            });
            test("Should work with Set of number, boolean, string, Date, Set, Map, RegExp, Objects, Arrays", async () => {
                const value = new Set([
                    0,
                    -1,
                    1,
                    -1.5,
                    1.5,
                    NaN,
                    Infinity,
                    2n,
                    true,
                    false,
                    "str",
                    new Date("2024-01-01"),
                    new Set(["a", "b", "c"]),
                    new Map([
                        ["a", 1],
                        ["b", 2],
                        ["c", 3],
                    ]),
                    { a: 1, b: 2 },
                    [1, 2, 3],
                    /test/,
                ]);
                await storageAdapter.addMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Set);
                expect(getResult).toEqual(value);
            });
            test("Should work with Map", async () => {
                const value = new Map([
                    ["a", 1],
                    ["b", 2],
                    ["c", 3],
                ]);
                await storageAdapter.addMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Map);
                expect(getResult).toEqual(value);
            });
            test("Should work with Map of number, boolean, string, Date, Set, Map, RegExp, Objects, Arrays values", async () => {
                const value = new Map([
                    ["a", 0],
                    ["b", -1],
                    ["c", 1],
                    ["d", -1.5],
                    ["e", 1.5],
                    ["f", NaN],
                    ["g", Infinity],
                    ["h", 2n],
                    ["j", true],
                    ["l", false],
                    ["i", "str"],
                    ["r", new Date("2024-01-01")],
                    ["k", new Set(["a", "b", "c"])],
                    [
                        "p",
                        new Map([
                            ["a", 1],
                            ["b", 2],
                            ["c", 3],
                        ]),
                    ],
                    ["a", /test/],
                    [1, { a: 2, b: -1 }],
                    [2, [1, 2, 3]],
                ] as RecordItem<unknown, unknown>[]);
                await storageAdapter.addMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Map);
                expect(getResult).toEqual(value);
            });
            test("Should work with Map of number, boolean, string, Date, Set, Map, RegExp, Objects, Arrays keys", async () => {
                const value = new Map([
                    [0, "a"],
                    [-1, "a"],
                    [1, "a"],
                    [-1.5, "a"],
                    [1.5, "a"],
                    [NaN, "a"],
                    [Infinity, "a"],
                    [2n, "a"],
                    [true, "a"],
                    [false, "a"],
                    ["str", "a"],
                    [new Date("2024-01-01"), "a"],
                    [new Set(["a", "b", "c"]), "a"],
                    [
                        new Map([
                            ["a", 1],
                            ["b", 2],
                            ["c", 3],
                        ]),
                        "a",
                    ],
                    [/test/, "a"],
                    [{ a: 2, b: -1 }, 1],
                    [[1, 2, 3], 2],
                ] as RecordItem<unknown, unknown>[]);
                await storageAdapter.addMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Map);
                expect(getResult).toEqual(value);
            });
            test("Should work with array of number, boolean, string, Date, Set, Map, RegExp", async () => {
                const value = [
                    0,
                    -1,
                    1,
                    -1.5,
                    1.5,
                    NaN,
                    Infinity,
                    2n,
                    true,
                    false,
                    "str",
                    new Date("2024-01-01"),
                    new Set(["a", "b", "c"]),
                    new Map([
                        ["a", 1],
                        ["b", 2],
                        ["c", 3],
                    ]),
                    /test/,
                ];
                await storageAdapter.addMany({ a: value });
                const getResult = await storageAdapter.getMany(["a"]);
                expect(getResult).toEqual({ a: value });
            });
            test("Should work with array of objects", async () => {
                const value = [
                    Object.fromEntries([
                        ["a", 0],
                        ["b", -1],
                        ["c", 1],
                        ["d", -1.5],
                        ["e", 1.5],
                        ["f", NaN],
                        ["g", Infinity],
                        ["h", 2n],
                        ["j", true],
                        ["l", false],
                        ["i", "str"],
                        ["r", new Date("2024-01-01")],
                        ["k", new Set(["a", "b", "c"])],
                        [
                            "p",
                            new Map([
                                ["a", 1],
                                ["b", 2],
                                ["c", 3],
                            ]),
                        ],
                        ["a", /test/],
                    ] as RecordItem<string, unknown>[]),
                ];
                await storageAdapter.addMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toEqual(value);
            });
            test("Should work with object of number, boolean, string, Date, Set, Map, RegExp", async () => {
                const value = Object.fromEntries([
                    ["a", 0],
                    ["b", -1],
                    ["c", 1],
                    ["d", -1.5],
                    ["e", 1.5],
                    ["f", NaN],
                    ["g", Infinity],
                    ["h", 2n],
                    ["j", true],
                    ["l", false],
                    ["i", "str"],
                    ["r", new Date("2024-01-01")],
                    ["k", new Set(["a", "b", "c"])],
                    [
                        "p",
                        new Map([
                            ["a", 1],
                            ["b", 2],
                            ["c", 3],
                        ]),
                    ],
                    ["a", /test/],
                ] as RecordItem<string, unknown>[]);
                await storageAdapter.addMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toEqual(value);
            });
            test("Should work with object of arrays", async () => {
                const value = {
                    a: [
                        0,
                        -1,
                        1,
                        -1.5,
                        1.5,
                        NaN,
                        Infinity,
                        2n,
                        true,
                        false,
                        "str",
                        new Date("2024-01-01"),
                        new Set(["a", "b", "c"]),
                        new Map([
                            ["a", 1],
                            ["b", 2],
                            ["c", 3],
                        ]),
                        /test/,
                    ],
                };
                await storageAdapter.addMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toEqual(value);
            });
        });
        describe("method: updateMany", () => {
            test("Should work with positive integer", async () => {
                const value = 1;
                await storageAdapter.addMany({ a: -1 });
                await storageAdapter.updateMany({ a: value });
                expect(await storageAdapter.getMany(["a"])).toEqual({
                    a: value,
                });
            });
            test("Should work with negative integer", async () => {
                const value = -1;
                await storageAdapter.addMany({ a: -1 });
                await storageAdapter.updateMany({ a: value });
                expect(await storageAdapter.getMany(["a"])).toEqual({
                    a: value,
                });
            });
            test("Should work with positive decimal", async () => {
                const value = 1.5;
                await storageAdapter.addMany({ a: -1 });
                await storageAdapter.updateMany({ a: value });
                expect(await storageAdapter.getMany(["a"])).toEqual({
                    a: value,
                });
            });
            test("Should work with negative decimal", async () => {
                const value = -1.5;
                await storageAdapter.addMany({ a: -1 });
                await storageAdapter.updateMany({ a: value });
                expect(await storageAdapter.getMany(["a"])).toEqual({
                    a: value,
                });
            });
            test("Should work with NaN", async () => {
                const value = NaN;
                await storageAdapter.addMany({ a: -1 });
                await storageAdapter.updateMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeNaN();
            });
            test("Should work with Infinity", async () => {
                const value = Infinity;
                await storageAdapter.addMany({ a: -1 });
                await storageAdapter.updateMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(isFinite(getResult as number)).toBe(false);
            });
            test("Should work with Bigint", async () => {
                const value = 20n;
                await storageAdapter.addMany({ a: -1 });
                await storageAdapter.updateMany({ a: value });
                expect(await storageAdapter.getMany(["a"])).toEqual({
                    a: value,
                });
            });
            test("Should work with true", async () => {
                const value = true;
                await storageAdapter.addMany({ a: -1 });
                await storageAdapter.updateMany({ a: value });
                expect(await storageAdapter.getMany(["a"])).toEqual({
                    a: value,
                });
            });
            test("Should work with false", async () => {
                const value = false;
                await storageAdapter.addMany({ a: -1 });
                await storageAdapter.updateMany({ a: value });
                expect(await storageAdapter.getMany(["a"])).toEqual({
                    a: value,
                });
            });
            test("Should work with string", async () => {
                const value = "str";
                await storageAdapter.addMany({ a: -1 });
                await storageAdapter.updateMany({ a: value });
                expect(await storageAdapter.getMany(["a"])).toEqual({
                    a: value,
                });
            });
            test("Should work with Date", async () => {
                const value = new Date("2024-01-01");
                await storageAdapter.addMany({ a: -1 });
                await storageAdapter.updateMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Date);
                expect(getResult).toEqual(value);
            });
            test("Should work with RegExp", async () => {
                const value = /test/;
                await storageAdapter.addMany({ a: -1 });
                await storageAdapter.updateMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(RegExp);
                expect(getResult).toEqual(value);
            });
            test("Should work with Buffer", async () => {
                const value = Buffer.from("asd");
                await storageAdapter.addMany({ a: -1 });
                await storageAdapter.updateMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Buffer);
                expect(getResult?.toString("base64")).toEqual(
                    value.toString("base64"),
                );
            });
            test("Should work with Uint8Array", async () => {
                const value = new Uint8Array(Buffer.from("asd"));
                await storageAdapter.addMany({ a: -1 });
                await storageAdapter.updateMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Uint8Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int8Array", async () => {
                const value = new Int8Array(Buffer.from("asd"));
                await storageAdapter.addMany({ a: -1 });
                await storageAdapter.updateMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Int8Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Uint16Array", async () => {
                const value = new Uint16Array(Buffer.from("asd"));
                await storageAdapter.addMany({ a: -1 });
                await storageAdapter.updateMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Uint16Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int16Array", async () => {
                const value = new Int16Array(Buffer.from("asd"));
                await storageAdapter.addMany({ a: -1 });
                await storageAdapter.updateMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Int16Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Uint32Array", async () => {
                const value = new Uint32Array(Buffer.from("asd"));
                await storageAdapter.addMany({ a: -1 });
                await storageAdapter.updateMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Uint32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int32Array", async () => {
                const value = new Int32Array(Buffer.from("asd"));
                await storageAdapter.addMany({ a: -1 });
                await storageAdapter.updateMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Int32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Float32Array", async () => {
                const value = new Float32Array(Buffer.from("asd"));
                await storageAdapter.addMany({ a: -1 });
                await storageAdapter.updateMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Float32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Float64Array", async () => {
                const value = new Float64Array(Buffer.from("asd"));
                await storageAdapter.addMany({ a: -1 });
                await storageAdapter.updateMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Float64Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Set", async () => {
                const value = new Set(["a", "b", "c"]);
                await storageAdapter.addMany({ a: -1 });
                await storageAdapter.updateMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Set);
                expect(getResult).toEqual(value);
            });
            test("Should work with Set of number, boolean, string, Date, Set, Map, RegExp, Objects, Arrays", async () => {
                const value = new Set([
                    0,
                    -1,
                    1,
                    -1.5,
                    1.5,
                    NaN,
                    Infinity,
                    2n,
                    true,
                    false,
                    "str",
                    new Date("2024-01-01"),
                    new Set(["a", "b", "c"]),
                    new Map([
                        ["a", 1],
                        ["b", 2],
                        ["c", 3],
                    ]),
                    { a: 1, b: 2 },
                    [1, 2, 3],
                    /test/,
                ]);
                await storageAdapter.addMany({ a: -1 });
                await storageAdapter.updateMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Set);
                expect(getResult).toEqual(value);
            });
            test("Should work with Map", async () => {
                const value = new Map([
                    ["a", 1],
                    ["b", 2],
                    ["c", 3],
                ]);
                await storageAdapter.addMany({ a: -1 });
                await storageAdapter.updateMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Map);
                expect(getResult).toEqual(value);
            });
            test("Should work with Map of number, boolean, string, Date, Set, Map, RegExp, Objects, Arrays values", async () => {
                const value = new Map([
                    ["a", 0],
                    ["b", -1],
                    ["c", 1],
                    ["d", -1.5],
                    ["e", 1.5],
                    ["f", NaN],
                    ["g", Infinity],
                    ["h", 2n],
                    ["j", true],
                    ["l", false],
                    ["i", "str"],
                    ["r", new Date("2024-01-01")],
                    ["k", new Set(["a", "b", "c"])],
                    [
                        "p",
                        new Map([
                            ["a", 1],
                            ["b", 2],
                            ["c", 3],
                        ]),
                    ],
                    ["a", /test/],
                    [1, { a: 2, b: -1 }],
                    [2, [1, 2, 3]],
                ] as RecordItem<unknown, unknown>[]);
                await storageAdapter.addMany({ a: -1 });
                await storageAdapter.updateMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Map);
                expect(getResult).toEqual(value);
            });
            test("Should work with Map of number, boolean, string, Date, Set, Map, RegExp, Objects, Arrays keys", async () => {
                const value = new Map([
                    [0, "a"],
                    [-1, "a"],
                    [1, "a"],
                    [-1.5, "a"],
                    [1.5, "a"],
                    [NaN, "a"],
                    [Infinity, "a"],
                    [2n, "a"],
                    [true, "a"],
                    [false, "a"],
                    ["str", "a"],
                    [new Date("2024-01-01"), "a"],
                    [new Set(["a", "b", "c"]), "a"],
                    [
                        new Map([
                            ["a", 1],
                            ["b", 2],
                            ["c", 3],
                        ]),
                        "a",
                    ],
                    [/test/, "a"],
                    [{ a: 2, b: -1 }, 1],
                    [[1, 2, 3], 2],
                ] as RecordItem<unknown, unknown>[]);
                await storageAdapter.addMany({ a: -1 });
                await storageAdapter.updateMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Map);
                expect(getResult).toEqual(value);
            });
            test("Should work with array of number, boolean, string, Date, Set, Map, RegExp", async () => {
                const value = [
                    0,
                    -1,
                    1,
                    -1.5,
                    1.5,
                    NaN,
                    Infinity,
                    2n,
                    true,
                    false,
                    "str",
                    new Date("2024-01-01"),
                    new Set(["a", "b", "c"]),
                    new Map([
                        ["a", 1],
                        ["b", 2],
                        ["c", 3],
                    ]),
                    /test/,
                ];
                await storageAdapter.addMany({ a: -1 });
                await storageAdapter.updateMany({ a: value });
                const getResult = await storageAdapter.getMany(["a"]);
                expect(getResult).toEqual({ a: value });
            });
            test("Should work with array of objects", async () => {
                const value = [
                    Object.fromEntries([
                        ["a", 0],
                        ["b", -1],
                        ["c", 1],
                        ["d", -1.5],
                        ["e", 1.5],
                        ["f", NaN],
                        ["g", Infinity],
                        ["h", 2n],
                        ["j", true],
                        ["l", false],
                        ["i", "str"],
                        ["r", new Date("2024-01-01")],
                        ["k", new Set(["a", "b", "c"])],
                        [
                            "p",
                            new Map([
                                ["a", 1],
                                ["b", 2],
                                ["c", 3],
                            ]),
                        ],
                        ["a", /test/],
                    ] as RecordItem<string, unknown>[]),
                ];
                await storageAdapter.addMany({ a: -1 });
                await storageAdapter.updateMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toEqual(value);
            });
            test("Should work with object of number, boolean, string, Date, Set, Map, RegExp", async () => {
                const value = Object.fromEntries([
                    ["a", 0],
                    ["b", -1],
                    ["c", 1],
                    ["d", -1.5],
                    ["e", 1.5],
                    ["f", NaN],
                    ["g", Infinity],
                    ["h", 2n],
                    ["j", true],
                    ["l", false],
                    ["i", "str"],
                    ["r", new Date("2024-01-01")],
                    ["k", new Set(["a", "b", "c"])],
                    [
                        "p",
                        new Map([
                            ["a", 1],
                            ["b", 2],
                            ["c", 3],
                        ]),
                    ],
                    ["a", /test/],
                ] as RecordItem<string, unknown>[]);
                await storageAdapter.addMany({ a: -1 });
                await storageAdapter.updateMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toEqual(value);
            });
            test("Should work with object of arrays", async () => {
                const value = {
                    a: [
                        0,
                        -1,
                        1,
                        -1.5,
                        1.5,
                        NaN,
                        Infinity,
                        2n,
                        true,
                        false,
                        "str",
                        new Date("2024-01-01"),
                        new Set(["a", "b", "c"]),
                        new Map([
                            ["a", 1],
                            ["b", 2],
                            ["c", 3],
                        ]),
                        /test/,
                    ],
                };
                await storageAdapter.addMany({ a: -1 });
                await storageAdapter.updateMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toEqual(value);
            });
        });
        describe("method: putMany", () => {
            test("Should work with positive integer", async () => {
                const value = 1;
                await storageAdapter.putMany({ a: value });
                expect(await storageAdapter.getMany(["a"])).toEqual({
                    a: value,
                });
            });
            test("Should work with negative integer", async () => {
                const value = -1;
                await storageAdapter.putMany({ a: value });
                expect(await storageAdapter.getMany(["a"])).toEqual({
                    a: value,
                });
            });
            test("Should work with positive decimal", async () => {
                const value = 1.5;
                await storageAdapter.putMany({ a: value });
                expect(await storageAdapter.getMany(["a"])).toEqual({
                    a: value,
                });
            });
            test("Should work with negative decimal", async () => {
                const value = -1.5;
                await storageAdapter.putMany({ a: value });
                expect(await storageAdapter.getMany(["a"])).toEqual({
                    a: value,
                });
            });
            test("Should work with NaN", async () => {
                const value = NaN;
                await storageAdapter.putMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeNaN();
            });
            test("Should work with Infinity", async () => {
                const value = Infinity;
                await storageAdapter.putMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(isFinite(getResult as number)).toBe(false);
            });
            test("Should work with Bigint", async () => {
                const value = 20n;
                await storageAdapter.putMany({ a: value });
                expect(await storageAdapter.getMany(["a"])).toEqual({
                    a: value,
                });
            });
            test("Should work with true", async () => {
                const value = true;
                await storageAdapter.putMany({ a: value });
                expect(await storageAdapter.getMany(["a"])).toEqual({
                    a: value,
                });
            });
            test("Should work with false", async () => {
                const value = false;
                await storageAdapter.putMany({ a: value });
                expect(await storageAdapter.getMany(["a"])).toEqual({
                    a: value,
                });
            });
            test("Should work with string", async () => {
                const value = "str";
                await storageAdapter.putMany({ a: value });
                expect(await storageAdapter.getMany(["a"])).toEqual({
                    a: value,
                });
            });
            test("Should work with Date", async () => {
                const value = new Date("2024-01-01");
                await storageAdapter.putMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Date);
                expect(getResult).toEqual(value);
            });
            test("Should work with RegExp", async () => {
                const value = /test/;
                await storageAdapter.putMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(RegExp);
                expect(getResult).toEqual(value);
            });
            test("Should work with Buffer", async () => {
                const value = Buffer.from("asd");
                await storageAdapter.putMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Buffer);
                expect(getResult?.toString("base64")).toEqual(
                    value.toString("base64"),
                );
            });
            test("Should work with Uint8Array", async () => {
                const value = new Uint8Array(Buffer.from("asd"));
                await storageAdapter.putMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Uint8Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int8Array", async () => {
                const value = new Int8Array(Buffer.from("asd"));
                await storageAdapter.putMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Int8Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Uint16Array", async () => {
                const value = new Uint16Array(Buffer.from("asd"));
                await storageAdapter.putMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Uint16Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int16Array", async () => {
                const value = new Int16Array(Buffer.from("asd"));
                await storageAdapter.putMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Int16Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Uint32Array", async () => {
                const value = new Uint32Array(Buffer.from("asd"));
                await storageAdapter.putMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Uint32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int32Array", async () => {
                const value = new Int32Array(Buffer.from("asd"));
                await storageAdapter.putMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Int32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Float32Array", async () => {
                const value = new Float32Array(Buffer.from("asd"));
                await storageAdapter.putMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Float32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Float64Array", async () => {
                const value = new Float64Array(Buffer.from("asd"));
                await storageAdapter.putMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Float64Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Set", async () => {
                const value = new Set(["a", "b", "c"]);
                await storageAdapter.putMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Set);
                expect(getResult).toEqual(value);
            });
            test("Should work with Set of number, boolean, string, Date, Set, Map, RegExp, Objects, Arrays", async () => {
                const value = new Set([
                    0,
                    -1,
                    1,
                    -1.5,
                    1.5,
                    NaN,
                    Infinity,
                    2n,
                    true,
                    false,
                    "str",
                    new Date("2024-01-01"),
                    new Set(["a", "b", "c"]),
                    new Map([
                        ["a", 1],
                        ["b", 2],
                        ["c", 3],
                    ]),
                    { a: 1, b: 2 },
                    [1, 2, 3],
                    /test/,
                ]);
                await storageAdapter.putMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Set);
                expect(getResult).toEqual(value);
            });
            test("Should work with Map", async () => {
                const value = new Map([
                    ["a", 1],
                    ["b", 2],
                    ["c", 3],
                ]);
                await storageAdapter.putMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Map);
                expect(getResult).toEqual(value);
            });
            test("Should work with Map of number, boolean, string, Date, Set, Map, RegExp, Objects, Arrays values", async () => {
                const value = new Map([
                    ["a", 0],
                    ["b", -1],
                    ["c", 1],
                    ["d", -1.5],
                    ["e", 1.5],
                    ["f", NaN],
                    ["g", Infinity],
                    ["h", 2n],
                    ["j", true],
                    ["l", false],
                    ["i", "str"],
                    ["r", new Date("2024-01-01")],
                    ["k", new Set(["a", "b", "c"])],
                    [
                        "p",
                        new Map([
                            ["a", 1],
                            ["b", 2],
                            ["c", 3],
                        ]),
                    ],
                    ["a", /test/],
                    [1, { a: 2, b: -1 }],
                    [2, [1, 2, 3]],
                ] as RecordItem<unknown, unknown>[]);
                await storageAdapter.putMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Map);
                expect(getResult).toEqual(value);
            });
            test("Should work with Map of number, boolean, string, Date, Set, Map, RegExp, Objects, Arrays keys", async () => {
                const value = new Map([
                    [0, "a"],
                    [-1, "a"],
                    [1, "a"],
                    [-1.5, "a"],
                    [1.5, "a"],
                    [NaN, "a"],
                    [Infinity, "a"],
                    [2n, "a"],
                    [true, "a"],
                    [false, "a"],
                    ["str", "a"],
                    [new Date("2024-01-01"), "a"],
                    [new Set(["a", "b", "c"]), "a"],
                    [
                        new Map([
                            ["a", 1],
                            ["b", 2],
                            ["c", 3],
                        ]),
                        "a",
                    ],
                    [/test/, "a"],
                    [{ a: 2, b: -1 }, 1],
                    [[1, 2, 3], 2],
                ] as RecordItem<unknown, unknown>[]);
                await storageAdapter.putMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Map);
                expect(getResult).toEqual(value);
            });
            test("Should work with array of number, boolean, string, Date, Set, Map, RegExp", async () => {
                const value = [
                    0,
                    -1,
                    1,
                    -1.5,
                    1.5,
                    NaN,
                    Infinity,
                    2n,
                    true,
                    false,
                    "str",
                    new Date("2024-01-01"),
                    new Set(["a", "b", "c"]),
                    new Map([
                        ["a", 1],
                        ["b", 2],
                        ["c", 3],
                    ]),
                    /test/,
                ];
                await storageAdapter.putMany({ a: value });
                const getResult = await storageAdapter.getMany(["a"]);
                expect(getResult).toEqual({ a: value });
            });
            test("Should work with array of objects", async () => {
                const value = [
                    Object.fromEntries([
                        ["a", 0],
                        ["b", -1],
                        ["c", 1],
                        ["d", -1.5],
                        ["e", 1.5],
                        ["f", NaN],
                        ["g", Infinity],
                        ["h", 2n],
                        ["j", true],
                        ["l", false],
                        ["i", "str"],
                        ["r", new Date("2024-01-01")],
                        ["k", new Set(["a", "b", "c"])],
                        [
                            "p",
                            new Map([
                                ["a", 1],
                                ["b", 2],
                                ["c", 3],
                            ]),
                        ],
                        ["a", /test/],
                    ] as RecordItem<string, unknown>[]),
                ];
                await storageAdapter.putMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toEqual(value);
            });
            test("Should work with object of number, boolean, string, Date, Set, Map, RegExp", async () => {
                const value = Object.fromEntries([
                    ["a", 0],
                    ["b", -1],
                    ["c", 1],
                    ["d", -1.5],
                    ["e", 1.5],
                    ["f", NaN],
                    ["g", Infinity],
                    ["h", 2n],
                    ["j", true],
                    ["l", false],
                    ["i", "str"],
                    ["r", new Date("2024-01-01")],
                    ["k", new Set(["a", "b", "c"])],
                    [
                        "p",
                        new Map([
                            ["a", 1],
                            ["b", 2],
                            ["c", 3],
                        ]),
                    ],
                    ["a", /test/],
                ] as RecordItem<string, unknown>[]);
                await storageAdapter.putMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toEqual(value);
            });
            test("Should work with object of arrays", async () => {
                const value = {
                    a: [
                        0,
                        -1,
                        1,
                        -1.5,
                        1.5,
                        NaN,
                        Infinity,
                        2n,
                        true,
                        false,
                        "str",
                        new Date("2024-01-01"),
                        new Set(["a", "b", "c"]),
                        new Map([
                            ["a", 1],
                            ["b", 2],
                            ["c", 3],
                        ]),
                        /test/,
                    ],
                };
                await storageAdapter.putMany({ a: value });
                const { a: getResult } = await storageAdapter.getMany(["a"]);
                expect(getResult).toEqual(value);
            });
        });
    });
}
