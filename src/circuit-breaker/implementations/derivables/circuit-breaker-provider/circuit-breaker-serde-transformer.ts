/**
 * @module CircuitBreaker
 */

import type {
    CircuitBreakerEventMap,
    CircuitBreakerTrigger,
    ICircuitBreakerAdapter,
} from "@/circuit-breaker/contracts/_module-exports.js";
import {
    CircuitBreaker,
    type ISerializedCircuitBreaker,
} from "@/circuit-breaker/implementations/derivables/circuit-breaker-provider/circuit-breaker.js";
import type { IEventBus } from "@/event-bus/contracts/_module-exports.js";
import type { Namespace } from "@/namespace/_module-exports.js";
import type { ISerdeTransformer } from "@/serde/contracts/_module-exports.js";
import type { TimeSpan } from "@/time-span/implementations/_module-exports.js";
import {
    getConstructorName,
    type ErrorPolicy,
    type OneOrMore,
} from "@/utilities/_module-exports.js";

/**
 * @internal
 */
export type CircuitBreakerSerdeTransformerSettings = {
    adapter: ICircuitBreakerAdapter;
    namespace: Namespace;
    slowCallTime: TimeSpan;
    errorPolicy: ErrorPolicy;
    trigger: CircuitBreakerTrigger;
    eventBus: IEventBus<CircuitBreakerEventMap>;
    serdeTransformerName: string;
};

/**
 * @internal
 */
export class CircuitBreakerSerdeTransformer
    implements ISerdeTransformer<CircuitBreaker, ISerializedCircuitBreaker>
{
    private readonly adapter: ICircuitBreakerAdapter;
    private readonly namespace: Namespace;
    private readonly slowCallTime: TimeSpan;
    private readonly errorPolicy: ErrorPolicy;
    private readonly trigger: CircuitBreakerTrigger;
    private readonly eventBus: IEventBus<CircuitBreakerEventMap>;
    private readonly serdeTransformerName: string;

    constructor(settings: CircuitBreakerSerdeTransformerSettings) {
        const {
            adapter,
            namespace,
            slowCallTime,
            errorPolicy,
            trigger,
            eventBus,
            serdeTransformerName,
        } = settings;

        this.adapter = adapter;
        this.namespace = namespace;
        this.slowCallTime = slowCallTime;
        this.errorPolicy = errorPolicy;
        this.trigger = trigger;
        this.eventBus = eventBus;
        this.serdeTransformerName = serdeTransformerName;
    }

    get name(): OneOrMore<string> {
        return [
            "circuitBreaker",
            this.serdeTransformerName,
            getConstructorName(this.adapter),
            this.namespace.toString(),
        ].filter((str) => str !== "");
    }

    isApplicable(value: unknown): value is CircuitBreaker {
        const isCircuitBreaker =
            value instanceof CircuitBreaker &&
            getConstructorName(value) === CircuitBreaker.name;
        if (!isCircuitBreaker) {
            return false;
        }

        const isSerdTransformerNameMathcing =
            this.serdeTransformerName ===
            value._internal_getSerdeTransformerName();

        const isNamespaceMatching =
            this.namespace.toString() ===
            value._internal_getNamespace().toString();

        const isAdapterMatching =
            getConstructorName(this.adapter) ===
            getConstructorName(value._internal_getAdapter());

        return (
            isSerdTransformerNameMathcing &&
            isNamespaceMatching &&
            isAdapterMatching
        );
    }

    deserialize(serializedValue: ISerializedCircuitBreaker): CircuitBreaker {
        const { key } = serializedValue;
        const keyObj = this.namespace.create(key);

        return new CircuitBreaker({
            eventDispatcher: this.eventBus,
            adapter: this.adapter,
            key: keyObj,
            slowCallTime: this.slowCallTime,
            errorPolicy: this.errorPolicy,
            trigger: this.trigger,
            serdeTransformerName: this.serdeTransformerName,
            namespace: this.namespace,
        });
    }

    serialize(deserializedValue: CircuitBreaker): ISerializedCircuitBreaker {
        return CircuitBreaker._internal_serialize(deserializedValue);
    }
}
