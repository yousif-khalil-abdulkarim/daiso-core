import { describe, test, expect, beforeEach } from "vitest";
import { circuitBreakerStorageAdapterTestSuite } from "@/circuit-breaker/implementations/test-utilities/circuit-breaker-storage-adapter.test-suite.js";
import { MemoryCircuitBreakerStorageAdapter } from "@/circuit-breaker/implementations/adapters/memory-circuit-breaker-storage-adapter/memory-circuit-breaker-storage-adapter.js";

describe("class: MemoryCircuitBreakerStorageAdapter", () => {
    describe("method: deInit", () => {
        test("Should clear map", async () => {
            const map = new Map<string, unknown>();
            const adapter = new MemoryCircuitBreakerStorageAdapter(map);
            await adapter.transaction(async (trx) => {
                await trx.upsert("a", "1");
                await trx.upsert("b", "1");
            });
            await adapter.deInit();

            expect(map.size).toBe(0);
        });
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
