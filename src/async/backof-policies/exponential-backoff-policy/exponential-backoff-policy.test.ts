import { describe, expect, test } from "vitest";
import { exponentialBackoffPolicy } from "@/async/backof-policies/exponential-backoff-policy/exponential-backoff-policy";

describe("function: exponentialBackoffPolicy", () => {
    describe("With default values", () => {
        test("Attempt 1", () => {
            const mathRandom = () => 0.9;
            const backoffPolicy = exponentialBackoffPolicy({
                _mathRandom: mathRandom,
            });
            const attempt = 1;
            const maxDelayInMs = 6000;
            const minDelayInMs = 1_000;
            const jitter = 1;
            const multiplier = 2;
            const result =
                (1 - jitter * mathRandom()) *
                Math.min(
                    maxDelayInMs,
                    minDelayInMs * Math.pow(multiplier, attempt),
                );
            expect(backoffPolicy(attempt, undefined)).toBe(result);
        });
        test("Should clamp min value", () => {
            const mathRandom = () => 0.9;
            const backoffPolicy = exponentialBackoffPolicy({
                _mathRandom: mathRandom,
            });
            const attempt = 1;
            const maxDelayInMs = 6000;
            const minDelayInMs = 1_000;
            const jitter = 1;
            const multiplier = 2;
            const result =
                (1 - jitter * mathRandom()) *
                Math.min(
                    maxDelayInMs,
                    minDelayInMs * Math.pow(multiplier, attempt),
                );
            expect(backoffPolicy(attempt, undefined)).toBe(result);
        });
        test("Should clamp max value", () => {
            const mathRandom = () => 0.1;
            const backoffPolicy = exponentialBackoffPolicy({
                _mathRandom: mathRandom,
            });
            const attempt = 1;
            const maxDelayInMs = 6000;
            const minDelayInMs = 1_000;
            const jitter = 1;
            const multiplier = 2;
            const result =
                (1 - jitter * mathRandom()) *
                Math.min(
                    maxDelayInMs,
                    minDelayInMs * Math.pow(multiplier, attempt),
                );
            expect(backoffPolicy(attempt, undefined)).toBe(result);
        });
    });
    describe("Without default values", () => {
        test("Attempt 1", () => {
            const mathRandom = () => 0.9;
            const maxDelayInMs = 5000;
            const minDelayInMs = 2_000;
            const jitter = 2;
            const multiplier = 3;
            const backoffPolicy = exponentialBackoffPolicy({
                _mathRandom: mathRandom,
                maxDelayInMs,
                minDelayInMs,
                jitter,
                multiplier,
            });
            const attempt = 1;
            const result =
                (1 - jitter * mathRandom()) *
                Math.min(
                    maxDelayInMs,
                    minDelayInMs * Math.pow(multiplier, attempt),
                );
            expect(backoffPolicy(attempt, undefined)).toBe(result);
        });
        test("Should clamp min value", () => {
            const mathRandom = () => 0.9;
            const attempt = 1;
            const maxDelayInMs = 5000;
            const minDelayInMs = 2_000;
            const jitter = 1;
            const multiplier = 3;
            const backoffPolicy = exponentialBackoffPolicy({
                _mathRandom: mathRandom,
                maxDelayInMs,
                minDelayInMs,
                jitter,
                multiplier,
            });
            const result =
                (1 - jitter * mathRandom()) *
                Math.min(
                    maxDelayInMs,
                    minDelayInMs * Math.pow(multiplier, attempt),
                );
            expect(backoffPolicy(attempt, undefined)).toBe(result);
        });
        test("Should clamp max value", () => {
            const mathRandom = () => 0.1;
            const attempt = 1;
            const maxDelayInMs = 5000;
            const minDelayInMs = 2_000;
            const jitter = 1;
            const multiplier = 3;
            const backoffPolicy = exponentialBackoffPolicy({
                _mathRandom: mathRandom,
                maxDelayInMs,
                minDelayInMs,
                jitter,
                multiplier,
            });
            const result =
                (1 - jitter * mathRandom()) *
                Math.min(
                    maxDelayInMs,
                    minDelayInMs * Math.pow(multiplier, attempt),
                );
            expect(backoffPolicy(attempt, undefined)).toBe(result);
        });
    });
});
