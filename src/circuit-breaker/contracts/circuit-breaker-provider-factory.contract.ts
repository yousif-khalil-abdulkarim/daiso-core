/**
 * @module CircuitBreaker
 */

import type { ICircuitBreakerProvider } from "@/circuit-breaker/contracts/circuit-breaker-provider.contract.js";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnregisteredAdapterError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    DefaultAdapterNotDefinedError,
} from "@/utilities/_module.js";

/**
 * The `ICircuitBreakerProviderFactory` contract makes it easy to configure and switch between different {@link ICircuitBreakerProvider | `ICircuitBreakerProvider`} dynamically.
 *
 * IMPORT_PATH: `"@daiso-tech/core/circuit-breaker/contracts"`
 * @group Contracts
 */
export type ICircuitBreakerProviderFactory<TAdapters extends string = string> =
    {
        /**
         * The `use` method will throw an error if you provide it unregisted adapter.
         * If no default adapter is defined an error will be thrown by `use` method.
         * @throws {UnregisteredAdapterError} {@link UnregisteredAdapterError}
         * @throws {DefaultAdapterNotDefinedError} {@link DefaultAdapterNotDefinedError}
         */
        use(adapterName?: TAdapters): ICircuitBreakerProvider;
    };
