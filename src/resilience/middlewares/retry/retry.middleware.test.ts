import { describe, expect, test } from "vitest";
import { retry } from "@/resilience/middlewares/retry/retry.middleware.js";
import type {
    OnRetryAttemptData,
    OnRetryDelayData,
} from "@/resilience/middlewares/retry/retry.types.js";
import { TimeSpan } from "@/time-span/implementations/_module.js";
import { TO_MILLISECONDS } from "@/time-span/contracts/_module.js";
import { AsyncHooks } from "@/hooks/_module.js";
import { RetryResilienceError } from "@/resilience/resilience.errors.js";

describe("function: retry", () => {
    test("Should throw RetryResilienceError when all atempts fail", async () => {
        const promise = new AsyncHooks(
            () => {
                throw new Error("My own error");
            },
            retry({
                maxAttempts: 4,
                backoffPolicy: () => TimeSpan.fromMilliseconds(0),
            }),
        ).invoke();

        await expect(promise).rejects.toBeInstanceOf(RetryResilienceError);
    });
    test("Should retry until given maxAttempts", async () => {
        let repetition = 0;
        const maxAttempts = 4;

        try {
            await new AsyncHooks(
                () => {
                    repetition++;
                    throw new Error("My own error");
                },
                retry({
                    maxAttempts,
                    backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                }),
            ).invoke();
        } catch {
            /* Empty */
        }

        expect(repetition).toBe(maxAttempts);
    });
    test("Should not retry when given predicate ErrorPolicy and unknown error", async () => {
        class ErrorA extends Error {}
        class ErrorB extends Error {}

        let i = 0;
        const maxAttempts = 4;
        const promise = new AsyncHooks(
            (): string => {
                i++;
                throw new ErrorB("My own error");
            },
            retry({
                maxAttempts,
                backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                errorPolicy: (error) => error instanceof ErrorA,
            }),
        ).invoke();

        try {
            await promise;
        } catch {
            /* EMPTY */
        }

        expect(i).toBe(1);
    });
    test("Should retry specific error when given predicate ErrorPolicy", async () => {
        class ErrorA extends Error {}

        let i = 0;
        const maxAttempts = 4;
        const promise = new AsyncHooks(
            (): string => {
                i++;
                throw new ErrorA("My own error");
            },
            retry({
                maxAttempts,
                backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                errorPolicy: (error) => error instanceof ErrorA,
            }),
        ).invoke();

        try {
            await promise;
        } catch {
            /* EMPTY */
        }

        expect(i).toBe(maxAttempts);
    });
    test("Should return value after throwing 4 times", async () => {
        let repetition = 0;
        const maxAttempts = 4;

        const promise = new AsyncHooks(
            () => {
                repetition++;
                if (repetition < maxAttempts) {
                    throw new Error("My own error");
                }
                return "text";
            },
            retry({
                maxAttempts,
                backoffPolicy: () => TimeSpan.fromMilliseconds(0),
            }),
        ).invoke();

        await expect(promise).resolves.toBe("text");
    });
    test("Should call onExecutionAttempt callback when error is thrown", async () => {
        let repetition = 0;
        const maxAttempts = 4;
        let data = null as OnRetryAttemptData | null;
        try {
            await new AsyncHooks(
                (_url: string): string => {
                    throw new Error("My own error");
                },
                retry({
                    maxAttempts,
                    backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                    onExecutionAttempt(data_) {
                        data = data_;
                        repetition++;
                    },
                }),
                {
                    context: {
                        name: "fetchData",
                    },
                },
            ).invoke("ENDPOINT");
        } catch {
            /* Empty */
        }
        expect(data?.attempt).toBe(maxAttempts);
        expect(data?.args).toStrictEqual(["ENDPOINT"]);
        expect(data?.context).toStrictEqual({
            name: "fetchData",
        });
        expect(repetition).toBe(maxAttempts);
    });
    test("Should call onExecutionAttempt callback when no error is thrown", async () => {
        let repetition = 0;
        const maxAttempts = 4;
        let data = null as OnRetryAttemptData | null;
        try {
            await new AsyncHooks(
                (_url: string): string => {
                    return "data";
                },
                retry({
                    maxAttempts,
                    backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                    onExecutionAttempt(data_) {
                        data = data_;
                        repetition++;
                    },
                }),
                {
                    context: {
                        name: "fetchData",
                    },
                },
            ).invoke("ENDPOINT");
        } catch {
            /* Empty */
        }
        expect(data?.attempt).toBe(1);
        expect(data?.args).toStrictEqual(["ENDPOINT"]);
        expect(data?.context).toStrictEqual({
            name: "fetchData",
        });
        expect(repetition).toBe(1);
    });
    test("Should call onRetryDelay callback when error is thrown", async () => {
        let repetition = 0;
        const maxAttempts = 4;
        let data = null as OnRetryDelayData | null;
        try {
            await new AsyncHooks(
                (_url: string): string => {
                    throw new Error("My own error");
                },
                retry({
                    maxAttempts,
                    backoffPolicy: () => TimeSpan.fromMilliseconds(25),
                    onRetryDelay(data_) {
                        data = data_;
                        repetition++;
                    },
                }),
                {
                    context: {
                        name: "fetchData",
                    },
                },
            ).invoke("ENDPOINT");
        } catch {
            /* Empty */
        }
        expect(data?.args).toStrictEqual(["ENDPOINT"]);
        expect(data?.attempt).toBe(maxAttempts);
        expect(data?.context).toStrictEqual({
            name: "fetchData",
        });
        expect(data?.error).toBeInstanceOf(Error);
        expect(data?.waitTime[TO_MILLISECONDS]()).toBe(25);
        expect(repetition).toBe(maxAttempts);
    });
    test("Should not call onRetryDelay callback when no error is thrown", async () => {
        let repetition = 0;
        const maxAttempts = 4;
        let data = null as OnRetryDelayData | null;
        try {
            await new AsyncHooks(
                (_url: string): string => {
                    return "data";
                },
                retry({
                    maxAttempts,
                    backoffPolicy: () => TimeSpan.fromMilliseconds(25),
                    onRetryDelay(data_) {
                        data = data_;
                        repetition++;
                    },
                }),
                {
                    context: {
                        name: "fetchData",
                    },
                },
            ).invoke("ENDPOINT");
        } catch {
            /* Empty */
        }
        expect(data).toBeNull();
        expect(repetition).toBe(0);
    });
});
