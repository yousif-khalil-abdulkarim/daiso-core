import { MemoryCircuitBreakerStorageAdapter } from "eridu-tech/circuit-breaker/memory-circuit-breaker-storage-adapter";
import { DatabaseCircuitBreakerAdapter } from "eridu-tech/circuit-breaker/database-circuit-breaker-adapter";
import { CircuitBreakerFactory } from "eridu-tech/circuit-breaker";

export const circuitBreakerFactory = new CircuitBreakerFactory({
    // You can provide default settings
    // You can choose the adapter to use
    adapter: new DatabaseCircuitBreakerAdapter({
        adapter: new MemoryCircuitBreakerStorageAdapter(),
    }),
});
