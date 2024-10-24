/**
 * @module Cache
 */
import { RecordItem } from "@/_shared/types";
import { Cache } from "@/cache/cache";

import { type ICacheAdapter } from "@/contracts/cache/_module";
import { type ICache } from "@/contracts/cache/_module";
import {
    type TestAPI,
    type SuiteAPI,
    type beforeEach,
    type ExpectStatic,
} from "vitest";

/**
 * @group Utilities
 */
export type CacheValueTestSuite = {
    describe: SuiteAPI;
    expect: ExpectStatic;
    beforeEach: typeof beforeEach;
    test: TestAPI;
    createAdapter: () => ICacheAdapter<unknown>;
};
/**
 * @group Utilities
 */
export function cacheValueTestSuite(settings: CacheValueTestSuite) {
    const { test, expect, describe, beforeEach, createAdapter } = settings;
    let cache: ICache;
    beforeEach(() => {
        cache = new Cache(createAdapter());
    });
    describe("Value tests", () => {
        describe("method: get / add", () => {
            test("Should work with positive integer", async () => {
                const value = 1;
                await cache.add("a", value);
                expect(await cache.get("a")).toBe(value);
            });
            test("Should work with negative integer", async () => {
                const value = -1;
                await cache.add("a", value);
                expect(await cache.get("a")).toBe(value);
            });
            test("Should work with positive decimal", async () => {
                const value = 1.5;
                await cache.add("a", value);
                expect(await cache.get("a")).toBe(value);
            });
            test("Should work with negative decimal", async () => {
                const value = -1.5;
                await cache.add("a", value);
                expect(await cache.get("a")).toBe(value);
            });
            test("Should work with NaN", async () => {
                const value = NaN;
                await cache.add("a", value);
                expect(await cache.get("a")).toBeNaN();
            });
            test("Should work with Infinity", async () => {
                const value = Infinity;
                await cache.add("a", value);
                const getValue = (await cache.get("a")) as number;
                expect(isFinite(getValue)).toBe(false);
            });
            test("Should work with Bigint", async () => {
                const value = 20n;
                await cache.add("a", value);
                expect(await cache.get("a")).toBe(value);
            });
            test("Should work with true", async () => {
                const value = true;
                await cache.add("a", value);
                expect(await cache.get("a")).toBe(value);
            });
            test("Should work with false", async () => {
                const value = false;
                await cache.add("a", value);
                expect(await cache.get("a")).toBe(value);
            });
            test("Should work with string", async () => {
                const value = "str";
                await cache.add("a", value);
                expect(await cache.get("a")).toBe(value);
            });
            test("Should work with Date", async () => {
                const value = new Date("2024-01-01");
                await cache.add("a", value);
                expect(await cache.get("a")).toBeInstanceOf(Date);
                expect(await cache.get("a")).toEqual(value);
            });
            test("Should work with RegExp", async () => {
                const value = /test/;
                await cache.add("a", value);
                expect(await cache.get("a")).toBeInstanceOf(RegExp);
                expect(await cache.get("a")).toEqual(value);
            });
            test("Should work with Set", async () => {
                const value = new Set(["a", "b", "c"]);
                await cache.add("a", value);
                expect(await cache.get("a")).toBeInstanceOf(Set);
                expect(await cache.get("a")).toEqual(value);
            });
            test("Should work with Set of number, boolean, string, Date, Set, Map, RegExp", async () => {
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
                    /test/,
                ]);
                await cache.add("a", value);
                expect(await cache.get("a")).toEqual(value);
            });
            test("Should work with Map", async () => {
                const value = new Map([
                    ["a", 1],
                    ["b", 2],
                    ["c", 3],
                ]);
                await cache.add("a", value);
                expect(await cache.get("a")).toBeInstanceOf(Map);
                expect(await cache.get("a")).toEqual(value);
            });
            test("Should work with Map of number, boolean, string, Date, Set, Map, RegExp values", async () => {
                const value = new Set([
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
                ]);
                await cache.add("a", value);
                expect(await cache.get("a")).toEqual(value);
            });
            test("Should work with Map of number, boolean, string, Date, Set, Map, RegExp keys", async () => {
                const value = new Set([
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
                ]);
                await cache.add("a", value);
                expect(await cache.get("a")).toEqual(value);
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
                await cache.add("a", value);
                expect(await cache.get("a")).toEqual(value);
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
                await cache.add("a", value);
                expect(await cache.get("a")).toEqual(value);
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
                await cache.add("a", value);
                expect(await cache.get("a")).toEqual(value);
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
                await cache.add("a", value);
                expect(await cache.get("a")).toEqual(value);
            });
        });
        describe("method: getOr / put", () => {
            test("Should work with positive integer", async () => {
                const value = 1;
                await cache.put("a", value);
                expect(await cache.getOr("a", -1)).toBe(value);
            });
            test("Should work with negative integer", async () => {
                const value = -1;
                await cache.put("a", value);
                expect(await cache.getOr("a", -1)).toBe(value);
            });
            test("Should work with positive decimal", async () => {
                const value = 1.5;
                await cache.put("a", value);
                expect(await cache.getOr("a", -1)).toBe(value);
            });
            test("Should work with negative decimal", async () => {
                const value = -1.5;
                await cache.put("a", value);
                expect(await cache.getOr("a", -1)).toBe(value);
            });
            test("Should work with NaN", async () => {
                const value = NaN;
                await cache.put("a", value);
                expect(await cache.getOr("a", -1)).toBeNaN();
            });
            test("Should work with Infinity", async () => {
                const value = Infinity;
                await cache.put("a", value);
                const getValue = await cache.getOr<number, number>("a", -1);
                expect(isFinite(getValue)).toBe(false);
            });
            test("Should work with Bigint", async () => {
                const value = 20n;
                await cache.put("a", value);
                expect(await cache.getOr("a", -1)).toBe(value);
            });
            test("Should work with true", async () => {
                const value = true;
                await cache.put("a", value);
                expect(await cache.getOr("a", -1)).toBe(value);
            });
            test("Should work with false", async () => {
                const value = false;
                await cache.put("a", value);
                expect(await cache.getOr("a", -1)).toBe(value);
            });
            test("Should work with string", async () => {
                const value = "str";
                await cache.put("a", value);
                expect(await cache.getOr("a", -1)).toBe(value);
            });
            test("Should work with Date", async () => {
                const value = new Date("2024-01-01");
                await cache.put("a", value);
                expect(await cache.getOr("a", -1)).toBeInstanceOf(Date);
                expect(await cache.getOr("a", -1)).toEqual(value);
            });
            test("Should work with RegExp", async () => {
                const value = /test/;
                await cache.put("a", value);
                expect(await cache.getOr("a", -1)).toBeInstanceOf(RegExp);
                expect(await cache.getOr("a", -1)).toEqual(value);
            });
            test("Should work with Set", async () => {
                const value = new Set(["a", "b", "c"]);
                await cache.put("a", value);
                expect(await cache.getOr("a", -1)).toBeInstanceOf(Set);
                expect(await cache.getOr("a", -1)).toEqual(value);
            });
            test("Should work with Set of number, boolean, string, Date, Set, Map, RegExp", async () => {
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
                    /test/,
                ]);
                await cache.put("a", value);
                expect(await cache.getOr("a", -1)).toEqual(value);
            });
            test("Should work with Map", async () => {
                const value = new Map([
                    ["a", 1],
                    ["b", 2],
                    ["c", 3],
                ]);
                await cache.put("a", value);
                expect(await cache.getOr("a", -1)).toBeInstanceOf(Map);
                expect(await cache.getOr("a", -1)).toEqual(value);
            });
            test("Should work with Map of number, boolean, string, Date, Set, Map, RegExp values", async () => {
                const value = new Set([
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
                ]);
                await cache.put("a", value);
                expect(await cache.getOr("a", -1)).toEqual(value);
            });
            test("Should work with Map of number, boolean, string, Date, Set, Map, RegExp keys", async () => {
                const value = new Set([
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
                ]);
                await cache.put("a", value);
                expect(await cache.getOr("a", -1)).toEqual(value);
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
                await cache.put("a", value);
                expect(await cache.getOr("a", -1)).toEqual(value);
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
                await cache.put("a", value);
                expect(await cache.getOr("a", -1)).toEqual(value);
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
                await cache.put("a", value);
                expect(await cache.getOr("a", -1)).toEqual(value);
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
                await cache.put("a", value);
                expect(await cache.getOr("a", -1)).toEqual(value);
            });
        });
        describe("method: getMany / addMany", () => {
            test("Should work with positive integer", async () => {
                const value = 1;
                await cache.addMany({
                    a: {
                        value,
                    },
                });
                expect(await cache.getMany(["a"])).toEqual({
                    a: value,
                });
            });
            test("Should work with negative integer", async () => {
                const value = -1;
                await cache.addMany({
                    a: {
                        value,
                    },
                });
                expect(await cache.getMany(["a"])).toEqual({
                    a: value,
                });
            });
            test("Should work with positive decimal", async () => {
                const value = 1.5;
                await cache.addMany({
                    a: {
                        value,
                    },
                });
                expect(await cache.getMany(["a"])).toEqual({
                    a: value,
                });
            });
            test("Should work with negative decimal", async () => {
                const value = -1.5;
                await cache.addMany({
                    a: {
                        value,
                    },
                });
                expect(await cache.getMany(["a"])).toEqual({
                    a: value,
                });
            });
            test("Should work with NaN", async () => {
                const value = NaN;
                await cache.addMany({
                    a: {
                        value,
                    },
                });
                const getValue = await cache.getMany(["a"]);
                expect(getValue["a"]).toBeNaN();
            });
            test("Should work with Infinity", async () => {
                const value = Infinity;
                await cache.addMany({
                    a: {
                        value,
                    },
                });
                const getValue = await cache.getMany(["a"]);
                expect(isFinite(getValue["a"] as number)).toBe(false);
            });
            test("Should work with Bigint", async () => {
                const value = 20n;
                await cache.addMany({
                    a: {
                        value,
                    },
                });
                expect(await cache.getMany(["a"])).toEqual({
                    a: value,
                });
            });
            test("Should work with true", async () => {
                const value = true;
                await cache.addMany({
                    a: {
                        value,
                    },
                });
                expect(await cache.getMany(["a"])).toEqual({
                    a: value,
                });
            });
            test("Should work with false", async () => {
                const value = false;
                await cache.addMany({
                    a: {
                        value,
                    },
                });
                expect(await cache.getMany(["a"])).toEqual({
                    a: value,
                });
            });
            test("Should work with string", async () => {
                const value = "str";
                await cache.addMany({
                    a: {
                        value,
                    },
                });
                expect(await cache.getMany(["a"])).toEqual({
                    a: value,
                });
            });
            test("Should work with Date", async () => {
                const value = new Date("2024-01-01");
                await cache.addMany({
                    a: {
                        value,
                    },
                });
                const getValue = await cache.getMany(["a"]);
                expect(getValue["a"]).toBeInstanceOf(Date);
                expect(getValue).toEqual({
                    a: value,
                });
            });
            test("Should work with RegExp", async () => {
                const value = /test/;
                await cache.addMany({
                    a: {
                        value,
                    },
                });
                const getValue = await cache.getMany(["a"]);
                expect(getValue["a"]).toBeInstanceOf(RegExp);
                expect(getValue).toEqual({
                    a: value,
                });
            });
            test("Should work with Set", async () => {
                const value = new Set(["a", "b", "c"]);
                await cache.addMany({
                    a: {
                        value,
                    },
                });
                const getValue = await cache.getMany(["a"]);
                expect(getValue["a"]).toBeInstanceOf(Set);
                expect(getValue).toEqual({
                    a: value,
                });
            });
            test("Should work with Set of number, boolean, string, Date, Set, Map, RegExp", async () => {
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
                    /test/,
                ]);
                await cache.addMany({
                    a: {
                        value,
                    },
                });
                expect(await cache.getMany(["a"])).toEqual({
                    a: value,
                });
            });
            test("Should work with Map", async () => {
                const value = new Map([
                    ["a", 1],
                    ["b", 2],
                    ["c", 3],
                ]);
                await cache.addMany({
                    a: {
                        value,
                    },
                });
                const getValue = await cache.getMany(["a"]);
                expect(getValue["a"]).toBeInstanceOf(Map);
                expect(getValue).toEqual({
                    a: value,
                });
            });
            test("Should work with Map of number, boolean, string, Date, Set, Map, RegExp values", async () => {
                const value = new Set([
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
                ]);
                await cache.addMany({
                    a: {
                        value,
                    },
                });
                expect(await cache.getMany(["a"])).toEqual({
                    a: value,
                });
            });
            test("Should work with Map of number, boolean, string, Date, Set, Map, RegExp keys", async () => {
                const value = new Set([
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
                ]);
                await cache.addMany({
                    a: {
                        value,
                    },
                });
                expect(await cache.getMany(["a"])).toEqual({
                    a: value,
                });
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
                await cache.addMany({
                    a: {
                        value,
                    },
                });
                expect(await cache.getMany(["a"])).toEqual({
                    a: value,
                });
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
                await cache.addMany({
                    a: {
                        value,
                    },
                });
                expect(await cache.getMany(["a"])).toEqual({
                    a: value,
                });
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
                await cache.addMany({
                    a: {
                        value,
                    },
                });
                expect(await cache.getMany(["a"])).toEqual({
                    a: value,
                });
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
                await cache.addMany({
                    a: {
                        value,
                    },
                });
                expect(await cache.getMany(["a"])).toEqual({
                    a: value,
                });
            });
        });
        describe("method: getOrMany / putMany", () => {
            test("Should work with positive integer", async () => {
                const value = 1;
                await cache.putMany({
                    a: {
                        value,
                    },
                });
                expect(
                    await cache.getOrMany({
                        a: -1,
                    }),
                ).toEqual({
                    a: value,
                });
            });
            test("Should work with negative integer", async () => {
                const value = -1;
                await cache.putMany({
                    a: {
                        value,
                    },
                });
                expect(
                    await cache.getOrMany({
                        a: -1,
                    }),
                ).toEqual({
                    a: value,
                });
            });
            test("Should work with positive decimal", async () => {
                const value = 1.5;
                await cache.putMany({
                    a: {
                        value,
                    },
                });
                expect(
                    await cache.getOrMany({
                        a: -1,
                    }),
                ).toEqual({
                    a: value,
                });
            });
            test("Should work with negative decimal", async () => {
                const value = -1.5;
                await cache.putMany({
                    a: {
                        value,
                    },
                });
                expect(
                    await cache.getOrMany({
                        a: -1,
                    }),
                ).toEqual({
                    a: value,
                });
            });
            test("Should work with NaN", async () => {
                const value = NaN;
                await cache.putMany({
                    a: {
                        value,
                    },
                });
                const getValue = await cache.getOrMany({
                    a: -1,
                });
                expect(getValue["a"]).toBeNaN();
            });
            test("Should work with Infinity", async () => {
                const value = Infinity;
                await cache.putMany({
                    a: {
                        value,
                    },
                });
                const getValue = await cache.getOrMany({
                    a: -1,
                });
                expect(isFinite(getValue["a"] as number)).toBe(false);
            });
            test("Should work with Bigint", async () => {
                const value = 20n;
                await cache.putMany({
                    a: {
                        value,
                    },
                });
                expect(
                    await cache.getOrMany({
                        a: -1,
                    }),
                ).toEqual({
                    a: value,
                });
            });
            test("Should work with true", async () => {
                const value = true;
                await cache.putMany({
                    a: {
                        value,
                    },
                });
                expect(
                    await cache.getOrMany({
                        a: -1,
                    }),
                ).toEqual({
                    a: value,
                });
            });
            test("Should work with false", async () => {
                const value = false;
                await cache.putMany({
                    a: {
                        value,
                    },
                });
                expect(
                    await cache.getOrMany({
                        a: -1,
                    }),
                ).toEqual({
                    a: value,
                });
            });
            test("Should work with string", async () => {
                const value = "str";
                await cache.putMany({
                    a: {
                        value,
                    },
                });
                expect(
                    await cache.getOrMany({
                        a: -1,
                    }),
                ).toEqual({
                    a: value,
                });
            });
            test("Should work with Date", async () => {
                const value = new Date("2024-01-01");
                await cache.putMany({
                    a: {
                        value,
                    },
                });
                const getValue = await cache.getOrMany({
                    a: -1,
                });
                expect(getValue["a"]).toBeInstanceOf(Date);
                expect(getValue).toEqual({
                    a: value,
                });
            });
            test("Should work with RegExp", async () => {
                const value = /test/;
                await cache.putMany({
                    a: {
                        value,
                    },
                });
                const getValue = await cache.getOrMany({
                    a: -1,
                });
                expect(getValue["a"]).toBeInstanceOf(RegExp);
                expect(getValue).toEqual({
                    a: value,
                });
            });
            test("Should work with Set", async () => {
                const value = new Set(["a", "b", "c"]);
                await cache.putMany({
                    a: {
                        value,
                    },
                });
                const getValue = await cache.getOrMany({
                    a: -1,
                });
                expect(getValue["a"]).toBeInstanceOf(Set);
                expect(getValue).toEqual({
                    a: value,
                });
            });
            test("Should work with Set of number, boolean, string, Date, Set, Map, RegExp", async () => {
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
                    /test/,
                ]);
                await cache.putMany({
                    a: {
                        value,
                    },
                });
                expect(
                    await cache.getOrMany({
                        a: -1,
                    }),
                ).toEqual({
                    a: value,
                });
            });
            test("Should work with Map", async () => {
                const value = new Map([
                    ["a", 1],
                    ["b", 2],
                    ["c", 3],
                ]);
                await cache.putMany({
                    a: {
                        value,
                    },
                });
                const getValue = await cache.getOrMany({
                    a: -1,
                });
                expect(getValue["a"]).toBeInstanceOf(Map);
                expect(getValue).toEqual({
                    a: value,
                });
            });
            test("Should work with Map of number, boolean, string, Date, Set, Map, RegExp values", async () => {
                const value = new Set([
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
                ]);
                await cache.putMany({
                    a: {
                        value,
                    },
                });
                expect(
                    await cache.getOrMany({
                        a: -1,
                    }),
                ).toEqual({
                    a: value,
                });
            });
            test("Should work with Map of number, boolean, string, Date, Set, Map, RegExp keys", async () => {
                const value = new Set([
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
                ]);
                await cache.putMany({
                    a: {
                        value,
                    },
                });
                expect(
                    await cache.getOrMany({
                        a: -1,
                    }),
                ).toEqual({
                    a: value,
                });
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
                await cache.putMany({
                    a: {
                        value,
                    },
                });
                expect(
                    await cache.getOrMany({
                        a: -1,
                    }),
                ).toEqual({
                    a: value,
                });
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
                await cache.putMany({
                    a: {
                        value,
                    },
                });
                expect(
                    await cache.getOrMany({
                        a: -1,
                    }),
                ).toEqual({
                    a: value,
                });
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
                await cache.putMany({
                    a: {
                        value,
                    },
                });
                expect(
                    await cache.getOrMany({
                        a: -1,
                    }),
                ).toEqual({
                    a: value,
                });
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
                await cache.putMany({
                    a: {
                        value,
                    },
                });
                expect(
                    await cache.getOrMany({
                        a: -1,
                    }),
                ).toEqual({
                    a: value,
                });
            });
        });
        describe("method: getAndRemove / add", () => {
            test("Should work with positive integer", async () => {
                const value = 1;
                await cache.add("a", value);
                expect(await cache.getAndRemove("a")).toBe(value);
            });
            test("Should work with negative integer", async () => {
                const value = -1;
                await cache.add("a", value);
                expect(await cache.getAndRemove("a")).toBe(value);
            });
            test("Should work with positive decimal", async () => {
                const value = 1.5;
                await cache.add("a", value);
                expect(await cache.getAndRemove("a")).toBe(value);
            });
            test("Should work with negative decimal", async () => {
                const value = -1.5;
                await cache.add("a", value);
                expect(await cache.getAndRemove("a")).toBe(value);
            });
            test("Should work with NaN", async () => {
                const value = NaN;
                await cache.add("a", value);
                expect(await cache.getAndRemove("a")).toBeNaN();
            });
            test("Should work with Infinity", async () => {
                const value = Infinity;
                await cache.add("a", value);
                const getValue = (await cache.getAndRemove("a")) as number;
                expect(isFinite(getValue)).toBe(false);
            });
            test("Should work with Bigint", async () => {
                const value = 20n;
                await cache.add("a", value);
                expect(await cache.getAndRemove("a")).toBe(value);
            });
            test("Should work with true", async () => {
                const value = true;
                await cache.add("a", value);
                expect(await cache.getAndRemove("a")).toBe(value);
            });
            test("Should work with false", async () => {
                const value = false;
                await cache.add("a", value);
                expect(await cache.getAndRemove("a")).toBe(value);
            });
            test("Should work with string", async () => {
                const value = "str";
                await cache.add("a", value);
                expect(await cache.getAndRemove("a")).toBe(value);
            });
            test("Should work with Date", async () => {
                const value = new Date("2024-01-01");
                await cache.add("a", value);
                const getValue = await cache.getAndRemove("a");
                expect(getValue).toBeInstanceOf(Date);
                expect(getValue).toEqual(value);
            });
            test("Should work with RegExp", async () => {
                const value = /test/;
                await cache.add("a", value);
                const getValue = await cache.getAndRemove("a");
                expect(getValue).toBeInstanceOf(RegExp);
                expect(getValue).toEqual(value);
            });
            test("Should work with Set", async () => {
                const value = new Set(["a", "b", "c"]);
                await cache.add("a", value);
                const getValue = await cache.getAndRemove("a");
                expect(getValue).toBeInstanceOf(Set);
                expect(getValue).toEqual(value);
            });
            test("Should work with Set of number, boolean, string, Date, Set, Map, RegExp", async () => {
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
                    /test/,
                ]);
                await cache.add("a", value);
                expect(await cache.getAndRemove("a")).toEqual(value);
            });
            test("Should work with Map", async () => {
                const value = new Map([
                    ["a", 1],
                    ["b", 2],
                    ["c", 3],
                ]);
                await cache.add("a", value);
                const getValue = await cache.getAndRemove("a");
                expect(getValue).toBeInstanceOf(Map);
                expect(getValue).toEqual(value);
            });
            test("Should work with Map of number, boolean, string, Date, Set, Map, RegExp values", async () => {
                const value = new Set([
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
                ]);
                await cache.add("a", value);
                expect(await cache.getAndRemove("a")).toEqual(value);
            });
            test("Should work with Map of number, boolean, string, Date, Set, Map, RegExp keys", async () => {
                const value = new Set([
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
                ]);
                await cache.add("a", value);
                expect(await cache.getAndRemove("a")).toEqual(value);
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
                await cache.add("a", value);
                expect(await cache.getAndRemove("a")).toEqual(value);
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
                await cache.add("a", value);
                expect(await cache.getAndRemove("a")).toEqual(value);
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
                await cache.add("a", value);
                expect(await cache.getAndRemove("a")).toEqual(value);
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
                await cache.add("a", value);
                expect(await cache.getAndRemove("a")).toEqual(value);
            });
        });
        describe("method: getOrAdd", () => {
            test("Should work with positive integer", async () => {
                const value = 1;
                await cache.getOrAdd("a", value);
                expect(await cache.getOrAdd("a", -1)).toBe(value);
            });
            test("Should work with negative integer", async () => {
                const value = -1;
                await cache.getOrAdd("a", value);
                expect(await cache.getOrAdd("a", -1)).toBe(value);
            });
            test("Should work with positive decimal", async () => {
                const value = 1.5;
                await cache.getOrAdd("a", value);
                expect(await cache.getOrAdd("a", -1)).toBe(value);
            });
            test("Should work with negative decimal", async () => {
                const value = -1.5;
                await cache.getOrAdd("a", value);
                expect(await cache.getOrAdd("a", -1)).toBe(value);
            });
            test("Should work with NaN", async () => {
                const value = NaN;
                await cache.getOrAdd("a", value);
                expect(await cache.getOrAdd("a", -1)).toBeNaN();
            });
            test("Should work with Infinity", async () => {
                const value = Infinity;
                await cache.getOrAdd("a", value);
                const getValue = await cache.getOrAdd<number, number>("a", -1);
                expect(isFinite(getValue)).toBe(false);
            });
            test("Should work with Bigint", async () => {
                const value = 20n;
                await cache.getOrAdd("a", value);
                expect(await cache.getOrAdd("a", -1)).toBe(value);
            });
            test("Should work with true", async () => {
                const value = true;
                await cache.getOrAdd("a", value);
                expect(await cache.getOrAdd("a", -1)).toBe(value);
            });
            test("Should work with false", async () => {
                const value = false;
                await cache.getOrAdd("a", value);
                expect(await cache.getOrAdd("a", -1)).toBe(value);
            });
            test("Should work with string", async () => {
                const value = "str";
                await cache.getOrAdd("a", value);
                expect(await cache.getOrAdd("a", -1)).toBe(value);
            });
            test("Should work with Date", async () => {
                const value = new Date("2024-01-01");
                await cache.getOrAdd("a", value);
                expect(await cache.getOrAdd("a", -1)).toBeInstanceOf(Date);
                expect(await cache.getOrAdd("a", -1)).toEqual(value);
            });
            test("Should work with RegExp", async () => {
                const value = /test/;
                await cache.getOrAdd("a", value);
                expect(await cache.getOrAdd("a", -1)).toBeInstanceOf(RegExp);
                expect(await cache.getOrAdd("a", -1)).toEqual(value);
            });
            test("Should work with Set", async () => {
                const value = new Set(["a", "b", "c"]);
                await cache.getOrAdd("a", value);
                expect(await cache.getOrAdd("a", -1)).toBeInstanceOf(Set);
                expect(await cache.getOrAdd("a", -1)).toEqual(value);
            });
            test("Should work with Set of number, boolean, string, Date, Set, Map, RegExp", async () => {
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
                    /test/,
                ]);
                await cache.getOrAdd("a", value);
                expect(await cache.getOrAdd("a", -1)).toEqual(value);
            });
            test("Should work with Map", async () => {
                const value = new Map([
                    ["a", 1],
                    ["b", 2],
                    ["c", 3],
                ]);
                await cache.getOrAdd("a", value);
                expect(await cache.getOrAdd("a", -1)).toBeInstanceOf(Map);
                expect(await cache.getOrAdd("a", -1)).toEqual(value);
            });
            test("Should work with Map of number, boolean, string, Date, Set, Map, RegExp values", async () => {
                const value = new Set([
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
                ]);
                await cache.getOrAdd("a", value);
                expect(await cache.getOrAdd("a", -1)).toEqual(value);
            });
            test("Should work with Map of number, boolean, string, Date, Set, Map, RegExp keys", async () => {
                const value = new Set([
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
                ]);
                await cache.getOrAdd("a", value);
                expect(await cache.getOrAdd("a", -1)).toEqual(value);
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
                await cache.getOrAdd("a", value);
                expect(await cache.getOrAdd("a", -1)).toEqual(value);
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
                await cache.getOrAdd("a", value);
                expect(await cache.getOrAdd("a", -1)).toEqual(value);
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
                await cache.getOrAdd("a", value);
                expect(await cache.getOrAdd("a", -1)).toEqual(value);
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
                await cache.getOrAdd("a", value);
                expect(await cache.getOrAdd("a", -1)).toEqual(value);
            });
        });
    });
}
