import { beforeEach, describe, expect, test } from "vitest";
import { DatabaseCircuitBreakerAdapter } from "@/circuit-breaker/implementations/adapters/database-circuit-breaker-adapter/database-circuit-breaker-adapter.js";
import { SamplingBreaker } from "@/circuit-breaker/implementations/policies/_module-exports.js";
import { samplingBreakerTestSuite } from "@/circuit-breaker/implementations/test-utilities/_module-exports.js";
import { constantBackoff } from "@/backoff-policies/_module-exports.js";
import { MemoryCircuitBreakerStorageAdapter } from "@/circuit-breaker/implementations/adapters/memory-circuit-breaker-storage-adapter/_module-exports.js";

describe("sampling-breaker class: DatabaseCircuitBreakerAdapter", () => {
    samplingBreakerTestSuite({
        createAdapter: () => {
            const adapter = new DatabaseCircuitBreakerAdapter({
                backoffPolicy: constantBackoff(
                    samplingBreakerTestSuite.backoffPolicySettings,
                ),
                adapter: new MemoryCircuitBreakerStorageAdapter(),
                circuitBreakerPolicy: new SamplingBreaker(
                    samplingBreakerTestSuite.circuitBreakerPolicySettings,
                ),
            });
            return adapter;
        },
        beforeEach,
        describe,
        expect,
        test,
    });
});
