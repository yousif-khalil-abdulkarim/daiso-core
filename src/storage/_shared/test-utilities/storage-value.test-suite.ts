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
    type IStorage,
    type IStorageAdapter,
} from "@/contracts/storage/_module";
import { type RecordItem, type Promisable } from "@/_shared/types";
import { Storage } from "@/storage/_module";

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
export function storageValueTestSuite(
    settings: StorageValueTestSuiteSettings,
): void {
    const { expect, test, createAdapter, describe, beforeEach } = settings;
    let storage: IStorage;
    beforeEach(async () => {
        storage = new Storage(await createAdapter());
    });

    describe("Value tests:", () => {
        describe("method: get / add", () => {
            test("Should work with positive integer", async () => {
                const value = 1;
                await storage.add("a", value);
                expect(await storage.get("a")).toBe(value);
            });
            test("Should work with negative integer", async () => {
                const value = -1;
                await storage.add("a", value);
                expect(await storage.get("a")).toBe(value);
            });
            test("Should work with positive decimal", async () => {
                const value = 1.5;
                await storage.add("a", value);
                expect(await storage.get("a")).toBe(value);
            });
            test("Should work with negative decimal", async () => {
                const value = -1.5;
                await storage.add("a", value);
                expect(await storage.get("a")).toBe(value);
            });
            test("Should work with NaN", async () => {
                const value = NaN;
                await storage.add("a", value);
                const getResult = await storage.get("a");
                expect(getResult).toBeNaN();
            });
            test("Should work with Infinity", async () => {
                const value = Infinity;
                await storage.add("a", value);
                const getResult = await storage.get("a");
                expect(isFinite(getResult as number)).toBe(false);
            });
            test("Should work with Bigint", async () => {
                const value = 20n;
                await storage.add("a", value);
                expect(await storage.get("a")).toBe(value);
            });
            test("Should work with true", async () => {
                const value = true;
                await storage.add("a", value);
                expect(await storage.get("a")).toBe(value);
            });
            test("Should work with false", async () => {
                const value = false;
                await storage.add("a", value);
                expect(await storage.get("a")).toBe(value);
            });
            test("Should work with string", async () => {
                const value = "str";
                await storage.add("a", value);
                expect(await storage.get("a")).toBe(value);
            });
            test("Should work with Date", async () => {
                const value = new Date("2024-01-01");
                await storage.add("a", value);
                const getResult = await storage.get("a");
                expect(getResult).toBeInstanceOf(Date);
                expect(getResult).toEqual(value);
            });
            test("Should work with RegExp", async () => {
                const value = /test/;
                await storage.add("a", value);
                const getResult = await storage.get("a");
                expect(getResult).toBeInstanceOf(RegExp);
                expect(getResult).toEqual(value);
            });
            test("Should work with Buffer", async () => {
                const value = Buffer.from("asd");
                await storage.add("a", value);
                const getResult = await storage.get<Buffer>("a");
                expect(getResult).toBeInstanceOf(Buffer);
                expect(getResult?.toString("base64")).toEqual(
                    value.toString("base64"),
                );
            });
            test("Should work with Uint8Array", async () => {
                const value = new Uint8Array(Buffer.from("asd"));
                await storage.add("a", value);
                const getResult = await storage.get<Uint8Array>("a");
                expect(getResult).toBeInstanceOf(Uint8Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int8Array", async () => {
                const value = new Int8Array(Buffer.from("asd"));
                await storage.add("a", value);
                const getResult = await storage.get<Int8Array>("a");
                expect(getResult).toBeInstanceOf(Int8Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Uint16Array", async () => {
                const value = new Uint16Array(Buffer.from("asd"));
                await storage.add("a", value);
                const getResult = await storage.get<Uint16Array>("a");
                expect(getResult).toBeInstanceOf(Uint16Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int16Array", async () => {
                const value = new Int16Array(Buffer.from("asd"));
                await storage.add("a", value);
                const getResult = await storage.get<Int16Array>("a");
                expect(getResult).toBeInstanceOf(Int16Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Uint32Array", async () => {
                const value = new Uint32Array(Buffer.from("asd"));
                await storage.add("a", value);
                const getResult = await storage.get<Uint32Array>("a");
                expect(getResult).toBeInstanceOf(Uint32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int32Array", async () => {
                const value = new Int32Array(Buffer.from("asd"));
                await storage.add("a", value);
                const getResult = await storage.get<Int32Array>("a");
                expect(getResult).toBeInstanceOf(Int32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Float32Array", async () => {
                const value = new Float32Array(Buffer.from("asd"));
                await storage.add("a", value);
                const getResult = await storage.get<Float32Array>("a");
                expect(getResult).toBeInstanceOf(Float32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Float64Array", async () => {
                const value = new Float64Array(Buffer.from("asd"));
                await storage.add("a", value);
                const getResult = await storage.get<Float64Array>("a");
                expect(getResult).toBeInstanceOf(Float64Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Set", async () => {
                const value = new Set(["a", "b", "c"]);
                await storage.add("a", value);
                const getResult = await storage.get("a");
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
                await storage.add("a", value);
                const getResult = await storage.get("a");
                expect(getResult).toBeInstanceOf(Set);
                expect(getResult).toEqual(value);
            });
            test("Should work with Map", async () => {
                const value = new Map([
                    ["a", 1],
                    ["b", 2],
                    ["c", 3],
                ]);
                await storage.add("a", value);
                const getResult = await storage.get("a");
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
                await storage.add("a", value);
                const getResult = await storage.get("a");
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
                await storage.add("a", value);
                const getResult = await storage.get("a");
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
                await storage.add("a", value);
                const getResult = await storage.get("a");
                expect(getResult).toEqual(value);
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
                await storage.add("a", value);
                const getResult = await storage.get("a");
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
                await storage.add("a", value);
                const getResult = await storage.get("a");
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
                await storage.add("a", value);
                const getResult = await storage.get("a");
                expect(getResult).toEqual(value);
            });
        });
        describe("method: getMany / addMany", () => {
            test("Should work with positive integer", async () => {
                const value = 1;
                await storage.addMany({ a: value });
                expect(await storage.getMany(["a"])).toEqual({ a: value });
            });
            test("Should work with negative integer", async () => {
                const value = -1;
                await storage.addMany({ a: value });
                expect(await storage.getMany(["a"])).toEqual({ a: value });
            });
            test("Should work with positive decimal", async () => {
                const value = 1.5;
                await storage.addMany({ a: value });
                expect(await storage.getMany(["a"])).toEqual({ a: value });
            });
            test("Should work with negative decimal", async () => {
                const value = -1.5;
                await storage.addMany({ a: value });
                expect(await storage.getMany(["a"])).toEqual({ a: value });
            });
            test("Should work with NaN", async () => {
                const value = NaN;
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
                expect(getResult).toBeNaN();
            });
            test("Should work with Infinity", async () => {
                const value = Infinity;
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
                expect(isFinite(getResult as number)).toBe(false);
            });
            test("Should work with Bigint", async () => {
                const value = 20n;
                await storage.addMany({ a: value });
                expect(await storage.getMany(["a"])).toEqual({ a: value });
            });
            test("Should work with true", async () => {
                const value = true;
                await storage.addMany({ a: value });
                expect(await storage.getMany(["a"])).toEqual({ a: value });
            });
            test("Should work with false", async () => {
                const value = false;
                await storage.addMany({ a: value });
                expect(await storage.getMany(["a"])).toEqual({ a: value });
            });
            test("Should work with string", async () => {
                const value = "str";
                await storage.addMany({ a: value });
                expect(await storage.getMany(["a"])).toEqual({ a: value });
            });
            test("Should work with Date", async () => {
                const value = new Date("2024-01-01");
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Date);
                expect(getResult).toEqual(value);
            });
            test("Should work with RegExp", async () => {
                const value = /test/;
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
                expect(getResult).toBeInstanceOf(RegExp);
                expect(getResult).toEqual(value);
            });
            test("Should work with Buffer", async () => {
                const value = Buffer.from("asd");
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getMany<Buffer, string>([
                    "a",
                ]);
                expect(getResult).toBeInstanceOf(Buffer);
                expect(getResult?.toString("base64")).toEqual(
                    value.toString("base64"),
                );
            });
            test("Should work with Uint8Array", async () => {
                const value = new Uint8Array(Buffer.from("asd"));
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getMany<
                    Uint8Array,
                    string
                >(["a"]);
                expect(getResult).toBeInstanceOf(Uint8Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int8Array", async () => {
                const value = new Int8Array(Buffer.from("asd"));
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getMany<
                    Int8Array,
                    string
                >(["a"]);
                expect(getResult).toBeInstanceOf(Int8Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Uint16Array", async () => {
                const value = new Uint16Array(Buffer.from("asd"));
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getMany<
                    Uint16Array,
                    string
                >(["a"]);
                expect(getResult).toBeInstanceOf(Uint16Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int16Array", async () => {
                const value = new Int16Array(Buffer.from("asd"));
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getMany<
                    Int16Array,
                    string
                >(["a"]);
                expect(getResult).toBeInstanceOf(Int16Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Uint32Array", async () => {
                const value = new Uint32Array(Buffer.from("asd"));
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getMany<
                    Uint32Array,
                    string
                >(["a"]);
                expect(getResult).toBeInstanceOf(Uint32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int32Array", async () => {
                const value = new Int32Array(Buffer.from("asd"));
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getMany<
                    Int32Array,
                    string
                >(["a"]);
                expect(getResult).toBeInstanceOf(Int32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Float32Array", async () => {
                const value = new Float32Array(Buffer.from("asd"));
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getMany<
                    Float32Array,
                    string
                >(["a"]);
                expect(getResult).toBeInstanceOf(Float32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Float64Array", async () => {
                const value = new Float64Array(Buffer.from("asd"));
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getMany<
                    Float64Array,
                    string
                >(["a"]);
                expect(getResult).toBeInstanceOf(Float64Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Set", async () => {
                const value = new Set(["a", "b", "c"]);
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
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
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Set);
                expect(getResult).toEqual(value);
            });
            test("Should work with Map", async () => {
                const value = new Map([
                    ["a", 1],
                    ["b", 2],
                    ["c", 3],
                ]);
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
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
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
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
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
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
                await storage.addMany({ a: value });
                const getResult = await storage.getMany(["a"]);
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
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
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
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
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
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
                expect(getResult).toEqual(value);
            });
        });
        describe("method: getOr", () => {
            test("Should work with positive integer", async () => {
                const value = 1;
                await storage.add("a", value);
                expect(await storage.getOr("a", -1)).toBe(value);
            });
            test("Should work with negative integer", async () => {
                const value = -1;
                await storage.add("a", value);
                expect(await storage.getOr("a", -1)).toBe(value);
            });
            test("Should work with positive decimal", async () => {
                const value = 1.5;
                await storage.add("a", value);
                expect(await storage.getOr("a", -1)).toBe(value);
            });
            test("Should work with negative decimal", async () => {
                const value = -1.5;
                await storage.add("a", value);
                expect(await storage.getOr("a", -1)).toBe(value);
            });
            test("Should work with NaN", async () => {
                const value = NaN;
                await storage.add("a", value);
                const getResult = await storage.getOr("a", -1);
                expect(getResult).toBeNaN();
            });
            test("Should work with Infinity", async () => {
                const value = Infinity;
                await storage.add("a", value);
                const getResult = await storage.getOr("a", -1);
                expect(isFinite(getResult as number)).toBe(false);
            });
            test("Should work with Bigint", async () => {
                const value = 20n;
                await storage.add("a", value);
                expect(await storage.getOr("a", -1)).toBe(value);
            });
            test("Should work with true", async () => {
                const value = true;
                await storage.add("a", value);
                expect(await storage.getOr("a", -1)).toBe(value);
            });
            test("Should work with false", async () => {
                const value = false;
                await storage.add("a", value);
                expect(await storage.getOr("a", -1)).toBe(value);
            });
            test("Should work with string", async () => {
                const value = "str";
                await storage.add("a", value);
                expect(await storage.getOr("a", -1)).toBe(value);
            });
            test("Should work with Date", async () => {
                const value = new Date("2024-01-01");
                await storage.add("a", value);
                const getResult = await storage.getOr("a", -1);
                expect(getResult).toBeInstanceOf(Date);
                expect(getResult).toEqual(value);
            });
            test("Should work with RegExp", async () => {
                const value = /test/;
                await storage.add("a", value);
                const getResult = await storage.getOr("a", -1);
                expect(getResult).toBeInstanceOf(RegExp);
                expect(getResult).toEqual(value);
            });
            test("Should work with Buffer", async () => {
                const value = Buffer.from("asd");
                await storage.add("a", value);
                const getResult = await storage.getOr<Buffer, null>("a", null);
                expect(getResult).toBeInstanceOf(Buffer);
                expect(getResult?.toString("base64")).toEqual(
                    value.toString("base64"),
                );
            });
            test("Should work with Uint8Array", async () => {
                const value = new Uint8Array(Buffer.from("asd"));
                await storage.add("a", value);
                const getResult = await storage.getOr<Uint8Array, null>(
                    "a",
                    null,
                );
                expect(getResult).toBeInstanceOf(Uint8Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int8Array", async () => {
                const value = new Int8Array(Buffer.from("asd"));
                await storage.add("a", value);
                const getResult = await storage.getOr<Int8Array, null>(
                    "a",
                    null,
                );
                expect(getResult).toBeInstanceOf(Int8Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Uint16Array", async () => {
                const value = new Uint16Array(Buffer.from("asd"));
                await storage.add("a", value);
                const getResult = await storage.getOr<Uint16Array, null>(
                    "a",
                    null,
                );
                expect(getResult).toBeInstanceOf(Uint16Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int16Array", async () => {
                const value = new Int16Array(Buffer.from("asd"));
                await storage.add("a", value);
                const getResult = await storage.getOr<Int16Array, null>(
                    "a",
                    null,
                );
                expect(getResult).toBeInstanceOf(Int16Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Uint32Array", async () => {
                const value = new Uint32Array(Buffer.from("asd"));
                await storage.add("a", value);
                const getResult = await storage.getOr<Uint32Array, null>(
                    "a",
                    null,
                );
                expect(getResult).toBeInstanceOf(Uint32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int32Array", async () => {
                const value = new Int32Array(Buffer.from("asd"));
                await storage.add("a", value);
                const getResult = await storage.getOr<Int32Array, null>(
                    "a",
                    null,
                );
                expect(getResult).toBeInstanceOf(Int32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Float32Array", async () => {
                const value = new Float32Array(Buffer.from("asd"));
                await storage.add("a", value);
                const getResult = await storage.getOr<Float32Array, null>(
                    "a",
                    null,
                );
                expect(getResult).toBeInstanceOf(Float32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Float64Array", async () => {
                const value = new Float64Array(Buffer.from("asd"));
                await storage.add("a", value);
                const getResult = await storage.getOr<Float64Array, null>(
                    "a",
                    null,
                );
                expect(getResult).toBeInstanceOf(Float64Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Set", async () => {
                const value = new Set(["a", "b", "c"]);
                await storage.add("a", value);
                const getResult = await storage.getOr("a", -1);
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
                await storage.add("a", value);
                const getResult = await storage.getOr("a", -1);
                expect(getResult).toBeInstanceOf(Set);
                expect(getResult).toEqual(value);
            });
            test("Should work with Map", async () => {
                const value = new Map([
                    ["a", 1],
                    ["b", 2],
                    ["c", 3],
                ]);
                await storage.add("a", value);
                const getResult = await storage.getOr("a", -1);
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
                await storage.add("a", value);
                const getResult = await storage.getOr("a", -1);
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
                await storage.add("a", value);
                const getResult = await storage.getOr("a", -1);
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
                await storage.add("a", value);
                const getResult = await storage.getOr("a", -1);
                expect(getResult).toEqual(value);
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
                await storage.add("a", value);
                const getResult = await storage.getOr("a", -1);
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
                await storage.add("a", value);
                const getResult = await storage.getOr("a", -1);
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
                await storage.add("a", value);
                const getResult = await storage.getOr("a", -1);
                expect(getResult).toEqual(value);
            });
        });
        describe("method: getOrMany", () => {
            test("Should work with positive integer", async () => {
                const value = 1;
                await storage.addMany({ a: value });
                expect(await storage.getOrMany({ a: -1 })).toEqual({
                    a: value,
                });
            });
            test("Should work with negative integer", async () => {
                const value = -1;
                await storage.addMany({ a: value });
                expect(await storage.getOrMany({ a: -1 })).toEqual({
                    a: value,
                });
            });
            test("Should work with positive decimal", async () => {
                const value = 1.5;
                await storage.addMany({ a: value });
                expect(await storage.getOrMany({ a: -1 })).toEqual({
                    a: value,
                });
            });
            test("Should work with negative decimal", async () => {
                const value = -1.5;
                await storage.addMany({ a: value });
                expect(await storage.getOrMany({ a: -1 })).toEqual({
                    a: value,
                });
            });
            test("Should work with NaN", async () => {
                const value = NaN;
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getOrMany({ a: -1 });
                expect(getResult).toBeNaN();
            });
            test("Should work with Infinity", async () => {
                const value = Infinity;
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getOrMany({ a: -1 });
                expect(isFinite(getResult as number)).toBe(false);
            });
            test("Should work with Bigint", async () => {
                const value = 20n;
                await storage.addMany({ a: value });
                expect(await storage.getOrMany({ a: -1 })).toEqual({
                    a: value,
                });
            });
            test("Should work with true", async () => {
                const value = true;
                await storage.addMany({ a: value });
                expect(await storage.getOrMany({ a: -1 })).toEqual({
                    a: value,
                });
            });
            test("Should work with false", async () => {
                const value = false;
                await storage.addMany({ a: value });
                expect(await storage.getOrMany({ a: -1 })).toEqual({
                    a: value,
                });
            });
            test("Should work with string", async () => {
                const value = "str";
                await storage.addMany({ a: value });
                expect(await storage.getOrMany({ a: -1 })).toEqual({
                    a: value,
                });
            });
            test("Should work with Date", async () => {
                const value = new Date("2024-01-01");
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getOrMany({ a: -1 });
                expect(getResult).toBeInstanceOf(Date);
                expect(getResult).toEqual(value);
            });
            test("Should work with RegExp", async () => {
                const value = /test/;
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getOrMany({ a: -1 });
                expect(getResult).toBeInstanceOf(RegExp);
                expect(getResult).toEqual(value);
            });
            test("Should work with Buffer", async () => {
                const value = Buffer.from("asd");
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getOrMany<
                    Buffer,
                    null,
                    string
                >({ a: null });
                expect(getResult).toBeInstanceOf(Buffer);
                expect(getResult?.toString("base64")).toEqual(
                    value.toString("base64"),
                );
            });
            test("Should work with Uint8Array", async () => {
                const value = new Uint8Array(Buffer.from("asd"));
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getOrMany<
                    Uint8Array,
                    null,
                    string
                >({ a: null });
                expect(getResult).toBeInstanceOf(Uint8Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int8Array", async () => {
                const value = new Int8Array(Buffer.from("asd"));
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getOrMany<
                    Int8Array,
                    null,
                    string
                >({ a: null });
                expect(getResult).toBeInstanceOf(Int8Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Uint16Array", async () => {
                const value = new Uint16Array(Buffer.from("asd"));
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getOrMany<
                    Uint16Array,
                    null,
                    string
                >({ a: null });
                expect(getResult).toBeInstanceOf(Uint16Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int16Array", async () => {
                const value = new Int16Array(Buffer.from("asd"));
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getOrMany<
                    Int16Array,
                    null,
                    string
                >({ a: null });
                expect(getResult).toBeInstanceOf(Int16Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Uint32Array", async () => {
                const value = new Uint32Array(Buffer.from("asd"));
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getOrMany<
                    Uint32Array,
                    null,
                    string
                >({ a: null });
                expect(getResult).toBeInstanceOf(Uint32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int32Array", async () => {
                const value = new Int32Array(Buffer.from("asd"));
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getOrMany<
                    Int32Array,
                    null,
                    string
                >({ a: null });
                expect(getResult).toBeInstanceOf(Int32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Float32Array", async () => {
                const value = new Float32Array(Buffer.from("asd"));
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getOrMany<
                    Float32Array,
                    null,
                    string
                >({ a: null });
                expect(getResult).toBeInstanceOf(Float32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Float64Array", async () => {
                const value = new Float64Array(Buffer.from("asd"));
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getOrMany<
                    Float64Array,
                    null,
                    string
                >({ a: null });
                expect(getResult).toBeInstanceOf(Float64Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Set", async () => {
                const value = new Set(["a", "b", "c"]);
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getOrMany({ a: -1 });
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
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getOrMany({ a: -1 });
                expect(getResult).toBeInstanceOf(Set);
                expect(getResult).toEqual(value);
            });
            test("Should work with Map", async () => {
                const value = new Map([
                    ["a", 1],
                    ["b", 2],
                    ["c", 3],
                ]);
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getOrMany({ a: -1 });
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
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getOrMany({ a: -1 });
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
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getOrMany({ a: -1 });
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
                await storage.addMany({ a: value });
                const getResult = await storage.getOrMany({ a: -1 });
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
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getOrMany({ a: -1 });
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
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getOrMany({ a: -1 });
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
                await storage.addMany({ a: value });
                const { a: getResult } = await storage.getOrMany({ a: -1 });
                expect(getResult).toEqual(value);
            });
        });
        describe("method: getOrFail", () => {
            test("Should work with positive integer", async () => {
                const value = 1;
                await storage.add("a", value);
                expect(await storage.getOrFail("a")).toBe(value);
            });
            test("Should work with negative integer", async () => {
                const value = -1;
                await storage.add("a", value);
                expect(await storage.getOrFail("a")).toBe(value);
            });
            test("Should work with positive decimal", async () => {
                const value = 1.5;
                await storage.add("a", value);
                expect(await storage.getOrFail("a")).toBe(value);
            });
            test("Should work with negative decimal", async () => {
                const value = -1.5;
                await storage.add("a", value);
                expect(await storage.getOrFail("a")).toBe(value);
            });
            test("Should work with NaN", async () => {
                const value = NaN;
                await storage.add("a", value);
                const getResult = await storage.getOrFail("a");
                expect(getResult).toBeNaN();
            });
            test("Should work with Infinity", async () => {
                const value = Infinity;
                await storage.add("a", value);
                const getResult = await storage.getOrFail("a");
                expect(isFinite(getResult as number)).toBe(false);
            });
            test("Should work with Bigint", async () => {
                const value = 20n;
                await storage.add("a", value);
                expect(await storage.getOrFail("a")).toBe(value);
            });
            test("Should work with true", async () => {
                const value = true;
                await storage.add("a", value);
                expect(await storage.getOrFail("a")).toBe(value);
            });
            test("Should work with false", async () => {
                const value = false;
                await storage.add("a", value);
                expect(await storage.getOrFail("a")).toBe(value);
            });
            test("Should work with string", async () => {
                const value = "str";
                await storage.add("a", value);
                expect(await storage.getOrFail("a")).toBe(value);
            });
            test("Should work with Date", async () => {
                const value = new Date("2024-01-01");
                await storage.add("a", value);
                const getResult = await storage.getOrFail("a");
                expect(getResult).toBeInstanceOf(Date);
                expect(getResult).toEqual(value);
            });
            test("Should work with RegExp", async () => {
                const value = /test/;
                await storage.add("a", value);
                const getResult = await storage.getOrFail("a");
                expect(getResult).toBeInstanceOf(RegExp);
                expect(getResult).toEqual(value);
            });
            test("Should work with Buffer", async () => {
                const value = Buffer.from("asd");
                await storage.add("a", value);
                const getResult = await storage.getOrFail<Buffer>("a");
                expect(getResult).toBeInstanceOf(Buffer);
                expect(getResult.toString("base64")).toEqual(
                    value.toString("base64"),
                );
            });
            test("Should work with Uint8Array", async () => {
                const value = new Uint8Array(Buffer.from("asd"));
                await storage.add("a", value);
                const getResult = await storage.getOrFail<Uint8Array>("a");
                expect(getResult).toBeInstanceOf(Uint8Array);
                expect(Buffer.from(getResult).toString("base64")).toEqual(
                    Buffer.from(value).toString("base64"),
                );
            });
            test("Should work with Int8Array", async () => {
                const value = new Int8Array(Buffer.from("asd"));
                await storage.add("a", value);
                const getResult = await storage.getOrFail<Int8Array>("a");
                expect(getResult).toBeInstanceOf(Int8Array);
                expect(Buffer.from(getResult).toString("base64")).toEqual(
                    Buffer.from(value).toString("base64"),
                );
            });
            test("Should work with Uint16Array", async () => {
                const value = new Uint16Array(Buffer.from("asd"));
                await storage.add("a", value);
                const getResult = await storage.getOrFail<Uint16Array>("a");
                expect(getResult).toBeInstanceOf(Uint16Array);
                expect(Buffer.from(getResult).toString("base64")).toEqual(
                    Buffer.from(value).toString("base64"),
                );
            });
            test("Should work with Int16Array", async () => {
                const value = new Int16Array(Buffer.from("asd"));
                await storage.add("a", value);
                const getResult = await storage.getOrFail<Int16Array>("a");
                expect(getResult).toBeInstanceOf(Int16Array);
                expect(Buffer.from(getResult).toString("base64")).toEqual(
                    Buffer.from(value).toString("base64"),
                );
            });
            test("Should work with Uint32Array", async () => {
                const value = new Uint32Array(Buffer.from("asd"));
                await storage.add("a", value);
                const getResult = await storage.getOrFail<Uint32Array>("a");
                expect(getResult).toBeInstanceOf(Uint32Array);
                expect(Buffer.from(getResult).toString("base64")).toEqual(
                    Buffer.from(value).toString("base64"),
                );
            });
            test("Should work with Int32Array", async () => {
                const value = new Int32Array(Buffer.from("asd"));
                await storage.add("a", value);
                const getResult = await storage.getOrFail<Int32Array>("a");
                expect(getResult).toBeInstanceOf(Int32Array);
                expect(Buffer.from(getResult).toString("base64")).toEqual(
                    Buffer.from(value).toString("base64"),
                );
            });
            test("Should work with Float32Array", async () => {
                const value = new Float32Array(Buffer.from("asd"));
                await storage.add("a", value);
                const getResult = await storage.getOrFail<Float32Array>("a");
                expect(getResult).toBeInstanceOf(Float32Array);
                expect(Buffer.from(getResult).toString("base64")).toEqual(
                    Buffer.from(value).toString("base64"),
                );
            });
            test("Should work with Float64Array", async () => {
                const value = new Float64Array(Buffer.from("asd"));
                await storage.add("a", value);
                const getResult = await storage.getOrFail<Float64Array>("a");
                expect(getResult).toBeInstanceOf(Float64Array);
                expect(Buffer.from(getResult).toString("base64")).toEqual(
                    Buffer.from(value).toString("base64"),
                );
            });
            test("Should work with Set", async () => {
                const value = new Set(["a", "b", "c"]);
                await storage.add("a", value);
                const getResult = await storage.getOrFail("a");
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
                await storage.add("a", value);
                const getResult = await storage.getOrFail("a");
                expect(getResult).toBeInstanceOf(Set);
                expect(getResult).toEqual(value);
            });
            test("Should work with Map", async () => {
                const value = new Map([
                    ["a", 1],
                    ["b", 2],
                    ["c", 3],
                ]);
                await storage.add("a", value);
                const getResult = await storage.getOrFail("a");
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
                await storage.add("a", value);
                const getResult = await storage.getOrFail("a");
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
                await storage.add("a", value);
                const getResult = await storage.getOrFail("a");
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
                await storage.add("a", value);
                const getResult = await storage.getOrFail("a");
                expect(getResult).toEqual(value);
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
                await storage.add("a", value);
                const getResult = await storage.getOrFail("a");
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
                await storage.add("a", value);
                const getResult = await storage.getOrFail("a");
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
                await storage.add("a", value);
                const getResult = await storage.getOrFail("a");
                expect(getResult).toEqual(value);
            });
        });
        describe("method: update", () => {
            test("Should work with positive integer", async () => {
                const value = 1;
                await storage.add("a", -1);
                await storage.update("a", value);
                expect(await storage.get("a")).toBe(value);
            });
            test("Should work with negative integer", async () => {
                const value = -1;
                await storage.add("a", -1);
                await storage.update("a", value);
                expect(await storage.get("a")).toBe(value);
            });
            test("Should work with positive decimal", async () => {
                const value = 1.5;
                await storage.add("a", -1);
                await storage.update("a", value);
                expect(await storage.get("a")).toBe(value);
            });
            test("Should work with negative decimal", async () => {
                const value = -1.5;
                await storage.add("a", -1);
                await storage.update("a", value);
                expect(await storage.get("a")).toBe(value);
            });
            test("Should work with NaN", async () => {
                const value = NaN;
                await storage.add("a", -1);
                await storage.update("a", value);
                const getResult = await storage.get("a");
                expect(getResult).toBeNaN();
            });
            test("Should work with Infinity", async () => {
                const value = Infinity;
                await storage.add("a", -1);
                await storage.update("a", value);
                const getResult = await storage.get("a");
                expect(isFinite(getResult as number)).toBe(false);
            });
            test("Should work with Bigint", async () => {
                const value = 20n;
                await storage.add("a", -1);
                await storage.update("a", value);
                expect(await storage.get("a")).toBe(value);
            });
            test("Should work with true", async () => {
                const value = true;
                await storage.add("a", -1);
                await storage.update("a", value);
                expect(await storage.get("a")).toBe(value);
            });
            test("Should work with false", async () => {
                const value = false;
                await storage.add("a", -1);
                await storage.update("a", value);
                expect(await storage.get("a")).toBe(value);
            });
            test("Should work with string", async () => {
                const value = "str";
                await storage.add("a", -1);
                await storage.update("a", value);
                expect(await storage.get("a")).toBe(value);
            });
            test("Should work with Date", async () => {
                const value = new Date("2024-01-01");
                await storage.add("a", -1);
                await storage.update("a", value);
                const getResult = await storage.get("a");
                expect(getResult).toBeInstanceOf(Date);
                expect(getResult).toEqual(value);
            });
            test("Should work with RegExp", async () => {
                const value = /test/;
                await storage.add("a", -1);
                await storage.update("a", value);
                const getResult = await storage.get("a");
                expect(getResult).toBeInstanceOf(RegExp);
                expect(getResult).toEqual(value);
            });
            test("Should work with Buffer", async () => {
                const value = Buffer.from("asd");
                await storage.add("a", -1);
                await storage.update("a", value);
                const getResult = await storage.get<Buffer>("a");
                expect(getResult).toBeInstanceOf(Buffer);
                expect(getResult?.toString("base64")).toEqual(
                    value.toString("base64"),
                );
            });
            test("Should work with Uint8Array", async () => {
                const value = new Uint8Array(Buffer.from("asd"));
                await storage.add("a", -1);
                await storage.update("a", value);
                const getResult = await storage.get<Uint8Array>("a");
                expect(getResult).toBeInstanceOf(Uint8Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int8Array", async () => {
                const value = new Int8Array(Buffer.from("asd"));
                await storage.add("a", -1);
                await storage.update("a", value);
                const getResult = await storage.get<Int8Array>("a");
                expect(getResult).toBeInstanceOf(Int8Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Uint16Array", async () => {
                const value = new Uint16Array(Buffer.from("asd"));
                await storage.add("a", -1);
                await storage.update("a", value);
                const getResult = await storage.get<Uint16Array>("a");
                expect(getResult).toBeInstanceOf(Uint16Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int16Array", async () => {
                const value = new Int16Array(Buffer.from("asd"));
                await storage.add("a", -1);
                await storage.update("a", value);
                const getResult = await storage.get<Int16Array>("a");
                expect(getResult).toBeInstanceOf(Int16Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Uint32Array", async () => {
                const value = new Uint32Array(Buffer.from("asd"));
                await storage.add("a", -1);
                await storage.update("a", value);
                const getResult = await storage.get<Uint32Array>("a");
                expect(getResult).toBeInstanceOf(Uint32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int32Array", async () => {
                const value = new Int32Array(Buffer.from("asd"));
                await storage.add("a", -1);
                await storage.update("a", value);
                const getResult = await storage.get<Int32Array>("a");
                expect(getResult).toBeInstanceOf(Int32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Float32Array", async () => {
                const value = new Float32Array(Buffer.from("asd"));
                await storage.add("a", -1);
                await storage.update("a", value);
                const getResult = await storage.get<Float32Array>("a");
                expect(getResult).toBeInstanceOf(Float32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Float64Array", async () => {
                const value = new Float64Array(Buffer.from("asd"));
                await storage.add("a", -1);
                await storage.update("a", value);
                const getResult = await storage.get<Float64Array>("a");
                expect(getResult).toBeInstanceOf(Float64Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Set", async () => {
                const value = new Set(["a", "b", "c"]);
                await storage.add("a", -1);
                await storage.update("a", value);
                const getResult = await storage.get("a");
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
                await storage.add("a", -1);
                await storage.update("a", value);
                const getResult = await storage.get("a");
                expect(getResult).toBeInstanceOf(Set);
                expect(getResult).toEqual(value);
            });
            test("Should work with Map", async () => {
                const value = new Map([
                    ["a", 1],
                    ["b", 2],
                    ["c", 3],
                ]);
                await storage.add("a", -1);
                await storage.update("a", value);
                const getResult = await storage.get("a");
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
                await storage.add("a", -1);
                await storage.update("a", value);
                const getResult = await storage.get("a");
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
                await storage.add("a", -1);
                await storage.update("a", value);
                const getResult = await storage.get("a");
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
                await storage.add("a", -1);
                await storage.update("a", value);
                const getResult = await storage.get("a");
                expect(getResult).toEqual(value);
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
                await storage.add("a", -1);
                await storage.update("a", value);
                const getResult = await storage.get("a");
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
                await storage.add("a", -1);
                await storage.update("a", value);
                const getResult = await storage.get("a");
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
                await storage.add("a", -1);
                await storage.update("a", value);
                const getResult = await storage.get("a");
                expect(getResult).toEqual(value);
            });
        });
        describe("method: updateMany", () => {
            test("Should work with positive integer", async () => {
                const value = 1;
                await storage.add("a", -1);
                await storage.updateMany({ a: value });
                expect(await storage.getMany(["a"])).toEqual({ a: value });
            });
            test("Should work with negative integer", async () => {
                const value = -1;
                await storage.add("a", -1);
                await storage.updateMany({ a: value });
                expect(await storage.getMany(["a"])).toEqual({ a: value });
            });
            test("Should work with positive decimal", async () => {
                const value = 1.5;
                await storage.add("a", -1);
                await storage.updateMany({ a: value });
                expect(await storage.getMany(["a"])).toEqual({ a: value });
            });
            test("Should work with negative decimal", async () => {
                const value = -1.5;
                await storage.add("a", -1);
                await storage.updateMany({ a: value });
                expect(await storage.getMany(["a"])).toEqual({ a: value });
            });
            test("Should work with NaN", async () => {
                const value = NaN;
                await storage.add("a", -1);
                await storage.updateMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
                expect(getResult).toBeNaN();
            });
            test("Should work with Infinity", async () => {
                const value = Infinity;
                await storage.add("a", -1);
                await storage.updateMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
                expect(isFinite(getResult as number)).toBe(false);
            });
            test("Should work with Bigint", async () => {
                const value = 20n;
                await storage.add("a", -1);
                await storage.updateMany({ a: value });
                expect(await storage.getMany(["a"])).toEqual({ a: value });
            });
            test("Should work with true", async () => {
                const value = true;
                await storage.add("a", -1);
                await storage.updateMany({ a: value });
                expect(await storage.getMany(["a"])).toEqual({ a: value });
            });
            test("Should work with false", async () => {
                const value = false;
                await storage.add("a", -1);
                await storage.updateMany({ a: value });
                expect(await storage.getMany(["a"])).toEqual({ a: value });
            });
            test("Should work with string", async () => {
                const value = "str";
                await storage.add("a", -1);
                await storage.updateMany({ a: value });
                expect(await storage.getMany(["a"])).toEqual({ a: value });
            });
            test("Should work with Date", async () => {
                const value = new Date("2024-01-01");
                await storage.add("a", -1);
                await storage.updateMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Date);
                expect(getResult).toEqual(value);
            });
            test("Should work with RegExp", async () => {
                const value = /test/;
                await storage.add("a", -1);
                await storage.updateMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
                expect(getResult).toBeInstanceOf(RegExp);
                expect(getResult).toEqual(value);
            });
            test("Should work with Buffer", async () => {
                const value = Buffer.from("asd");
                await storage.add("a", -1);
                await storage.updateMany({ a: value });
                const { a: getResult } = await storage.getMany<Buffer, string>([
                    "a",
                ]);
                expect(getResult).toBeInstanceOf(Buffer);
                expect(getResult?.toString("base64")).toEqual(
                    value.toString("base64"),
                );
            });
            test("Should work with Uint8Array", async () => {
                const value = new Uint8Array(Buffer.from("asd"));
                await storage.add("a", -1);
                await storage.updateMany({ a: value });
                const { a: getResult } = await storage.getMany<
                    Uint8Array,
                    string
                >(["a"]);
                expect(getResult).toBeInstanceOf(Uint8Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int8Array", async () => {
                const value = new Int8Array(Buffer.from("asd"));
                await storage.add("a", -1);
                await storage.updateMany({ a: value });
                const { a: getResult } = await storage.getMany<
                    Int8Array,
                    string
                >(["a"]);
                expect(getResult).toBeInstanceOf(Int8Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Uint16Array", async () => {
                const value = new Uint16Array(Buffer.from("asd"));
                await storage.add("a", -1);
                await storage.updateMany({ a: value });
                const { a: getResult } = await storage.getMany<
                    Uint16Array,
                    string
                >(["a"]);
                expect(getResult).toBeInstanceOf(Uint16Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int16Array", async () => {
                const value = new Int16Array(Buffer.from("asd"));
                await storage.add("a", -1);
                await storage.updateMany({ a: value });
                const { a: getResult } = await storage.getMany<
                    Int16Array,
                    string
                >(["a"]);
                expect(getResult).toBeInstanceOf(Int16Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Uint32Array", async () => {
                const value = new Uint32Array(Buffer.from("asd"));
                await storage.add("a", -1);
                await storage.updateMany({ a: value });
                const { a: getResult } = await storage.getMany<
                    Uint32Array,
                    string
                >(["a"]);
                expect(getResult).toBeInstanceOf(Uint32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int32Array", async () => {
                const value = new Int32Array(Buffer.from("asd"));
                await storage.add("a", -1);
                await storage.updateMany({ a: value });
                const { a: getResult } = await storage.getMany<
                    Int32Array,
                    string
                >(["a"]);
                expect(getResult).toBeInstanceOf(Int32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Float32Array", async () => {
                const value = new Float32Array(Buffer.from("asd"));
                await storage.add("a", -1);
                await storage.updateMany({ a: value });
                const { a: getResult } = await storage.getMany<
                    Float32Array,
                    string
                >(["a"]);
                expect(getResult).toBeInstanceOf(Float32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Float64Array", async () => {
                const value = new Float64Array(Buffer.from("asd"));
                await storage.add("a", -1);
                await storage.updateMany({ a: value });
                const { a: getResult } = await storage.getMany<
                    Float64Array,
                    string
                >(["a"]);
                expect(getResult).toBeInstanceOf(Float64Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Set", async () => {
                const value = new Set(["a", "b", "c"]);
                await storage.add("a", -1);
                await storage.updateMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
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
                await storage.add("a", -1);
                await storage.updateMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Set);
                expect(getResult).toEqual(value);
            });
            test("Should work with Map", async () => {
                const value = new Map([
                    ["a", 1],
                    ["b", 2],
                    ["c", 3],
                ]);
                await storage.add("a", -1);
                await storage.updateMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
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
                await storage.add("a", -1);
                await storage.updateMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
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
                await storage.add("a", -1);
                await storage.updateMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
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
                await storage.add("a", -1);
                await storage.updateMany({ a: value });
                const getResult = await storage.getMany(["a"]);
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
                await storage.add("a", -1);
                await storage.updateMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
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
                await storage.add("a", -1);
                await storage.updateMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
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
                await storage.add("a", -1);
                await storage.updateMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
                expect(getResult).toEqual(value);
            });
        });
        describe("method: put", () => {
            test("Should work with positive integer", async () => {
                const value = 1;
                await storage.put("a", value);
                expect(await storage.get("a")).toBe(value);
            });
            test("Should work with negative integer", async () => {
                const value = -1;
                await storage.put("a", value);
                expect(await storage.get("a")).toBe(value);
            });
            test("Should work with positive decimal", async () => {
                const value = 1.5;
                await storage.put("a", value);
                expect(await storage.get("a")).toBe(value);
            });
            test("Should work with negative decimal", async () => {
                const value = -1.5;
                await storage.put("a", value);
                expect(await storage.get("a")).toBe(value);
            });
            test("Should work with NaN", async () => {
                const value = NaN;
                await storage.put("a", value);
                const getResult = await storage.get("a");
                expect(getResult).toBeNaN();
            });
            test("Should work with Infinity", async () => {
                const value = Infinity;
                await storage.put("a", value);
                const getResult = await storage.get("a");
                expect(isFinite(getResult as number)).toBe(false);
            });
            test("Should work with Bigint", async () => {
                const value = 20n;
                await storage.put("a", value);
                expect(await storage.get("a")).toBe(value);
            });
            test("Should work with true", async () => {
                const value = true;
                await storage.put("a", value);
                expect(await storage.get("a")).toBe(value);
            });
            test("Should work with false", async () => {
                const value = false;
                await storage.put("a", value);
                expect(await storage.get("a")).toBe(value);
            });
            test("Should work with string", async () => {
                const value = "str";
                await storage.put("a", value);
                expect(await storage.get("a")).toBe(value);
            });
            test("Should work with Date", async () => {
                const value = new Date("2024-01-01");
                await storage.put("a", value);
                const getResult = await storage.get("a");
                expect(getResult).toBeInstanceOf(Date);
                expect(getResult).toEqual(value);
            });
            test("Should work with RegExp", async () => {
                const value = /test/;
                await storage.put("a", value);
                const getResult = await storage.get("a");
                expect(getResult).toBeInstanceOf(RegExp);
                expect(getResult).toEqual(value);
            });
            test("Should work with Buffer", async () => {
                const value = Buffer.from("asd");
                await storage.put("a", value);
                const getResult = await storage.get<Buffer>("a");
                expect(getResult).toBeInstanceOf(Buffer);
                expect(getResult?.toString("base64")).toEqual(
                    value.toString("base64"),
                );
            });
            test("Should work with Uint8Array", async () => {
                const value = new Uint8Array(Buffer.from("asd"));
                await storage.put("a", value);
                const getResult = await storage.get<Uint8Array>("a");
                expect(getResult).toBeInstanceOf(Uint8Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int8Array", async () => {
                const value = new Int8Array(Buffer.from("asd"));
                await storage.put("a", value);
                const getResult = await storage.get<Int8Array>("a");
                expect(getResult).toBeInstanceOf(Int8Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Uint16Array", async () => {
                const value = new Uint16Array(Buffer.from("asd"));
                await storage.put("a", value);
                const getResult = await storage.get<Uint16Array>("a");
                expect(getResult).toBeInstanceOf(Uint16Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int16Array", async () => {
                const value = new Int16Array(Buffer.from("asd"));
                await storage.put("a", value);
                const getResult = await storage.get<Int16Array>("a");
                expect(getResult).toBeInstanceOf(Int16Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Uint32Array", async () => {
                const value = new Uint32Array(Buffer.from("asd"));
                await storage.put("a", value);
                const getResult = await storage.get<Uint32Array>("a");
                expect(getResult).toBeInstanceOf(Uint32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int32Array", async () => {
                const value = new Int32Array(Buffer.from("asd"));
                await storage.put("a", value);
                const getResult = await storage.get<Int32Array>("a");
                expect(getResult).toBeInstanceOf(Int32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Float32Array", async () => {
                const value = new Float32Array(Buffer.from("asd"));
                await storage.put("a", value);
                const getResult = await storage.get<Float32Array>("a");
                expect(getResult).toBeInstanceOf(Float32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Float64Array", async () => {
                const value = new Float64Array(Buffer.from("asd"));
                await storage.put("a", value);
                const getResult = await storage.get<Float64Array>("a");
                expect(getResult).toBeInstanceOf(Float64Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Set", async () => {
                const value = new Set(["a", "b", "c"]);
                await storage.put("a", value);
                const getResult = await storage.get("a");
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
                await storage.put("a", value);
                const getResult = await storage.get("a");
                expect(getResult).toBeInstanceOf(Set);
                expect(getResult).toEqual(value);
            });
            test("Should work with Map", async () => {
                const value = new Map([
                    ["a", 1],
                    ["b", 2],
                    ["c", 3],
                ]);
                await storage.put("a", value);
                const getResult = await storage.get("a");
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
                await storage.put("a", value);
                const getResult = await storage.get("a");
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
                await storage.put("a", value);
                const getResult = await storage.get("a");
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
                await storage.put("a", value);
                const getResult = await storage.get("a");
                expect(getResult).toEqual(value);
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
                await storage.put("a", value);
                const getResult = await storage.get("a");
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
                await storage.put("a", value);
                const getResult = await storage.get("a");
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
                await storage.put("a", value);
                const getResult = await storage.get("a");
                expect(getResult).toEqual(value);
            });
        });
        describe("method: putMany", () => {
            test("Should work with positive integer", async () => {
                const value = 1;
                await storage.putMany({ a: value });
                expect(await storage.getMany(["a"])).toEqual({ a: value });
            });
            test("Should work with negative integer", async () => {
                const value = -1;
                await storage.putMany({ a: value });
                expect(await storage.getMany(["a"])).toEqual({ a: value });
            });
            test("Should work with positive decimal", async () => {
                const value = 1.5;
                await storage.putMany({ a: value });
                expect(await storage.getMany(["a"])).toEqual({ a: value });
            });
            test("Should work with negative decimal", async () => {
                const value = -1.5;
                await storage.putMany({ a: value });
                expect(await storage.getMany(["a"])).toEqual({ a: value });
            });
            test("Should work with NaN", async () => {
                const value = NaN;
                await storage.putMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
                expect(getResult).toBeNaN();
            });
            test("Should work with Infinity", async () => {
                const value = Infinity;
                await storage.putMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
                expect(isFinite(getResult as number)).toBe(false);
            });
            test("Should work with Bigint", async () => {
                const value = 20n;
                await storage.putMany({ a: value });
                expect(await storage.getMany(["a"])).toEqual({ a: value });
            });
            test("Should work with true", async () => {
                const value = true;
                await storage.putMany({ a: value });
                expect(await storage.getMany(["a"])).toEqual({ a: value });
            });
            test("Should work with false", async () => {
                const value = false;
                await storage.putMany({ a: value });
                expect(await storage.getMany(["a"])).toEqual({ a: value });
            });
            test("Should work with string", async () => {
                const value = "str";
                await storage.putMany({ a: value });
                expect(await storage.getMany(["a"])).toEqual({ a: value });
            });
            test("Should work with Date", async () => {
                const value = new Date("2024-01-01");
                await storage.putMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Date);
                expect(getResult).toEqual(value);
            });
            test("Should work with RegExp", async () => {
                const value = /test/;
                await storage.putMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
                expect(getResult).toBeInstanceOf(RegExp);
                expect(getResult).toEqual(value);
            });
            test("Should work with Buffer", async () => {
                const value = Buffer.from("asd");
                await storage.putMany({ a: value });
                const { a: getResult } = await storage.getMany<Buffer, string>([
                    "a",
                ]);
                expect(getResult).toBeInstanceOf(Buffer);
                expect(getResult?.toString("base64")).toEqual(
                    value.toString("base64"),
                );
            });
            test("Should work with Uint8Array", async () => {
                const value = new Uint8Array(Buffer.from("asd"));
                await storage.putMany({ a: value });
                const { a: getResult } = await storage.getMany<
                    Uint8Array,
                    string
                >(["a"]);
                expect(getResult).toBeInstanceOf(Uint8Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int8Array", async () => {
                const value = new Int8Array(Buffer.from("asd"));
                await storage.putMany({ a: value });
                const { a: getResult } = await storage.getMany<
                    Int8Array,
                    string
                >(["a"]);
                expect(getResult).toBeInstanceOf(Int8Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Uint16Array", async () => {
                const value = new Uint16Array(Buffer.from("asd"));
                await storage.putMany({ a: value });
                const { a: getResult } = await storage.getMany<
                    Uint16Array,
                    string
                >(["a"]);
                expect(getResult).toBeInstanceOf(Uint16Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int16Array", async () => {
                const value = new Int16Array(Buffer.from("asd"));
                await storage.putMany({ a: value });
                const { a: getResult } = await storage.getMany<
                    Int16Array,
                    string
                >(["a"]);
                expect(getResult).toBeInstanceOf(Int16Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Uint32Array", async () => {
                const value = new Uint32Array(Buffer.from("asd"));
                await storage.putMany({ a: value });
                const { a: getResult } = await storage.getMany<
                    Uint32Array,
                    string
                >(["a"]);
                expect(getResult).toBeInstanceOf(Uint32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int32Array", async () => {
                const value = new Int32Array(Buffer.from("asd"));
                await storage.putMany({ a: value });
                const { a: getResult } = await storage.getMany<
                    Int32Array,
                    string
                >(["a"]);
                expect(getResult).toBeInstanceOf(Int32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Float32Array", async () => {
                const value = new Float32Array(Buffer.from("asd"));
                await storage.putMany({ a: value });
                const { a: getResult } = await storage.getMany<
                    Float32Array,
                    string
                >(["a"]);
                expect(getResult).toBeInstanceOf(Float32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Float64Array", async () => {
                const value = new Float64Array(Buffer.from("asd"));
                await storage.putMany({ a: value });
                const { a: getResult } = await storage.getMany<
                    Float64Array,
                    string
                >(["a"]);
                expect(getResult).toBeInstanceOf(Float64Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Set", async () => {
                const value = new Set(["a", "b", "c"]);
                await storage.putMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
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
                await storage.putMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
                expect(getResult).toBeInstanceOf(Set);
                expect(getResult).toEqual(value);
            });
            test("Should work with Map", async () => {
                const value = new Map([
                    ["a", 1],
                    ["b", 2],
                    ["c", 3],
                ]);
                await storage.putMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
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
                await storage.putMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
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
                await storage.putMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
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
                await storage.putMany({ a: value });
                const getResult = await storage.getMany(["a"]);
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
                await storage.putMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
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
                await storage.putMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
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
                await storage.putMany({ a: value });
                const { a: getResult } = await storage.getMany(["a"]);
                expect(getResult).toEqual(value);
            });
        });
        describe("method: getAndRemove", () => {
            test("Should work with positive integer", async () => {
                const value = 1;
                await storage.add("a", value);
                expect(await storage.getAndRemove("a")).toBe(value);
            });
            test("Should work with negative integer", async () => {
                const value = -1;
                await storage.add("a", value);
                expect(await storage.getAndRemove("a")).toBe(value);
            });
            test("Should work with positive decimal", async () => {
                const value = 1.5;
                await storage.add("a", value);
                expect(await storage.getAndRemove("a")).toBe(value);
            });
            test("Should work with negative decimal", async () => {
                const value = -1.5;
                await storage.add("a", value);
                expect(await storage.getAndRemove("a")).toBe(value);
            });
            test("Should work with NaN", async () => {
                const value = NaN;
                await storage.add("a", value);
                const getResult = await storage.getAndRemove("a");
                expect(getResult).toBeNaN();
            });
            test("Should work with Infinity", async () => {
                const value = Infinity;
                await storage.add("a", value);
                const getResult = await storage.getAndRemove("a");
                expect(isFinite(getResult as number)).toBe(false);
            });
            test("Should work with Bigint", async () => {
                const value = 20n;
                await storage.add("a", value);
                expect(await storage.getAndRemove("a")).toBe(value);
            });
            test("Should work with true", async () => {
                const value = true;
                await storage.add("a", value);
                expect(await storage.getAndRemove("a")).toBe(value);
            });
            test("Should work with false", async () => {
                const value = false;
                await storage.add("a", value);
                expect(await storage.getAndRemove("a")).toBe(value);
            });
            test("Should work with string", async () => {
                const value = "str";
                await storage.add("a", value);
                expect(await storage.getAndRemove("a")).toBe(value);
            });
            test("Should work with Date", async () => {
                const value = new Date("2024-01-01");
                await storage.add("a", value);
                const getResult = await storage.getAndRemove("a");
                expect(getResult).toBeInstanceOf(Date);
                expect(getResult).toEqual(value);
            });
            test("Should work with RegExp", async () => {
                const value = /test/;
                await storage.add("a", value);
                const getResult = await storage.getAndRemove("a");
                expect(getResult).toBeInstanceOf(RegExp);
                expect(getResult).toEqual(value);
            });
            test("Should work with Buffer", async () => {
                const value = Buffer.from("asd");
                await storage.add("a", value);
                const getResult = await storage.get<Buffer>("a");
                expect(getResult).toBeInstanceOf(Buffer);
                expect(getResult?.toString("base64")).toEqual(
                    value.toString("base64"),
                );
            });
            test("Should work with Uint8Array", async () => {
                const value = new Uint8Array(Buffer.from("asd"));
                await storage.add("a", value);
                const getResult = await storage.get<Uint8Array>("a");
                expect(getResult).toBeInstanceOf(Uint8Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int8Array", async () => {
                const value = new Int8Array(Buffer.from("asd"));
                await storage.add("a", value);
                const getResult = await storage.get<Int8Array>("a");
                expect(getResult).toBeInstanceOf(Int8Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Uint16Array", async () => {
                const value = new Uint16Array(Buffer.from("asd"));
                await storage.add("a", value);
                const getResult = await storage.get<Uint16Array>("a");
                expect(getResult).toBeInstanceOf(Uint16Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int16Array", async () => {
                const value = new Int16Array(Buffer.from("asd"));
                await storage.add("a", value);
                const getResult = await storage.get<Int16Array>("a");
                expect(getResult).toBeInstanceOf(Int16Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Uint32Array", async () => {
                const value = new Uint32Array(Buffer.from("asd"));
                await storage.add("a", value);
                const getResult = await storage.get<Uint32Array>("a");
                expect(getResult).toBeInstanceOf(Uint32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int32Array", async () => {
                const value = new Int32Array(Buffer.from("asd"));
                await storage.add("a", value);
                const getResult = await storage.get<Int32Array>("a");
                expect(getResult).toBeInstanceOf(Int32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Float32Array", async () => {
                const value = new Float32Array(Buffer.from("asd"));
                await storage.add("a", value);
                const getResult = await storage.get<Float32Array>("a");
                expect(getResult).toBeInstanceOf(Float32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Float64Array", async () => {
                const value = new Float64Array(Buffer.from("asd"));
                await storage.add("a", value);
                const getResult = await storage.get<Float64Array>("a");
                expect(getResult).toBeInstanceOf(Float64Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Set", async () => {
                const value = new Set(["a", "b", "c"]);
                await storage.add("a", value);
                const getResult = await storage.getAndRemove("a");
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
                await storage.add("a", value);
                const getResult = await storage.getAndRemove("a");
                expect(getResult).toBeInstanceOf(Set);
                expect(getResult).toEqual(value);
            });
            test("Should work with Map", async () => {
                const value = new Map([
                    ["a", 1],
                    ["b", 2],
                    ["c", 3],
                ]);
                await storage.add("a", value);
                const getResult = await storage.getAndRemove("a");
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
                await storage.add("a", value);
                const getResult = await storage.getAndRemove("a");
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
                await storage.add("a", value);
                const getResult = await storage.getAndRemove("a");
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
                await storage.add("a", value);
                const getResult = await storage.getAndRemove("a");
                expect(getResult).toEqual(value);
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
                await storage.add("a", value);
                const getResult = await storage.getAndRemove("a");
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
                await storage.add("a", value);
                const getResult = await storage.getAndRemove("a");
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
                await storage.add("a", value);
                const getResult = await storage.getAndRemove("a");
                expect(getResult).toEqual(value);
            });
        });
        describe("method: getOrAdd", () => {
            test("Should work with positive integer", async () => {
                const value = 1;
                await storage.getOrAdd("a", value);
                expect(await storage.getOrAdd("a", -1)).toBe(value);
            });
            test("Should work with negative integer", async () => {
                const value = -1;
                await storage.getOrAdd("a", value);
                expect(await storage.getOrAdd("a", -1)).toBe(value);
            });
            test("Should work with positive decimal", async () => {
                const value = 1.5;
                await storage.getOrAdd("a", value);
                expect(await storage.getOrAdd("a", -1)).toBe(value);
            });
            test("Should work with negative decimal", async () => {
                const value = -1.5;
                await storage.getOrAdd("a", value);
                expect(await storage.getOrAdd("a", -1)).toBe(value);
            });
            test("Should work with NaN", async () => {
                const value = NaN;
                await storage.getOrAdd("a", value);
                const getResult = await storage.getOrAdd("a", -1);
                expect(getResult).toBeNaN();
            });
            test("Should work with Infinity", async () => {
                const value = Infinity;
                await storage.getOrAdd("a", value);
                const getResult = await storage.getOrAdd("a", -1);
                expect(isFinite(getResult as number)).toBe(false);
            });
            test("Should work with Bigint", async () => {
                const value = 20n;
                await storage.getOrAdd("a", value);
                expect(await storage.getOrAdd("a", -1)).toBe(value);
            });
            test("Should work with true", async () => {
                const value = true;
                await storage.getOrAdd("a", value);
                expect(await storage.getOrAdd("a", -1)).toBe(value);
            });
            test("Should work with false", async () => {
                const value = false;
                await storage.getOrAdd("a", value);
                expect(await storage.getOrAdd("a", -1)).toBe(value);
            });
            test("Should work with string", async () => {
                const value = "str";
                await storage.getOrAdd("a", value);
                expect(await storage.getOrAdd("a", -1)).toBe(value);
            });
            test("Should work with Date", async () => {
                const value = new Date("2024-01-01");
                await storage.getOrAdd("a", value);
                const getResult = await storage.getOrAdd("a", -1);
                expect(getResult).toBeInstanceOf(Date);
                expect(getResult).toEqual(value);
            });
            test("Should work with RegExp", async () => {
                const value = /test/;
                await storage.getOrAdd("a", value);
                const getResult = await storage.getOrAdd("a", -1);
                expect(getResult).toBeInstanceOf(RegExp);
                expect(getResult).toEqual(value);
            });
            test("Should work with Buffer", async () => {
                const value = Buffer.from("asd");
                await storage.getOrAdd("a", value);
                const getResult = await storage.get<Buffer>("a");
                expect(getResult).toBeInstanceOf(Buffer);
                expect(getResult?.toString("base64")).toEqual(
                    value.toString("base64"),
                );
            });
            test("Should work with Uint8Array", async () => {
                const value = new Uint8Array(Buffer.from("asd"));
                await storage.getOrAdd("a", value);
                const getResult = await storage.get<Uint8Array>("a");
                expect(getResult).toBeInstanceOf(Uint8Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int8Array", async () => {
                const value = new Int8Array(Buffer.from("asd"));
                await storage.getOrAdd("a", value);
                const getResult = await storage.get<Int8Array>("a");
                expect(getResult).toBeInstanceOf(Int8Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Uint16Array", async () => {
                const value = new Uint16Array(Buffer.from("asd"));
                await storage.getOrAdd("a", value);
                const getResult = await storage.get<Uint16Array>("a");
                expect(getResult).toBeInstanceOf(Uint16Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int16Array", async () => {
                const value = new Int16Array(Buffer.from("asd"));
                await storage.getOrAdd("a", value);
                const getResult = await storage.get<Int16Array>("a");
                expect(getResult).toBeInstanceOf(Int16Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Uint32Array", async () => {
                const value = new Uint32Array(Buffer.from("asd"));
                await storage.getOrAdd("a", value);
                const getResult = await storage.get<Uint32Array>("a");
                expect(getResult).toBeInstanceOf(Uint32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Int32Array", async () => {
                const value = new Int32Array(Buffer.from("asd"));
                await storage.getOrAdd("a", value);
                const getResult = await storage.get<Int32Array>("a");
                expect(getResult).toBeInstanceOf(Int32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Float32Array", async () => {
                const value = new Float32Array(Buffer.from("asd"));
                await storage.getOrAdd("a", value);
                const getResult = await storage.get<Float32Array>("a");
                expect(getResult).toBeInstanceOf(Float32Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Float64Array", async () => {
                const value = new Float64Array(Buffer.from("asd"));
                await storage.getOrAdd("a", value);
                const getResult = await storage.get<Float64Array>("a");
                expect(getResult).toBeInstanceOf(Float64Array);
                expect(
                    getResult
                        ? Buffer.from(getResult).toString("base64")
                        : undefined,
                ).toEqual(Buffer.from(value).toString("base64"));
            });
            test("Should work with Set", async () => {
                const value = new Set(["a", "b", "c"]);
                await storage.getOrAdd("a", value);
                const getResult = await storage.getOrAdd("a", -1);
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
                await storage.getOrAdd("a", value);
                const getResult = await storage.getOrAdd("a", -1);
                expect(getResult).toBeInstanceOf(Set);
                expect(getResult).toEqual(value);
            });
            test("Should work with Map", async () => {
                const value = new Map([
                    ["a", 1],
                    ["b", 2],
                    ["c", 3],
                ]);
                await storage.getOrAdd("a", value);
                const getResult = await storage.getOrAdd("a", -1);
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
                await storage.getOrAdd("a", value);
                const getResult = await storage.getOrAdd("a", -1);
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
                await storage.getOrAdd("a", value);
                const getResult = await storage.getOrAdd("a", -1);
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
                await storage.getOrAdd("a", value);
                const getResult = await storage.getOrAdd("a", -1);
                expect(getResult).toEqual(value);
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
                await storage.getOrAdd("a", value);
                const getResult = await storage.getOrAdd("a", -1);
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
                await storage.getOrAdd("a", value);
                const getResult = await storage.getOrAdd("a", -1);
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
                await storage.getOrAdd("a", value);
                const getResult = await storage.getOrAdd("a", -1);
                expect(getResult).toEqual(value);
            });
        });
    });
}
