import { describe, expect, test } from "vitest";
import { retry } from "@/async/utilities/retry/retry";
import { RetryAsyncError } from "@/async/async.errors";

describe("function: retry", () => {
    test("Should return RetryAsyncError when all atempts fail", async () => {
        const [value, error] = await retry(
            // eslint-disable-next-line @typescript-eslint/require-await
            async () => {
                throw new Error("My own error");
            },
            {
                maxAttempts: 4,
                backoffPolicy: () => 0,
            },
        );
        expect(value).toBeNull();
        expect(error).toBeInstanceOf(RetryAsyncError);
    });
    test("Should retry until given maxAtempt", async () => {
        let repetition = 0;
        const maxAttempts = 0;
        try {
            await retry(
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
        const promise = retry(
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
        const [value, error] = await retry(
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
        expect(value).toBeNull();
        expect(error).toBeInstanceOf(RetryAsyncError);
    });
    test("Should return value", async () => {
        let repetition = 0;
        const maxAttempts = 4;
        const [value, error] = await retry(
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
        expect(value).toBe("text");
        expect(error).toBeNull();
    });
});
