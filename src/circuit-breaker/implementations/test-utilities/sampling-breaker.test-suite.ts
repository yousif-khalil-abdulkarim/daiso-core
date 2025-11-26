/**
 * @module CircuitBreaker
 */

import { TimeSpan } from "@/time-span/implementations/_module-exports.js";
import { Task } from "@/task/_module-exports.js";
import {
    type TestAPI,
    type SuiteAPI,
    type ExpectStatic,
    type beforeEach,
} from "vitest";
import { type ICircuitBreakerAdapter } from "@/circuit-breaker/contracts/_module-exports.js";
import { type Promisable } from "@/utilities/_module-exports.js";
import type { SamplingBreakerSettings } from "@/circuit-breaker/implementations/policies/_module-exports.js";
import {
    BACKOFFS,
    type ConstantBackoffSettingsEnum,
} from "@/backoff-policies/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/circuit-breaker/test-utilities"`
 * @group TestUtilities
 */
export type SamplingBreakerTestSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createAdapter: () => Promisable<ICircuitBreakerAdapter>;
};

/**
 * @group TestUtilities
 */
const circuitBreakerPolicySettings: Required<SamplingBreakerSettings> = {};

/**
 * @group TestUtilities
 */
const backoffPolicySettings: Required<ConstantBackoffSettingsEnum> = {
    type: BACKOFFS.CONSTANT,
    delay: TimeSpan.fromMilliseconds(50),
    jitter: 0.5,
    enableJitter: false,
};

/**
 * IMPORT_PATH: `"@daiso-tech/core/circuit-breaker/test-utilities"`
 * @group TestUtilities
 *
 * @example
 * ```ts
 * import { beforeEach, describe, expect, test } from "vitest";
 * import { DatabaseCirciuitBreakerAdapter } from "@daiso-tech/core/circuit-breaker/database-circuit-breaker-adapter";
 * import { SamplingBreaker } from "@daiso-tech/core/circuit-breaker/policies";
 * import { samplingBreakerTestSuite } from "@daiso-tech/core/circuit-breaker/test-utilities";
 * import { constantBackoff } from "@daiso-tech/core/backoff-policies";
 * import { MemoryCircuitBreakerStorageAdapter } from "@daiso-tech/core/circuit-breaker/memory-circuit-breaker-storage-adapter";
 *
 * describe("sampling-breaker class: DatabaseCircuitBreakerAdapter", () => {
 *     samplingBreakerTestSuite({
 *         createAdapter: () => {
 *             const adapter = new DatabaseCirciuitBreakerAdapter({
 *                 adapter: new MemoryCircuitBreakerStorageAdapter(),
 *                 backoffPolicy: constantBackoff(
 *                     samplingBreakerTestSuite.backoffPolicySettings,
 *                 ),
 *                 circuitBreakerPolicy: new SamplingBreaker(
 *                     samplingBreakerTestSuite.circuitBreakerPolicySettings,
 *                 ),
 *             });
 *             return adapter;
 *         },
 *         beforeEach,
 *         describe,
 *         expect,
 *         test,
 *     });
 * });
 * ```
 */
export function samplingBreakerTestSuite(
    settings: SamplingBreakerTestSuiteSettings,
): void {
    const { expect, test, createAdapter, describe, beforeEach } = settings;
    let adapter: ICircuitBreakerAdapter;
    const waitTime = TimeSpan.fromTimeSpan(backoffPolicySettings.delay);
    describe("Reusable tests:", () => {
        beforeEach(async () => {
            adapter = await createAdapter();
        });

        const KEY = "a";
        async function delay(timeSpan: TimeSpan): Promise<void> {
            await Task.delay(timeSpan);
        }

        describe("method: getState", () => {
            test.todo("Write tests!!!");
        });
        describe("method: updateState / trackFailure / trackSuccess", () => {
            test.todo("Write tests!!!");
        });
        describe("method: updateState / trackFailure / isolate", () => {
            test.todo("Write tests!!!");
        });
        describe("method: updateState / trackFailure / reset", () => {
            test.todo("Write tests!!!");
        });
    });
}

samplingBreakerTestSuite.circuitBreakerPolicySettings =
    circuitBreakerPolicySettings;
samplingBreakerTestSuite.backoffPolicySettings = backoffPolicySettings;
