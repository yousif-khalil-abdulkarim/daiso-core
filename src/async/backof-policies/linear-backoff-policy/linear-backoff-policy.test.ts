import { describe, expect, test } from "vitest";
import { linearBackoffPolicy } from "@/async/backof-policies/linear-backoff-policy/linear-backoff-policy";

describe("function: linearBackoffPolicy", () => {
    describe("With default values", () => {
        test("Attempt 1", () => {
            const mathRandom = () => 0.9;
            const backoffPolicy = linearBackoffPolicy({
                _mathRandom: mathRandom,
            });
            const attempt = 1;
            const maxDelayInMs = 6000;
            const minDelayInMs = 1_000;
            const jitter = 1;
            const result =
                (1 - jitter * mathRandom()) *
                Math.min(maxDelayInMs, minDelayInMs * attempt);
            expect(backoffPolicy(attempt, undefined)).toBe(result);
        });
        test("Should clamp min value", () => {
            const mathRandom = () => 0.9;
            const backoffPolicy = linearBackoffPolicy({
                _mathRandom: mathRandom,
            });
            const attempt = 1;
            const maxDelayInMs = 6000;
            const minDelayInMs = 1_000;
            const jitter = 1;
            const result =
                (1 - jitter * mathRandom()) *
                Math.min(maxDelayInMs, minDelayInMs * attempt);
            expect(backoffPolicy(attempt, undefined)).toBe(result);
        });
        test("Should clamp max value", () => {
            const mathRandom = () => 0.1;
            const backoffPolicy = linearBackoffPolicy({
                _mathRandom: mathRandom,
            });
            const attempt = 1;
            const maxDelayInMs = 6000;
            const minDelayInMs = 1_000;
            const jitter = 1;
            const result =
                (1 - jitter * mathRandom()) *
                Math.min(maxDelayInMs, minDelayInMs * attempt);
            expect(backoffPolicy(attempt, undefined)).toBe(result);
        });
    });
    describe("Without default values", () => {
        test("Attempt 1", () => {
            const mathRandom = () => 0.9;
            const maxDelayInMs = 5000;
            const minDelayInMs = 2_000;
            const jitter = 2;
            const backoffPolicy = linearBackoffPolicy({
                _mathRandom: mathRandom,
                maxDelayInMs,
                minDelayInMs,
                jitter,
            });
            const attempt = 1;
            const result =
                (1 - jitter * mathRandom()) *
                Math.min(maxDelayInMs, minDelayInMs * attempt);
            expect(backoffPolicy(attempt, undefined)).toBe(result);
        });
        test("Should clamp min value", () => {
            const mathRandom = () => 0.9;
            const attempt = 1;
            const maxDelayInMs = 5000;
            const minDelayInMs = 2_000;
            const jitter = 1;
            const backoffPolicy = linearBackoffPolicy({
                _mathRandom: mathRandom,
                maxDelayInMs,
                minDelayInMs,
                jitter,
            });
            const result =
                (1 - jitter * mathRandom()) *
                Math.min(maxDelayInMs, minDelayInMs * attempt);
            expect(backoffPolicy(attempt, undefined)).toBe(result);
        });
        test("Should clamp max value", () => {
            const mathRandom = () => 0.1;
            const attempt = 1;
            const maxDelayInMs = 5000;
            const minDelayInMs = 2_000;
            const jitter = 1;
            const backoffPolicy = linearBackoffPolicy({
                _mathRandom: mathRandom,
                maxDelayInMs,
                minDelayInMs,
                jitter,
            });
            const result =
                (1 - jitter * mathRandom()) *
                Math.min(maxDelayInMs, minDelayInMs * attempt);
            expect(backoffPolicy(attempt, undefined)).toBe(result);
        });
    });
});
