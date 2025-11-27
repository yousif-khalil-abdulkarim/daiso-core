import { beforeEach, describe, expect, test } from "vitest";
import { DatabaseCirciuitBreakerAdapter } from "@/circuit-breaker/implementations/adapters/database-circuit-breaker-adapter/database-circuit-breaker-adapter.js";
import { ConsecutiveBreaker } from "@/circuit-breaker/implementations/policies/_module-exports.js";
import { consecutiveBreakerTestSuite } from "@/circuit-breaker/implementations/test-utilities/_module-exports.js";
import { constantBackoff } from "@/backoff-policies/_module-exports.js";
import { MemoryCircuitBreakerStorageAdapter } from "@/circuit-breaker/implementations/adapters/memory-circuit-breaker-storage-adapter/_module-exports.js";

describe("consecutive-breaker class: DatabaseCircuitBreakerAdapter", () => {
    consecutiveBreakerTestSuite({
        createAdapter: () => {
            const adapter = new DatabaseCirciuitBreakerAdapter({
                backoffPolicy: constantBackoff(
                    consecutiveBreakerTestSuite.backoffPolicySettings,
                ),
                adapter: new MemoryCircuitBreakerStorageAdapter(),
                circuitBreakerPolicy: new ConsecutiveBreaker(
                    consecutiveBreakerTestSuite.circuitBreakerPolicySettings,
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
