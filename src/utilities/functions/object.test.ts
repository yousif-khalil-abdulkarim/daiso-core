import { describe, expect, test } from "vitest";
import {
    isObjectEmpty,
    objectSize,
    removeUndefinedProperties,
} from "@/utilities/functions/object.js";

describe("file: object.ts", () => {
    describe("function: objectSize", () => {
        test("Should return 0 when object is empty", () => {
            expect(objectSize({})).toBe(0);
        });
        test("Should return 0 when object contains undefined key", () => {
            expect(
                objectSize({
                    a: undefined,
                }),
            ).toBe(0);
        });
        test("Should return 1 when object contains one none undefined key", () => {
            expect(
                objectSize({
                    a: 1,
                }),
            ).toBe(1);
        });
        test("Should return 1 when object contains 1 undefined key and 1 none undefined key and", () => {
            expect(
                objectSize({
                    a: 1,
                    b: undefined,
                }),
            ).toBe(1);
        });
        test("Should return 2 when object contains 2 none undefined key", () => {
            expect(
                objectSize({
                    a: 1,
                    b: 2,
                }),
            ).toBe(2);
        });
    });
    describe("function: isObjectEmpty", () => {
        test("Should return true when object is empty", () => {
            expect(isObjectEmpty({})).toBe(true);
        });
        test("Should return true when object contains undefined key", () => {
            expect(
                isObjectEmpty({
                    a: undefined,
                }),
            ).toBe(true);
        });
        test("Should return false when object contains one none undefined key", () => {
            expect(
                isObjectEmpty({
                    a: 1,
                }),
            ).toBe(false);
        });
        test("Should return false when object contains 1 undefined key and 1 none undefined key and", () => {
            expect(
                isObjectEmpty({
                    a: 1,
                    b: undefined,
                }),
            ).toBe(false);
        });
        test("Should return false when object contains 2 none undefined key", () => {
            expect(
                isObjectEmpty({
                    a: 1,
                    b: 2,
                }),
            ).toBe(false);
        });
    });
    describe("function: removeUndefinedProperties", () => {
        test("Should remove all undefined keys", () => {
            expect(
                removeUndefinedProperties({
                    a: undefined,
                    b: undefined,
                    c: 1,
                    d: 2,
                }),
            ).toStrictEqual({
                c: 1,
                d: 2,
            });
        });
    });
});
