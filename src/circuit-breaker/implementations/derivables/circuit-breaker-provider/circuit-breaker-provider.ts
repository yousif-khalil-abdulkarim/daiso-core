/**
 * @module CircuitBreaker
 */

import {
    CIRCUIT_BREAKER_TRIGGER,
    type CircuitBreakerEventMap,
    type CircuitBreakerProviderCreateSettings,
    type ICircuitBreaker,
    type ICircuitBreakerProvider,
    type ICircuitBreakerAdapter,
    type CircuitBreakerTrigger,
} from "@/circuit-breaker/contracts/_module-exports.js";
import type {
    EventListener,
    IEventBus,
    Unsubscribe,
} from "@/event-bus/contracts/_module-exports.js";
import { NoOpEventBusAdapter } from "@/event-bus/implementations/adapters/_module.js";
import { EventBus } from "@/event-bus/implementations/derivables/_module-exports.js";
import { Namespace } from "@/namespace/_module-exports.js";
import type { Task } from "@/task/_module-exports.js";
import { CircuitBreaker } from "@/circuit-breaker/implementations/derivables/circuit-breaker-provider/circuit-breaker.js";
import type { ITimeSpan } from "@/time-span/contracts/_module-exports.js";
import { TimeSpan } from "@/time-span/implementations/_module-exports.js";
import {
    CORE,
    resolveOneOrMore,
    type ErrorPolicy,
    type ErrorPolicySettings,
    type OneOrMore,
} from "@/utilities/_module-exports.js";
import type { ISerderRegister } from "@/serde/contracts/_module-exports.js";
import { Serde } from "@/serde/implementations/derivables/serde.js";
import { NoOpSerdeAdapter } from "@/serde/implementations/adapters/_module.js";
import { CircuitBreakerSerdeTransformer } from "@/circuit-breaker/implementations/derivables/circuit-breaker-provider/circuit-breaker-serde-transformer.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/circuit-breaker"`
 * @group Derivables
 */
export type CircuitBreakerProviderSettingsBase = ErrorPolicySettings & {
    /**
     * @default
     * ```ts
     * import { Namespace } from "@daiso-tech/core/namespace";
     *
     * new Namespace("@circuit-breaker")
     * ```
     */
    namespace?: Namespace;

    /**
     * @default
     * ```ts
     * import { EventBus } from "@daiso-tech/core/event-bus";
     * import { NoOpEventBusAdapter } from "@daiso-tech/core/event-bus/no-op-event-bus-adapter";
     *
     * new EventBus({
     *   adapter: new NoOpEventBusAdapter()
     * })
     * ```
     */
    eventBus?: IEventBus;

    /**
     * @default
     * ```ts
     * import { TimeSpan } from "@daiso-tech/core/time-span";
     *
     * TimeSpan.fromSeconds(10);
     * ```
     */
    slowCallTime?: ITimeSpan;

    /**
     * You can decide to track only errors, only slow calls or both as failures.
     * @default
     * ```ts
     * import { CIRCUIT_BREAKER_TRIGGER} from "@daiso-tech/core/circuit-breaker/contracts";
     *
     * CIRCUIT_BREAKER_TRIGGER.BOTH
     * ```
     */
    trigger?: CircuitBreakerTrigger;

    /**
     * If true, metric tracking will run asynchronously in the background and won't block the function utilizing the circuit breaker logic.
     * @default true
     */
    enableAsyncTracking?: boolean;

    serde?: OneOrMore<ISerderRegister>;

    /**
     * @default ""
     */
    serdeTransformerName?: string;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/circuit-breaker"`
 * @group Derivables
 */
export type CircuitBreakerProviderSettings =
    CircuitBreakerProviderSettingsBase & {
        adapter: ICircuitBreakerAdapter;
    };

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/circuit-breaker"`
 * @group Derivables
 */
export const DEFAULT_CIRCUIT_BREAKER_PROVIDER_NAMESPACE = new Namespace(
    "@circuit-breaker",
);

/**
 * `CircuitBreakerProvider` class can be derived from any {@link ICircuitBreakerAdapter | `ICircuitBreakerAdapter`}.
 *
 * Note the {@link ICircuitBreaker | `ICircuitBreaker`} instances created by the `CircuitBreakerProvider` class are serializable and deserializable,
 * allowing them to be seamlessly transferred across different servers, processes, and databases.
 * This can be done directly using {@link ISerderRegister | `ISerderRegister`} or indirectly through components that rely on {@link ISerderRegister | `ISerderRegister`} internally.
 *
 * IMPORT_PATH: `"@daiso-tech/core/circuit-breaker"`
 * @group Derivables
 */
export class CircuitBreakerProvider implements ICircuitBreakerProvider {
    private readonly namespace: Namespace;
    private readonly eventBus: IEventBus<CircuitBreakerEventMap>;
    private readonly adapter: ICircuitBreakerAdapter;
    private readonly slowCallTime: TimeSpan;
    private readonly trigger: CircuitBreakerTrigger;
    private readonly errorPolicy: ErrorPolicy;
    private readonly serde: OneOrMore<ISerderRegister>;
    private readonly serdeTransformerName: string;
    private readonly enableAsyncTracking: boolean;

    constructor(settings: CircuitBreakerProviderSettings) {
        const {
            enableAsyncTracking = true,
            namespace = DEFAULT_CIRCUIT_BREAKER_PROVIDER_NAMESPACE,
            eventBus = new EventBus({
                adapter: new NoOpEventBusAdapter(),
            }),
            adapter,
            slowCallTime = TimeSpan.fromSeconds(10),
            trigger = CIRCUIT_BREAKER_TRIGGER.BOTH,
            errorPolicy = () => true,
            serde = new Serde(new NoOpSerdeAdapter()),
            serdeTransformerName = "",
        } = settings;

        this.enableAsyncTracking = enableAsyncTracking;
        this.namespace = namespace;
        this.eventBus = eventBus;
        this.adapter = adapter;
        this.slowCallTime = TimeSpan.fromTimeSpan(slowCallTime);
        this.trigger = trigger;
        this.errorPolicy = errorPolicy;
        this.serde = serde;
        this.serdeTransformerName = serdeTransformerName;
        this.registerToSerde();
    }

    private registerToSerde(): void {
        const transformer = new CircuitBreakerSerdeTransformer({
            enableAsyncTracking: this.enableAsyncTracking,
            adapter: this.adapter,
            slowCallTime: this.slowCallTime,
            errorPolicy: this.errorPolicy,
            trigger: this.trigger,
            eventBus: this.eventBus,
            namespace: this.namespace,
            serdeTransformerName: this.serdeTransformerName,
        });
        for (const serde of resolveOneOrMore(this.serde)) {
            serde.registerCustom(transformer, CORE);
        }
    }

    addListener<TEventName extends keyof CircuitBreakerEventMap>(
        eventName: TEventName,
        listener: EventListener<CircuitBreakerEventMap[TEventName]>,
    ): Task<void> {
        return this.eventBus.addListener(eventName, listener);
    }

    removeListener<TEventName extends keyof CircuitBreakerEventMap>(
        eventName: TEventName,
        listener: EventListener<CircuitBreakerEventMap[TEventName]>,
    ): Task<void> {
        return this.eventBus.removeListener(eventName, listener);
    }

    listenOnce<TEventName extends keyof CircuitBreakerEventMap>(
        eventName: TEventName,
        listener: EventListener<CircuitBreakerEventMap[TEventName]>,
    ): Task<void> {
        return this.eventBus.listenOnce(eventName, listener);
    }

    asPromise<TEventName extends keyof CircuitBreakerEventMap>(
        eventName: TEventName,
    ): Task<CircuitBreakerEventMap[TEventName]> {
        return this.eventBus.asPromise(eventName);
    }

    subscribeOnce<TEventName extends keyof CircuitBreakerEventMap>(
        eventName: TEventName,
        listener: EventListener<CircuitBreakerEventMap[TEventName]>,
    ): Task<Unsubscribe> {
        return this.eventBus.subscribeOnce(eventName, listener);
    }

    subscribe<TEventName extends keyof CircuitBreakerEventMap>(
        eventName: TEventName,
        listener: EventListener<CircuitBreakerEventMap[TEventName]>,
    ): Task<Unsubscribe> {
        return this.eventBus.subscribe(eventName, listener);
    }

    create(
        key: string,
        settings: CircuitBreakerProviderCreateSettings = {},
    ): ICircuitBreaker {
        const { errorPolicy = this.errorPolicy, trigger = this.trigger } =
            settings;

        return new CircuitBreaker({
            enableAsyncTracking: this.enableAsyncTracking,
            eventDispatcher: this.eventBus,
            adapter: this.adapter,
            key: this.namespace.create(key),
            slowCallTime: this.slowCallTime,
            errorPolicy,
            trigger,
            serdeTransformerName: this.serdeTransformerName,
            namespace: this.namespace,
        });
    }
}
