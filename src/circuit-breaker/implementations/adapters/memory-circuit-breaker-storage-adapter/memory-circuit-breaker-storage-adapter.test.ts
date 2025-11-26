import { describe, test, expect, beforeEach } from "vitest";
import { circuitBreakerStorageAdapterTestSuite } from "@/circuit-breaker/implementations/test-utilities/circuit-breaker-storage-adapter.test-suite.js";
import { MemoryCircuitBreakerStorageAdapter } from "@/circuit-breaker/implementations/adapters/memory-circuit-breaker-storage-adapter/memory-circuit-breaker-storage-adapter.js";

describe("class: MemoryCircuitBreakerStorageAdapter", () => {
    describe("method: deInit", () => {
        test.todo("Write tests!!!");
    });
    circuitBreakerStorageAdapterTestSuite({
        createAdapter: () => {
            return new MemoryCircuitBreakerStorageAdapter();
        },
        beforeEach,
        describe,
        test,
        expect,
    });
});
