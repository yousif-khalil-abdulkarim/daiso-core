import { DatabaseCircuitBreakerAdapter } from "eridu-tech/circuit-breaker/database-circuit-breaker-adapter";
import { circuitBreakerStorageAdapter } from "./circuit_breaker_storage_adapter";

const circuitBreakerAdapter = new DatabaseCircuitBreakerAdapter({
    adapter: circuitBreakerStorageAdapter,
});
