import { beforeEach, describe, expect, test } from "vitest";
import { DatabaseCirciuitBreakerAdapter } from "@/circuit-breaker/implementations/adapters/database-circuit-breaker-adapter/database-circuit-breaker-adapter.js";
import { MemoryCircuitBreakerStorageAdapter } from "@/circuit-breaker/implementations/adapters/memory-circuit-breaker-storage-adapter/memory-circuit-breaker-storage-adapter.js";
import { CountBreaker } from "@/circuit-breaker/implementations/policies/_module-exports.js";
import { countBreakerTestSuite } from "@/circuit-breaker/implementations/test-utilities/_module-exports.js";
import { constantBackoff } from "@/backoff-policies/_module-exports.js";

describe("count-breaker class: DatabaseCircuitBreakerAdapter", () => {
    countBreakerTestSuite({
        createAdapter: () => {
            const adapter = new DatabaseCirciuitBreakerAdapter({
                backoffPolicy: constantBackoff(
                    countBreakerTestSuite.backoffPolicySettings,
                ),
                adapter: new MemoryCircuitBreakerStorageAdapter(),
                circuitBreakerPolicy: new CountBreaker(
                    countBreakerTestSuite.circuitBreakerPolicySettings,
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
