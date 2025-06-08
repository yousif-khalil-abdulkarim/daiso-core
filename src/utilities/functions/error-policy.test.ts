import { describe, expect, test } from "vitest";
import {
    callErrorPolicyOnThrow,
    callErrorPolicyOnValue,
    isErrorPolicyBoolSetting,
    type ErrorPolicyBoolSetting,
} from "@/utilities/functions/error-policy.js";
import { z } from "zod";
import type { IInvokableObject } from "@/utilities/functions/invokable.js";
import { resultFailure, resultSuccess } from "@/utilities/functions/result.js";

describe("file: error-policy.ts", () => {
    describe("function: isErrorPolicyBoolSetting", () => {
        test("Should return false when given Class", () => {
            // eslint-disable-next-line @typescript-eslint/no-extraneous-class
            class Test {}
            expect(isErrorPolicyBoolSetting(Test)).toBe(false);
        });
        test("Should return false when given standard schema", () => {
            expect(isErrorPolicyBoolSetting(z.string())).toBe(false);
        });
        test("Should return false when given IInvokableObject", () => {
            const invokable: IInvokableObject<[error: unknown], boolean> = {
                invoke(_error: unknown): boolean {
                    return true;
                },
            };
            expect(isErrorPolicyBoolSetting(invokable)).toBe(false);
        });
        test("Should return false when given InvokableFn", () => {
            const invokable = (_error: unknown) => false;
            expect(isErrorPolicyBoolSetting(invokable)).toBe(false);
        });
        test("Should return true when given ErrorPolicyBoolSetting", () => {
            const errorPolicy1: ErrorPolicyBoolSetting = {
                treatFalseAsError: false,
            };
            const errorPolicy2: ErrorPolicyBoolSetting = {
                treatFalseAsError: true,
            };
            expect(isErrorPolicyBoolSetting(errorPolicy1)).toBe(true);
            expect(isErrorPolicyBoolSetting(errorPolicy2)).toBe(true);
        });
    });
    describe("function: callErrorPolicyOnValue", () => {
        test("Should return true when ErrorPolicy is a class and given Result error is instance of the class", async () => {
            class ErrorA extends Error {}
            expect(
                await callErrorPolicyOnValue(
                    ErrorA,
                    resultFailure(new ErrorA()),
                ),
            ).toBe(true);
        });
        test("Should return false when ErrorPolicy is a class and given Result error is not instance of the class", async () => {
            class ErrorA extends Error {}
            class ErrorB extends Error {}
            expect(
                await callErrorPolicyOnValue(
                    ErrorA,
                    resultFailure(new ErrorB()),
                ),
            ).toBe(false);
        });
        test("Should return false when ErrorPolicy is a class and given Result error is not a class", async () => {
            class ErrorA extends Error {}
            expect(
                await callErrorPolicyOnValue(ErrorA, resultFailure("str")),
            ).toBe(false);
        });
        test("Should return true when ErrorPolicy is a standard schema and given Result error matches the standard schema", async () => {
            expect(
                await callErrorPolicyOnValue(
                    z.object({
                        code: z.literal("e20"),
                        message: z.string(),
                    }),
                    resultFailure({
                        code: "e20",
                        message: "Message",
                    }),
                ),
            ).toBe(true);
        });
        test("Should return false when ErrorPolicy is a standard schema and given Result error matches not the standard schema", async () => {
            expect(
                await callErrorPolicyOnValue(
                    z.object({
                        code: z.literal("e20"),
                        message: z.string(),
                    }),
                    resultFailure(new Error() as any),
                ),
            ).toBe(false);
        });
        test("Should return true when ErrorPolicy is a predicate function and given Result error matches the predicate function", async () => {
            expect(
                await callErrorPolicyOnValue(
                    (value) => value === "e20",
                    resultFailure("e20"),
                ),
            ).toBe(true);
        });
        test("Should return false when ErrorPolicy is a predicate function and given Result error matches not the predicate function", async () => {
            expect(
                await callErrorPolicyOnValue(
                    (value) => value === "e20",
                    resultFailure("e40"),
                ),
            ).toBe(false);
        });
        test("Should return false when ErrorPolicy is a class and given Result success value", async () => {
            class ErrorA extends Error {}
            expect(
                await callErrorPolicyOnValue(ErrorA, resultSuccess("str")),
            ).toBe(false);
        });
        test("Should return false when ErrorPolicy is a standard schema and given Result success value", async () => {
            expect(
                await callErrorPolicyOnValue(
                    z.object({
                        code: z.literal("e20"),
                        message: z.string(),
                    }),
                    resultSuccess("str"),
                ),
            ).toBe(false);
        });
        test("Should return false when ErrorPolicy is a predicate function and given Result success value", async () => {
            expect(
                await callErrorPolicyOnValue(
                    (value) => value === "e20",
                    resultSuccess("str"),
                ),
            ).toBe(false);
        });
        test("Should return false when ErrorPolicy ErrorPolicyBoolSetting.treatFalseAsError=false and given Result success value is false", async () => {
            expect(
                await callErrorPolicyOnValue(
                    { treatFalseAsError: false },
                    resultSuccess(false),
                ),
            ).toBe(false);
        });
        test("Should return false when ErrorPolicy ErrorPolicyBoolSetting.treatFalseAsError=false and given Result success value is true", async () => {
            expect(
                await callErrorPolicyOnValue(
                    { treatFalseAsError: false },
                    resultSuccess(true),
                ),
            ).toBe(false);
        });
        test("Should return false when ErrorPolicy ErrorPolicyBoolSetting.treatFalseAsError=true and given Result success value is true", async () => {
            expect(
                await callErrorPolicyOnValue(
                    { treatFalseAsError: true },
                    resultSuccess(true),
                ),
            ).toBe(false);
        });
        test("Should return false when ErrorPolicy ErrorPolicyBoolSetting.treatFalseAsError=true and given Result success value is false", async () => {
            expect(
                await callErrorPolicyOnValue(
                    { treatFalseAsError: true },
                    resultSuccess(false),
                ),
            ).toBe(false);
        });
        test("Should return false when ErrorPolicy ErrorPolicyBoolSetting.treatFalseAsError=false and given false value", async () => {
            expect(
                await callErrorPolicyOnValue(
                    { treatFalseAsError: false },
                    false,
                ),
            ).toBe(false);
        });
        test("Should return false when ErrorPolicy ErrorPolicyBoolSetting.treatFalseAsError=false and given true value", async () => {
            expect(
                await callErrorPolicyOnValue(
                    { treatFalseAsError: false },
                    true,
                ),
            ).toBe(false);
        });
        test("Should return false when ErrorPolicy ErrorPolicyBoolSetting.treatFalseAsError=true and given true value", async () => {
            expect(
                await callErrorPolicyOnValue({ treatFalseAsError: true }, true),
            ).toBe(false);
        });
        test("Should return true when ErrorPolicy ErrorPolicyBoolSetting.treatFalseAsError=true and given false value", async () => {
            expect(
                await callErrorPolicyOnValue(
                    { treatFalseAsError: true },
                    false,
                ),
            ).toBe(true);
        });
    });
    describe("function: callErrorPolicyOnThrow", () => {
        test("Should return true when ErrorPolicy is a class and given error is instance of the class", async () => {
            class ErrorA extends Error {}
            expect(await callErrorPolicyOnThrow(ErrorA, new ErrorA())).toBe(
                true,
            );
        });
        test("Should return false when ErrorPolicy is a class and given error is not instance of the class", async () => {
            class ErrorA extends Error {}
            class ErrorB extends Error {}
            expect(await callErrorPolicyOnThrow(ErrorA, new ErrorB())).toBe(
                false,
            );
        });
        test("Should return false when ErrorPolicy is a class and given error is not a class", async () => {
            class ErrorA extends Error {}
            expect(await callErrorPolicyOnThrow(ErrorA, "str")).toBe(false);
        });
        test("Should return true when ErrorPolicy is a standard schema and given error matches the standard schema", async () => {
            expect(
                await callErrorPolicyOnThrow(
                    z.object({
                        code: z.literal("e20"),
                        message: z.string(),
                    }),
                    {
                        code: "e20",
                        message: "Message",
                    },
                ),
            ).toBe(true);
        });
        test("Should return false when ErrorPolicy is a standard schema and given error matches not the standard schema", async () => {
            expect(
                await callErrorPolicyOnThrow(
                    z.object({
                        code: z.literal("e20"),
                        message: z.string(),
                    }),
                    new Error() as any,
                ),
            ).toBe(false);
        });
        test("Should return true when ErrorPolicy is a predicate function and given error matches the predicate function", async () => {
            expect(
                await callErrorPolicyOnThrow((value) => value === "e20", "e20"),
            ).toBe(true);
        });
        test("Should return false when ErrorPolicy is a predicate function and given error matches not the predicate function", async () => {
            expect(
                await callErrorPolicyOnThrow((value) => value === "e20", "e40"),
            ).toBe(false);
        });
        test("Should return false when ErrorPolicy is ErrorPolicyBoolSetting and given error matches not the predicate function", async () => {
            expect(
                await callErrorPolicyOnThrow(
                    { treatFalseAsError: false },
                    "e40",
                ),
            ).toBe(false);
            expect(
                await callErrorPolicyOnThrow(
                    { treatFalseAsError: true },
                    "e40",
                ),
            ).toBe(false);
        });
    });
});
