import { MemoryCircuitBreakerStorageAdapter } from "eridu-tech/circuit-breaker/memory-circuit-breaker-storage-adapter";
import { DatabaseCircuitBreakerAdapter } from "eridu-tech/circuit-breaker/database-circuit-breaker-adapter";

const adapter = new DatabaseCircuitBreakerAdapter({
    adapter: new MemoryCircuitBreakerStorageAdapter(),
});

adapter.getState("api:users");
// -> looks up circuit "api:users"
