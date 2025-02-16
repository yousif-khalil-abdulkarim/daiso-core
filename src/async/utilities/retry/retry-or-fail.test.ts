import { describe, expect, test } from "vitest";
import { retryOrFail } from "@/async/utilities/retry/retry-or-fail.js";
import { RetryAsyncError } from "@/async/async.errors.js";

describe("function: retryOrFail", () => {
    test("Should throw RetryAsyncError when all atempts fail", async () => {
        const promise = retryOrFail(
            // eslint-disable-next-line @typescript-eslint/require-await
            async () => {
                throw new Error("My own error");
            },
            {
                maxAttempts: 4,
                backoffPolicy: () => 0,
            },
        );
        await expect(promise).rejects.toBeInstanceOf(RetryAsyncError);
    });
    test("Should retry until given maxAtempt", async () => {
        let repetition = 0;
        const maxAttempts = 0;
        try {
            await retryOrFail(
                // eslint-disable-next-line @typescript-eslint/require-await
                async () => {
                    repetition++;
                    throw new Error("My own error");
                },
                {
                    maxAttempts,
                    backoffPolicy: () => 0,
                },
            );
        } catch {
            /* Empty */
        }
        expect(repetition).toBe(maxAttempts);
    });
    test("Should retry only specific error when given custom retry policy", async () => {
        class ErrorA extends Error {}
        class ErrorB extends Error {}
        const promise = retryOrFail(
            // eslint-disable-next-line @typescript-eslint/require-await
            async () => {
                throw new ErrorB("My own error");
            },
            {
                maxAttempts: 4,
                backoffPolicy: () => 0,
                retryPolicy: (error) => error instanceof ErrorA,
            },
        );
        await expect(promise).rejects.toBeInstanceOf(ErrorB);
    });
    test("Should not retry when given custom retry policy and unknown error", async () => {
        class ErrorA extends Error {}
        const promise = retryOrFail(
            // eslint-disable-next-line @typescript-eslint/require-await
            async () => {
                throw new ErrorA("My own error");
            },
            {
                maxAttempts: 4,
                backoffPolicy: () => 0,
                retryPolicy: (error) => error instanceof ErrorA,
            },
        );
        await expect(promise).rejects.toBeInstanceOf(RetryAsyncError);
    });
    test("Should return value", async () => {
        let repetition = 0;
        const maxAttempts = 4;
        const promise = retryOrFail(
            // eslint-disable-next-line @typescript-eslint/require-await
            async () => {
                repetition++;
                if (repetition < maxAttempts) {
                    throw new Error("My own error");
                }
                return "text";
            },
            {
                maxAttempts,
                backoffPolicy: () => 0,
            },
        );
        await expect(promise).resolves.toBe("text");
    });
});
