import { AsyncHooks } from "@/utilities/_module-exports.js";
import { describe, expect, test } from "vitest";
import {
    fallback,
    type OnFallbackData,
} from "@/async/middlewares/fallback/fallback.middleware.js";
import { z } from "zod";

describe("function: fallback", () => {
    test("Should return function value when no error is thrown", async () => {
        const returnValue = await new AsyncHooks(
            () => "a",
            [
                fallback({
                    fallbackValue: "fallback-value",
                }),
            ],
        ).invoke();
        expect(returnValue).toBe("a");
    });
    test("Should return fallback value when error is thrown", async () => {
        const returnValue = await new AsyncHooks((): string => {
            throw new Error("Unexpected error");
        }, [
            fallback({
                fallbackValue: "fallback-value",
            }),
        ]).invoke();
        expect(returnValue).toBe("fallback-value");
    });
    test("Should not add fallback when given custom error policy and unknown error", async () => {
        class CustomError extends Error {}
        const returnValue = new AsyncHooks((): string => {
            throw new Error("Unexpected error");
        }, [
            fallback({
                fallbackValue: "fallback-value",
                errorPolicy: (error) => error instanceof CustomError,
            }),
        ]).invoke();
        await expect(returnValue).rejects.toBeInstanceOf(Error);
    });
    test("Should not add fallback when given custom standard schema error policy and unknown error", async () => {
        class CustomError extends Error {}
        const returnValue = new AsyncHooks((): string => {
            throw new Error("Unexpected error");
        }, [
            fallback({
                fallbackValue: "fallback-value",
                errorPolicy: z.instanceof(CustomError),
            }),
        ]).invoke();
        await expect(returnValue).rejects.toBeInstanceOf(Error);
    });
    test("Should add fallback only to specific error when given custom error policy", async () => {
        class CustomError extends Error {}
        const returnValue = await new AsyncHooks((): string => {
            throw new CustomError("Unexpected error");
        }, [
            fallback({
                fallbackValue: "fallback-value",
                errorPolicy: (error) => error instanceof CustomError,
            }),
        ]).invoke();
        expect(returnValue).toBe("fallback-value");
    });
    test("Should add fallback only to specific error when given custom standard schema error policy", async () => {
        class CustomError extends Error {}
        const returnValue = await new AsyncHooks((): string => {
            throw new CustomError("Unexpected error");
        }, [
            fallback({
                fallbackValue: "fallback-value",
                errorPolicy: z.instanceof(CustomError),
            }),
        ]).invoke();
        expect(returnValue).toBe("fallback-value");
    });
    test("Should call onFallback callback when error is thrown", async () => {
        let data = null as OnFallbackData | null;
        await new AsyncHooks(
            (_url: string): string => {
                throw new Error("Unexpected error");
            },
            [
                fallback({
                    fallbackValue: "fallback-value",
                    onFallback: (data_) => {
                        data = data_;
                    },
                }),
            ],
            {
                context: {
                    name: "fetchData",
                },
            },
        ).invoke("ENDPOINT");
        expect(data?.args).toStrictEqual(["ENDPOINT"]);
        expect(data?.context).toStrictEqual({
            name: "fetchData",
        });
        expect(data?.fallbackValue).toBe("fallback-value");
        expect(data?.error).toBeInstanceOf(Error);
    });
    test("Should not call onFallback callback when no error is thrown", async () => {
        let data = null as OnFallbackData | null;
        await new AsyncHooks(
            (): string => {
                return "a";
            },
            [
                fallback({
                    fallbackValue: "fallback-value",
                    onFallback: (data_) => {
                        data = data_;
                    },
                }),
            ],
            {
                context: {
                    name: "fetchData",
                },
            },
        ).invoke();
        expect(data).toBeNull();
    });
});
