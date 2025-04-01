import { AsyncHooks } from "@/utilities/_module-exports.js";
import { describe, expect, test } from "vitest";
import {
    fallbackMiddleware,
    type OnFallbackData,
} from "@/async/middlewares/fallback/fallback.middleware.js";

describe("function: fallbackMiddleware", () => {
    test("Should return function value when no error is thrown", async () => {
        const returnValue = await new AsyncHooks(
            () => "a",
            [
                fallbackMiddleware({
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
            fallbackMiddleware({
                fallbackValue: "fallback-value",
            }),
        ]).invoke();
        expect(returnValue).toBe("fallback-value");
    });
    test("Should throw error when fallback value is defined and retry policy is defined", async () => {
        class CustomError extends Error {}
        const returnValue = new AsyncHooks((): string => {
            throw new Error("Unexpected error");
        }, [
            fallbackMiddleware({
                fallbackValue: "fallback-value",
                fallbackPolicy: (error) => error instanceof CustomError,
            }),
        ]).invoke();
        await expect(returnValue).rejects.toBeInstanceOf(Error);
    });
    test("Should call onFallback callback when error is thrown", async () => {
        let data = null as OnFallbackData | null;
        await new AsyncHooks(
            (_url: string): string => {
                throw new Error("Unexpected error");
            },
            [
                fallbackMiddleware({
                    fallbackValue: "fallback-value",
                    onFallback: (data_) => {
                        data = data_;
                    },
                }),
            ],
            {
                name: "fetchData",
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
                fallbackMiddleware({
                    fallbackValue: "fallback-value",
                    onFallback: (data_) => {
                        data = data_;
                    },
                }),
            ],
            {
                name: "fetchData",
            },
        ).invoke();
        expect(data).toBeNull();
    });
});
