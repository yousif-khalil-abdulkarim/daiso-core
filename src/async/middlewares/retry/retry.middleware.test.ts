import { describe, expect, test } from "vitest";
import {
    retry,
    type OnRetryAttemptData,
    type OnRetryDelayData,
} from "@/async/middlewares/retry/retry.middleware.js";
import { RetryAsyncError } from "@/async/async.errors.js";
import { AsyncHooks, TimeSpan } from "@/utilities/_module-exports.js";

describe("function: retry", () => {
    test("Should throw RetryAsyncError when all atempts fail", async () => {
        const promise = new AsyncHooks(
            () => {
                throw new Error("My own error");
            },
            retry({
                maxAttempts: 4,
                backoffPolicy: () => TimeSpan.fromMilliseconds(0),
            }),
        ).invoke();

        await expect(promise).rejects.toBeInstanceOf(RetryAsyncError);
    });
    test("Should retry until given maxAtempt", async () => {
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
    test("Should retry only specific error when given custom retry policy", async () => {
        class ErrorA extends Error {}
        class ErrorB extends Error {}

        const promise = new AsyncHooks(
            () => {
                throw new ErrorB("My own error");
            },
            retry({
                maxAttempts: 4,
                backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                errorPolicy: (error) => error instanceof ErrorA,
            }),
        ).invoke();

        await expect(promise).rejects.toBeInstanceOf(ErrorB);
    });
    test("Should not retry when given custom retry policy and unknown error", async () => {
        class ErrorA extends Error {}

        const promise = new AsyncHooks(
            () => {
                throw new ErrorA("My own error");
            },
            retry({
                maxAttempts: 4,
                backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                errorPolicy: (error) => error instanceof ErrorA,
            }),
        ).invoke();

        await expect(promise).rejects.toBeInstanceOf(RetryAsyncError);
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
        expect(data?.waitTime.toMilliseconds()).toBe(25);
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
