import { describe, expect, test } from "vitest";
import {
    SamplingBreaker,
    type SamplingBreakerState,
} from "@/circuit-breaker/implementations/policies/sampling-breaker/sampling-breaker.js";
import { TimeSpan } from "@/time-span/implementations/time-span.js";

describe("class: SamplingBreaker", () => {
    describe("method: initialMetrics", () => {
        test(`Should return an object with an empty "samples" array field`, () => {
            const policy = new SamplingBreaker({
                failureThreshold: 0.2,
                successThreshold: 0.8,
                minimumRps: 10,
                sampleTimeSpan: TimeSpan.fromMilliseconds(50),
                timeSpan: TimeSpan.fromMilliseconds(200),
            });

            const newMetrics = policy.initialMetrics();

            expect(newMetrics).toEqual({
                samples: [],
            } satisfies SamplingBreakerState);
        });
    });
    describe("method: whenClosed", () => {
        test.todo("Write tests");
    });
    describe("method: whenHalfOpen", () => {
        test.todo("Write tests");
    });
    describe("method: trackFailure", () => {
        test.todo("Write tests");
    });
    describe("method: trackSuccess", () => {
        test.todo("Write tests");
    });
    describe("method: isEqual", () => {
        test.todo("Write tests");
    });
});
