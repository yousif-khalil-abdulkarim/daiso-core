/* eslint-disable @typescript-eslint/no-unused-vars */
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
import type { CountBreakerSettings } from "@/circuit-breaker/implementations/policies/_module-exports.js";
import {
    BACKOFFS,
    type ConstantBackoffSettingsEnum,
} from "@/backoff-policies/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/circuit-breaker/test-utilities"`
 * @group TestUtilities
 */
export type CountBreakerTestSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createAdapter: () => Promisable<ICircuitBreakerAdapter>;
};

/**
 * @group TestUtilities
 */
const circuitBreakerPolicySettings: Required<CountBreakerSettings> = {
    failureThreshold: 0.2,
    successThreshold: 0.8,
    size: 10,
    minimumNumberOfCalls: 5,
};

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
 * import { DatabaseCircuitBreakerAdapter } from "@daiso-tech/core/circuit-breaker/database-circuit-breaker-adapter";
 * import { CountBreaker } from "@daiso-tech/core/circuit-breaker/policies";
 * import { countBreakerTestSuite } from "@daiso-tech/core/circuit-breaker/test-utilities";
 * import { constantBackoff } from "@daiso-tech/core/backoff-policies";
 * import { MemoryCircuitBreakerStorageAdapter } from "@daiso-tech/core/circuit-breaker/memory-circuit-breaker-storage-adapter";
 *
 * describe("count-breaker class: DatabaseCircuitBreakerAdapter", () => {
 *     countBreakerTestSuite({
 *         createAdapter: () => {
 *             const adapter = new DatabaseCircuitBreakerAdapter({
 *                 adapter: new MemoryCircuitBreakerStorageAdapter(),
 *                 backoffPolicy: constantBackoff(
 *                     countBreakerTestSuite.backoffPolicySettings,
 *                 ),
 *                 circuitBreakerPolicy: new CountBreaker(
 *                     countBreakerTestSuite.circuitBreakerPolicySettings,
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
export function countBreakerTestSuite(
    settings: CountBreakerTestSuiteSettings,
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

countBreakerTestSuite.circuitBreakerPolicySettings =
    circuitBreakerPolicySettings;
countBreakerTestSuite.backoffPolicySettings = backoffPolicySettings;
