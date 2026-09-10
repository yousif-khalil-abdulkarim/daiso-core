import { DatabaseCircuitBreakerAdapter } from "eridu-tech/circuit-breaker/database-circuit-breaker-adapter";
import { SamplingBreaker } from "eridu-tech/circuit-breaker/policies";
import { circuitBreakerStorageAdapter } from "./circuit_breaker_storage_adapter.js";

const circuitBreakerAdapter = new DatabaseCircuitBreakerAdapter({
    adapter: circuitBreakerStorageAdapter,
    circuitBreakerPolicy: new SamplingBreaker(),
});
