/**
 * @module Serializer
 */

import { type TestAPI, type ExpectStatic } from "vitest";
import { type ISerializer } from "@/serializer/contracts/_module";
import { type Promisable } from "@/utilities/_module";

/**
 * @group Utilities
 */
export type SerializerSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    createAdapter: () => Promisable<ISerializer>;
};
/**
 * @group Utilities
 */
export function serializerTestSuite(settings: SerializerSuiteSettings): void {
    const { expect, test, createAdapter } = settings;
    test("Should work with positive integer", async () => {
        const serializer = await createAdapter();
        const value = 1;
        expect(
            await serializer.deserialize(await serializer.serialize(value)),
        ).toBe(value);
    });
    test("Should work with negative integer", async () => {
        const serializer = await createAdapter();
        const value = -1;
        expect(
            await serializer.deserialize(await serializer.serialize(value)),
        ).toBe(value);
    });
    test("Should work with positive decimal", async () => {
        const serializer = await createAdapter();
        const value = 1.5;
        expect(
            await serializer.deserialize(await serializer.serialize(value)),
        ).toBe(value);
    });
    test("Should work with negative decimal", async () => {
        const serializer = await createAdapter();
        const value = -1.5;
        expect(
            await serializer.deserialize(await serializer.serialize(value)),
        ).toBe(value);
    });
    test("Should work with NaN", async () => {
        const serializer = await createAdapter();
        const value = NaN;
        const deserializedValue = await serializer.deserialize(
            await serializer.serialize(value),
        );
        expect(deserializedValue).toBeNaN();
    });
    test("Should work with Infinity", async () => {
        const serializer = await createAdapter();
        const value = Infinity;
        const deserializedValue = await serializer.deserialize(
            await serializer.serialize(value),
        );
        expect(isFinite(deserializedValue as number)).toBe(false);
    });
    test("Should work with Bigint", async () => {
        const serializer = await createAdapter();
        const value = 20n;
        expect(
            await serializer.deserialize(await serializer.serialize(value)),
        ).toBe(value);
    });
    test("Should work with true", async () => {
        const serializer = await createAdapter();
        const value = true;
        expect(
            await serializer.deserialize(await serializer.serialize(value)),
        ).toBe(value);
    });
    test("Should work with false", async () => {
        const serializer = await createAdapter();
        const value = false;
        expect(
            await serializer.deserialize(await serializer.serialize(value)),
        ).toBe(value);
    });
    test("Should work with string", async () => {
        const serializer = await createAdapter();
        const value = "str";
        expect(
            await serializer.deserialize(await serializer.serialize(value)),
        ).toBe(value);
    });
    test("Should work with Date", async () => {
        const serializer = await createAdapter();
        const value = new Date("2024-01-01");
        const deserializedValue = await serializer.deserialize(
            await serializer.serialize(value),
        );
        expect(deserializedValue).toBeInstanceOf(Date);
        expect(deserializedValue).toEqual(value);
    });
    test("Should work with RegExp", async () => {
        const serializer = await createAdapter();
        const value = /test/;
        const deserializedValue = await serializer.deserialize(
            await serializer.serialize(value),
        );
        expect(deserializedValue).toBeInstanceOf(RegExp);
        expect(deserializedValue).toEqual(value);
    });
    test("Should work with Buffer", async () => {
        const serializer = await createAdapter();
        const value = Buffer.from("asd");
        const deserializedValue = await serializer.deserialize<Buffer>(
            await serializer.serialize(value),
        );
        expect(deserializedValue).toBeInstanceOf(Buffer);
        expect(deserializedValue.toString("base64")).toEqual(
            value.toString("base64"),
        );
    });
    test("Should work with Uint8Array", async () => {
        const serializer = await createAdapter();
        const value = new Uint8Array(Buffer.from("asd"));
        const deserializedValue = await serializer.deserialize<Uint8Array>(
            await serializer.serialize(value),
        );
        expect(deserializedValue).toBeInstanceOf(Uint8Array);
        expect(Buffer.from(deserializedValue).toString("base64")).toEqual(
            Buffer.from(value).toString("base64"),
        );
    });
    test("Should work with Int8Array", async () => {
        const serializer = await createAdapter();
        const value = new Int8Array(Buffer.from("asd"));
        const deserializedValue = await serializer.deserialize<Int8Array>(
            await serializer.serialize(value),
        );
        expect(deserializedValue).toBeInstanceOf(Int8Array);
        expect(Buffer.from(deserializedValue).toString("base64")).toEqual(
            Buffer.from(value).toString("base64"),
        );
    });
    test("Should work with Uint16Array", async () => {
        const serializer = await createAdapter();
        const value = new Uint16Array(Buffer.from("asd"));
        const deserializedValue = await serializer.deserialize<Uint16Array>(
            await serializer.serialize(value),
        );
        expect(deserializedValue).toBeInstanceOf(Uint16Array);
        expect(Buffer.from(deserializedValue).toString("base64")).toEqual(
            Buffer.from(value).toString("base64"),
        );
    });
    test("Should work with Int16Array", async () => {
        const serializer = await createAdapter();
        const value = new Int16Array(Buffer.from("asd"));
        const deserializedValue = await serializer.deserialize<Int16Array>(
            await serializer.serialize(value),
        );
        expect(deserializedValue).toBeInstanceOf(Int16Array);
        expect(Buffer.from(deserializedValue).toString("base64")).toEqual(
            Buffer.from(value).toString("base64"),
        );
    });
    test("Should work with Uint32Array", async () => {
        const serializer = await createAdapter();
        const value = new Uint32Array(Buffer.from("asd"));
        const deserializedValue = await serializer.deserialize<Uint32Array>(
            await serializer.serialize(value),
        );
        expect(deserializedValue).toBeInstanceOf(Uint32Array);
        expect(Buffer.from(deserializedValue).toString("base64")).toEqual(
            Buffer.from(value).toString("base64"),
        );
    });
    test("Should work with Int32Array", async () => {
        const serializer = await createAdapter();
        const value = new Int32Array(Buffer.from("asd"));
        const deserializedValue = await serializer.deserialize<Int32Array>(
            await serializer.serialize(value),
        );
        expect(deserializedValue).toBeInstanceOf(Int32Array);
        expect(Buffer.from(deserializedValue).toString("base64")).toEqual(
            Buffer.from(value).toString("base64"),
        );
    });
    test("Should work with Float32Array", async () => {
        const serializer = await createAdapter();
        const value = new Float32Array(Buffer.from("asd"));
        const deserializedValue = await serializer.deserialize<Float32Array>(
            await serializer.serialize(value),
        );
        expect(deserializedValue).toBeInstanceOf(Float32Array);
        expect(Buffer.from(deserializedValue).toString("base64")).toEqual(
            Buffer.from(value).toString("base64"),
        );
    });
    test("Should work with Float64Array", async () => {
        const serializer = await createAdapter();
        const value = new Float64Array(Buffer.from("asd"));
        const deserializedValue = await serializer.deserialize<Float64Array>(
            await serializer.serialize(value),
        );
        expect(deserializedValue).toBeInstanceOf(Float64Array);
        expect(Buffer.from(deserializedValue).toString("base64")).toEqual(
            Buffer.from(value).toString("base64"),
        );
    });
    test("Should work with Set", async () => {
        const serializer = await createAdapter();

        const value = new Set(["a", "b", "c"]);
        const deserializedValue = await serializer.deserialize(
            await serializer.serialize(value),
        );
        expect(deserializedValue).toBeInstanceOf(Set);
        expect(deserializedValue).toEqual(value);
    });
    test("Should work with Set of number, boolean, string, Date, Set, Map, RegExp, Objects, Arrays", async () => {
        const serializer = await createAdapter();
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
        const deserializedValue = await serializer.deserialize(
            await serializer.serialize(value),
        );
        expect(deserializedValue).toBeInstanceOf(Set);
        expect(deserializedValue).toEqual(value);
    });
    test("Should work with Map", async () => {
        const serializer = await createAdapter();
        const value = new Map([
            ["a", 1],
            ["b", 2],
            ["c", 3],
        ]);
        const deserializedValue = await serializer.deserialize(
            await serializer.serialize(value),
        );
        expect(deserializedValue).toBeInstanceOf(Map);
        expect(deserializedValue).toEqual(value);
    });
    test("Should work with Map of number, boolean, string, Date, Set, Map, RegExp, Objects, Arrays values", async () => {
        const serializer = await createAdapter();
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
        const deserializedValue = await serializer.deserialize(
            await serializer.serialize(value),
        );
        expect(deserializedValue).toBeInstanceOf(Map);
        expect(deserializedValue).toEqual(value);
    });
    test("Should work with Map of number, boolean, string, Date, Set, Map, RegExp, Objects, Arrays keys", async () => {
        const serializer = await createAdapter();
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
        const deserializedValue = await serializer.deserialize(
            await serializer.serialize(value),
        );
        expect(deserializedValue).toBeInstanceOf(Map);
        expect(deserializedValue).toEqual(value);
    });
    test("Should work with array of number, boolean, string, Date, Set, Map, RegExp", async () => {
        const serializer = await createAdapter();
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
        const deserializedValue = await serializer.deserialize(
            await serializer.serialize(value),
        );
        expect(deserializedValue).toEqual(value);
    });
    test("Should work with array of objects", async () => {
        const serializer = await createAdapter();
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
        const deserializedValue = await serializer.deserialize(
            await serializer.serialize(value),
        );
        expect(deserializedValue).toEqual(value);
    });
    test("Should work with object of number, boolean, string, Date, Set, Map, RegExp", async () => {
        const serializer = await createAdapter();
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
        const deserializedValue = await serializer.deserialize(
            await serializer.serialize(value),
        );
        expect(deserializedValue).toEqual(value);
    });
    test("Should work with object of arrays", async () => {
        const serializer = await createAdapter();
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
        const deserializedValue = await serializer.deserialize(
            await serializer.serialize(value),
        );
        expect(deserializedValue).toEqual(value);
    });
}
