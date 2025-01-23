/**
 * @module Serde
 */

import { type TestAPI, type ExpectStatic, beforeEach } from "vitest";
import type { ISerde } from "@/serde/contracts/_module";

/**
 * @group Utilities
 */
export type SerdeSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    createAdapter: () => ISerde;
};
/**
 * @group Utilities
 */
export function serdeTestSuite(settings: SerdeSuiteSettings): void {
    const { expect, test, createAdapter } = settings;
    let serde: ISerde;
    beforeEach(() => {
        serde = createAdapter();
    });
    test("Should work with positive integer", () => {
        const value = 1;
        expect(serde.deserialize(serde.serialize(value))).toBe(value);
    });
    test("Should work with negative integer", () => {
        const value = -1;
        expect(serde.deserialize(serde.serialize(value))).toBe(value);
    });
    test("Should work with positive decimal", () => {
        const value = 1.5;
        expect(serde.deserialize(serde.serialize(value))).toBe(value);
    });
    test("Should work with negative decimal", () => {
        const value = -1.5;
        expect(serde.deserialize(serde.serialize(value))).toBe(value);
    });
    test("Should work with NaN", () => {
        const value = NaN;
        const deserializedValue = serde.deserialize(serde.serialize(value));
        expect(deserializedValue).toBeNaN();
    });
    test("Should work with Infinity", () => {
        const value = Infinity;
        const deserializedValue = serde.deserialize(serde.serialize(value));
        expect(isFinite(deserializedValue as number)).toBe(false);
    });
    test("Should work with Bigint", () => {
        const value = 20n;
        expect(serde.deserialize(serde.serialize(value))).toBe(value);
    });
    test("Should work with true", () => {
        const value = true;
        expect(serde.deserialize(serde.serialize(value))).toBe(value);
    });
    test("Should work with false", () => {
        const value = false;
        expect(serde.deserialize(serde.serialize(value))).toBe(value);
    });
    test("Should work with string", () => {
        const value = "str";
        expect(serde.deserialize(serde.serialize(value))).toBe(value);
    });
    test("Should work with Date", () => {
        const value = new Date("2024-01-01");
        const deserializedValue = serde.deserialize(serde.serialize(value));
        expect(deserializedValue).toBeInstanceOf(Date);
        expect(deserializedValue).toEqual(value);
    });
    test("Should work with RegExp", () => {
        const value = /test/;
        const deserializedValue = serde.deserialize(serde.serialize(value));
        expect(deserializedValue).toBeInstanceOf(RegExp);
        expect(deserializedValue).toEqual(value);
    });
    test("Should work with Buffer", () => {
        const value = Buffer.from("asd");
        const deserializedValue = serde.deserialize<Buffer>(
            serde.serialize(value),
        );
        expect(deserializedValue).toBeInstanceOf(Buffer);
        expect(deserializedValue.toString("base64")).toEqual(
            value.toString("base64"),
        );
    });
    test("Should work with Uint8Array", () => {
        const value = new Uint8Array(Buffer.from("asd"));
        const deserializedValue = serde.deserialize<Uint8Array>(
            serde.serialize(value),
        );
        expect(deserializedValue).toBeInstanceOf(Uint8Array);
        expect(Buffer.from(deserializedValue).toString("base64")).toEqual(
            Buffer.from(value).toString("base64"),
        );
    });
    test("Should work with Int8Array", () => {
        const value = new Int8Array(Buffer.from("asd"));
        const deserializedValue = serde.deserialize<Int8Array>(
            serde.serialize(value),
        );
        expect(deserializedValue).toBeInstanceOf(Int8Array);
        expect(Buffer.from(deserializedValue).toString("base64")).toEqual(
            Buffer.from(value).toString("base64"),
        );
    });
    test("Should work with Uint16Array", () => {
        const value = new Uint16Array(Buffer.from("asd"));
        const deserializedValue = serde.deserialize<Uint16Array>(
            serde.serialize(value),
        );
        expect(deserializedValue).toBeInstanceOf(Uint16Array);
        expect(Buffer.from(deserializedValue).toString("base64")).toEqual(
            Buffer.from(value).toString("base64"),
        );
    });
    test("Should work with Int16Array", () => {
        const value = new Int16Array(Buffer.from("asd"));
        const deserializedValue = serde.deserialize<Int16Array>(
            serde.serialize(value),
        );
        expect(deserializedValue).toBeInstanceOf(Int16Array);
        expect(Buffer.from(deserializedValue).toString("base64")).toEqual(
            Buffer.from(value).toString("base64"),
        );
    });
    test("Should work with Uint32Array", () => {
        const value = new Uint32Array(Buffer.from("asd"));
        const deserializedValue = serde.deserialize<Uint32Array>(
            serde.serialize(value),
        );
        expect(deserializedValue).toBeInstanceOf(Uint32Array);
        expect(Buffer.from(deserializedValue).toString("base64")).toEqual(
            Buffer.from(value).toString("base64"),
        );
    });
    test("Should work with Int32Array", () => {
        const value = new Int32Array(Buffer.from("asd"));
        const deserializedValue = serde.deserialize<Int32Array>(
            serde.serialize(value),
        );
        expect(deserializedValue).toBeInstanceOf(Int32Array);
        expect(Buffer.from(deserializedValue).toString("base64")).toEqual(
            Buffer.from(value).toString("base64"),
        );
    });
    test("Should work with Float32Array", () => {
        const value = new Float32Array(Buffer.from("asd"));
        const deserializedValue = serde.deserialize<Float32Array>(
            serde.serialize(value),
        );
        expect(deserializedValue).toBeInstanceOf(Float32Array);
        expect(Buffer.from(deserializedValue).toString("base64")).toEqual(
            Buffer.from(value).toString("base64"),
        );
    });
    test("Should work with Float64Array", () => {
        const value = new Float64Array(Buffer.from("asd"));
        const deserializedValue = serde.deserialize<Float64Array>(
            serde.serialize(value),
        );
        expect(deserializedValue).toBeInstanceOf(Float64Array);
        expect(Buffer.from(deserializedValue).toString("base64")).toEqual(
            Buffer.from(value).toString("base64"),
        );
    });
    test("Should work with Set", () => {
        const value = new Set(["a", "b", "c"]);
        const deserializedValue = serde.deserialize(serde.serialize(value));
        expect(deserializedValue).toBeInstanceOf(Set);
        expect(deserializedValue).toEqual(value);
    });
    test("Should work with Set of number, boolean, string, Date, Set, Map, RegExp, Objects, Arrays", () => {
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
        const deserializedValue = serde.deserialize(serde.serialize(value));
        expect(deserializedValue).toBeInstanceOf(Set);
        expect(deserializedValue).toEqual(value);
    });
    test("Should work with Map", () => {
        const value = new Map([
            ["a", 1],
            ["b", 2],
            ["c", 3],
        ]);
        const deserializedValue = serde.deserialize(serde.serialize(value));
        expect(deserializedValue).toBeInstanceOf(Map);
        expect(deserializedValue).toEqual(value);
    });
    test("Should work with Map of number, boolean, string, Date, Set, Map, RegExp, Objects, Arrays values", () => {
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
        ] as Array<[unknown, unknown]>);
        const deserializedValue = serde.deserialize(serde.serialize(value));
        expect(deserializedValue).toBeInstanceOf(Map);
        expect(deserializedValue).toEqual(value);
    });
    test("Should work with Map of number, boolean, string, Date, Set, Map, RegExp, Objects, Arrays keys", () => {
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
        ] as Array<[unknown, unknown]>);
        const deserializedValue = serde.deserialize(serde.serialize(value));
        expect(deserializedValue).toBeInstanceOf(Map);
        expect(deserializedValue).toEqual(value);
    });
    test("Should work with array of number, boolean, string, Date, Set, Map, RegExp", () => {
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
        const deserializedValue = serde.deserialize(serde.serialize(value));
        expect(deserializedValue).toEqual(value);
    });
    test("Should work with array of objects", () => {
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
            ] as Array<[unknown, unknown]>),
        ];
        const deserializedValue = serde.deserialize(serde.serialize(value));
        expect(deserializedValue).toEqual(value);
    });
    test("Should work with object of number, boolean, string, Date, Set, Map, RegExp", () => {
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
        ] as Array<[string, unknown]>);
        const deserializedValue = serde.deserialize(serde.serialize(value));
        expect(deserializedValue).toEqual(value);
    });
    test("Should work with object of arrays", () => {
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
        const deserializedValue = serde.deserialize(serde.serialize(value));
        expect(deserializedValue).toEqual(value);
    });
}
