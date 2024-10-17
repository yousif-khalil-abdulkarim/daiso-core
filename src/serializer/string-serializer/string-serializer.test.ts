import { describe, expect, test } from "vitest";
import { StringSerializer } from "@/serializer/string-serializer/string-serializer";

describe("class: StringSerializer", () => {
    test("Should be able to serialize and deserialize string types", async () => {
        const serializer = new StringSerializer();
        const value = "a";
        const serialized = await serializer.serialize(value);
        const deserialized = await serializer.deserialize(serialized);
        expect(deserialized).toBe(value);
    });
    test("Should be able to serialize and deserialize json string types", async () => {
        const serializer = new StringSerializer();
        const value = JSON.stringify({ name: "A", age: 20 });
        const serialized = await serializer.serialize(value);
        const deserialized = await serializer.deserialize(serialized);
        expect(deserialized).toBe(value);
    });
    test("Should be able to serialize and deserialize positive integer types", async () => {
        const serializer = new StringSerializer();
        const value = 1;
        const serialized = await serializer.serialize(value);
        const deserialized = await serializer.deserialize(serialized);
        expect(deserialized).toBe(value);
    });
    test("Should be able to serialize and deserialize negative integer types", async () => {
        const serializer = new StringSerializer();
        const value = -1;
        const serialized = await serializer.serialize(value);
        const deserialized = await serializer.deserialize(serialized);
        expect(deserialized).toBe(value);
    });
    test("Should be able to serialize and deserialize positive decimal types", async () => {
        const serializer = new StringSerializer();
        const value = 1.25;
        const serialized = await serializer.serialize(value);
        const deserialized = await serializer.deserialize(serialized);
        expect(deserialized).toBe(value);
    });
    test("Should be able to serialize and deserialize negative decimal types", async () => {
        const serializer = new StringSerializer();
        const value = -1.25;
        const serialized = await serializer.serialize(value);
        const deserialized = await serializer.deserialize(serialized);
        expect(deserialized).toBe(value);
    });
    test("Should be able to serialize and deserialize array type", async () => {
        const serializer = new StringSerializer();
        const value = [1, 2, 3, 4];
        const serialized = await serializer.serialize(value);
        const deserialized = await serializer.deserialize(serialized);
        expect(deserialized).toStrictEqual(value);
    });
    test("Should be able to serialize and deserialize object type", async () => {
        const serializer = new StringSerializer();
        const value = {
            name: "Fake name",
            age: 20,
        };
        const serialized = await serializer.serialize(value);
        const deserialized = await serializer.deserialize(serialized);
        expect(deserialized).toStrictEqual(value);
    });
});
