import { describe, expect, test } from "vitest";
import {
    isResultFailure,
    isResult,
    isResultSuccess,
    resultSuccess,
    resultFailure,
} from "@/utilities/functions/result.js";

describe("file: result.ts", () => {
    describe("function: isResultFailure", () => {
        test("Should return false when given primitive value", () => {
            expect(isResultFailure("str")).toBe(false);
        });
        test("Should return false when given an object", () => {
            expect(isResultFailure({ str: "str" })).toBe(false);
        });
        test("Should return false when given ResultSuccess", () => {
            expect(isResultFailure(resultSuccess("str"))).toBe(false);
        });
        test("Should return true when given ResultFailure", () => {
            expect(isResultFailure(resultFailure("str"))).toBe(true);
        });
    });
    describe("function: isResultSuccess", () => {
        test("Should return false when given primitive value", () => {
            expect(isResultSuccess("ads")).toBe(false);
        });
        test("Should return false when given an object", () => {
            expect(isResultSuccess({ str: "ads" })).toBe(false);
        });
        test("Should return true when given ResultSuccess", () => {
            expect(isResultSuccess(resultSuccess("str"))).toBe(true);
        });
        test("Should return false when given ResultFailure", () => {
            expect(isResultSuccess(resultFailure("str"))).toBe(false);
        });
    });
    describe("function: isResult", () => {
        test("Should return false when given primitive value", () => {
            expect(isResult("ads")).toBe(false);
        });
        test("Should return false when given an object", () => {
            expect(isResult({ str: "ads" })).toBe(false);
        });
        test("Should return true when given ResultSuccess", () => {
            expect(isResult(resultSuccess("str"))).toBe(true);
        });
        test("Should return true when given ResultFailure", () => {
            expect(isResult(resultFailure("str"))).toBe(true);
        });
    });
});
