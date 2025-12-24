/**
 * @module CircuitBreaker
 */

import type {
    ICircuitBreakerProviderFactory,
    CircuitBreakerTrigger,
    ICircuitBreakerProvider,
    ICircuitBreakerAdapter,
} from "@/circuit-breaker/contracts/_module.js";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnregisteredAdapterError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    DefaultAdapterNotDefinedError,
    type ErrorPolicy,
} from "@/utilities/_module.js";
import {
    CircuitBreakerProvider,
    DEFAULT_CIRCUIT_BREAKER_PROVIDER_NAMESPACE,
    type CircuitBreakerProviderSettingsBase,
} from "@/circuit-breaker/implementations/derivables/circuit-breaker-provider/_module.js";
import type { Namespace } from "@/namespace/_module.js";
import type { IEventBus } from "@/event-bus/contracts/_module.js";
import type { ITimeSpan } from "@/time-span/contracts/_module.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/circuit-breaker"`
 * @group Derivables
 */
export type CircuitBreakerAdapters<TAdapters extends string> = Partial<
    Record<TAdapters, ICircuitBreakerAdapter>
>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/circuit-breaker"`
 * @group Derivables
 */
export type CircuitBreakerProviderFactorySettings<TAdapters extends string> =
    CircuitBreakerProviderSettingsBase & {
        adapters: CircuitBreakerAdapters<TAdapters>;

        defaultAdapter?: NoInfer<TAdapters>;
    };

/**
 * The `CircuitBreakerProviderFactory` class is immutable.
 *
 * IMPORT_PATH: `"@daiso-tech/core/circuit-breaker"`
 * @group Derivables
 */
export class CircuitBreakerProviderFactory<TAdapters extends string>
    implements ICircuitBreakerProviderFactory<TAdapters>
{
    /**
     * @example
     * ```ts
     * import { CircuitBreakerProviderFactory } from "@daiso-tech/core/circuit-breaker";
     * import { MemoryCircuitBreakerStorageAdapter } from "@daiso-tech/core/circuit-breaker/memory-circuit-breaker-storate-adapter";
     * import { DatabaseCircuitBreakerAdapter } from "@daiso-tech/core/circuit-breaker/database-circuit-breaker-adapter";
     * import { RedisCircuitBreakerAdapter } from "@daiso-tech/core/circuit-breaker/redis-circuit-breaker-adapter";
     * import { Serde } from "@daiso-tech/core/serde";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/super-json-serde-adapter";
     * import Redis from "ioredis"
     *
     * const serde = new Serde(new SuperJsonSerdeAdapter());
     * const circuitBreakerProviderFactory = new CircuitBreakerProviderFactory({
     *   serde,
     *   adapters: {
     *     memory: new DatabaseCircuitBreakerAdapter({
     *       adapter: new MemoryCircuitBreakerStorageAdapter()
     *     }),
     *     redis: new RedisCircuitBreakerAdapter({
     *       database: new Redis("YOUR_REDIS_CONNECTION")
     *     }),
     *   },
     *   defaultAdapter: "memory",
     * });
     * ```
     */
    constructor(
        private readonly settings: CircuitBreakerProviderFactorySettings<TAdapters>,
    ) {}

    setNamespace(
        namespace: Namespace,
    ): CircuitBreakerProviderFactory<TAdapters> {
        return new CircuitBreakerProviderFactory({
            ...this.settings,
            namespace,
        });
    }

    setEventBus(eventBus: IEventBus): CircuitBreakerProviderFactory<TAdapters> {
        return new CircuitBreakerProviderFactory({
            ...this.settings,
            eventBus,
        });
    }

    setSlowCallTime(
        slowCallTime?: ITimeSpan,
    ): CircuitBreakerProviderFactory<TAdapters> {
        return new CircuitBreakerProviderFactory({
            ...this.settings,
            slowCallTime,
        });
    }

    setTrigger(
        trigger?: CircuitBreakerTrigger,
    ): CircuitBreakerProviderFactory<TAdapters> {
        return new CircuitBreakerProviderFactory({
            ...this.settings,
            trigger,
        });
    }

    setErrorPolicy(
        errorPolicy: ErrorPolicy,
    ): CircuitBreakerProviderFactory<TAdapters> {
        return new CircuitBreakerProviderFactory({
            ...this.settings,
            errorPolicy,
        });
    }

    /**
     * @example
     * ```ts
     * import { CircuitBreakerProviderFactory } from "@daiso-tech/core/circuit-breaker";
     * import { MemoryCircuitBreakerStorageAdapter } from "@daiso-tech/core/circuit-breaker/memory-circuit-breaker-storate-adapter";
     * import { DatabaseCircuitBreakerAdapter } from "@daiso-tech/core/circuit-breaker/database-circuit-breaker-adapter";
     * import { RedisCircuitBreakerAdapter } from "@daiso-tech/core/circuit-breaker/redis-circuit-breaker-adapter";
     * import { Serde } from "@daiso-tech/core/serde";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/super-json-serde-adapter";
     * import Redis from "ioredis"
     *
     * const serde = new Serde(new SuperJsonSerdeAdapter());
     * const circuitBreakerProviderFactory = new CircuitBreakerProviderFactory({
     *   serde,
     *   adapters: {
     *     memory: new DatabaseCircuitBreakerAdapter({
     *       adapter: new MemoryCircuitBreakerStorageAdapter()
     *     }),
     *     redis: new RedisCircuitBreakerAdapter({
     *       database: new Redis("YOUR_REDIS_CONNECTION")
     *     }),
     *   },
     *   defaultAdapter: "memory",
     * });
     *
     * // Will apply circuit breaker logic the default adapter which is MemoryCircuitBreakerStorageAdapter
     * await circuitBreakerProviderFactory
     *   .use()
     *   .create("a")
     *   .runOrFail(async () => {
     *     // ... code to apply circuit breaker logic
     *   });
     *
     * // Will apply circuit breaker logic the default adapter which is RedisCircuitBreakerAdapter
     * await circuitBreakerProviderFactory
     *   .use("redis")
     *   .create("a")
     *   .runOrFail(async () => {
     *     // ... code to apply circuit breaker logic
     *   });
     * ```
     */
    use(
        adapterName: TAdapters | undefined = this.settings.defaultAdapter,
    ): ICircuitBreakerProvider {
        if (adapterName === undefined) {
            throw new DefaultAdapterNotDefinedError(
                CircuitBreakerProviderFactory.name,
            );
        }
        const adapter = this.settings.adapters[adapterName];
        if (adapter === undefined) {
            throw new UnregisteredAdapterError(adapterName);
        }
        const { namespace = DEFAULT_CIRCUIT_BREAKER_PROVIDER_NAMESPACE } =
            this.settings;
        return new CircuitBreakerProvider({
            ...this.settings,
            adapter,
            namespace: namespace.appendRoot(adapterName),
            serdeTransformerName: adapterName,
        });
    }
}
