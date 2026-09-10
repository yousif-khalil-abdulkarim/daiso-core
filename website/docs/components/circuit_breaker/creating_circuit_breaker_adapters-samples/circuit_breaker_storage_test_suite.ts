import { beforeEach, describe, expect, test } from "vitest";
import { circuitBreakerStorageAdapterTestSuite } from "eridu-tech/circuit-breaker/test-utilities";
import { MemoryCircuitBreakerStorageAdapter } from "eridu-tech/circuit-breaker/memory-circuit-breaker-storage-adapter";

describe("class: MyCircuitBreakerStorageAdapter", () => {
    circuitBreakerStorageAdapterTestSuite({
        createAdapter: () => new MemoryCircuitBreakerStorageAdapter(),
        test,
        beforeEach,
        expect,
        describe,
    });
});
