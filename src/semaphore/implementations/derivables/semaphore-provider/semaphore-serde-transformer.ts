/**
 * @module Semaphore
 */

import type { ISerdeTransformer } from "@/serde/contracts/_module-exports.js";
import {
    Semaphore,
    type ISerializedSemaphore,
} from "@/semaphore/implementations/derivables/semaphore-provider/semaphore.js";
import { type OneOrMore } from "@/utilities/_module-exports.js";
import type {
    IDatabaseSemaphoreAdapter,
    ISemaphoreAdapter,
    SemaphoreAdapterVariants,
    SemaphoreEventMap,
} from "@/semaphore/contracts/_module-exports.js";
import {
    getConstructorName,
    type Namespace,
} from "@/utilities/_module-exports.js";
import type { LazyPromise } from "@/async/_module-exports.js";
import type { IEventBus } from "@/event-bus/contracts/_module-exports.js";
import { TimeSpan } from "@/time-span/implementations/_module-exports.js";

/**
 * @internal
 */
export type SemaphoreSerdeTransformerSettings = {
    adapter: ISemaphoreAdapter;
    originalAdapter: SemaphoreAdapterVariants;
    namespace: Namespace;
    createLazyPromise: <TValue = void>(
        asyncFn: () => Promise<TValue>,
    ) => LazyPromise<TValue>;
    defaultBlockingInterval: TimeSpan;
    defaultBlockingTime: TimeSpan;
    defaultRefreshTime: TimeSpan;
    eventBus: IEventBus<SemaphoreEventMap>;
    serdeTransformerName: string;
};

/**
 * @internal
 */
export class SemaphoreSerdeTransformer
    implements ISerdeTransformer<Semaphore, ISerializedSemaphore>
{
    private readonly adapter: ISemaphoreAdapter;
    private readonly originalAdapter:
        | ISemaphoreAdapter
        | IDatabaseSemaphoreAdapter;
    private readonly namespace: Namespace;
    private readonly createLazyPromise: <TValue = void>(
        asyncFn: () => Promise<TValue>,
    ) => LazyPromise<TValue>;
    private readonly defaultBlockingInterval: TimeSpan;
    private readonly defaultBlockingTime: TimeSpan;
    private readonly defaultRefreshTime: TimeSpan;
    private readonly eventBus: IEventBus<SemaphoreEventMap>;
    private readonly serdeTransformerName: string;

    constructor(settings: SemaphoreSerdeTransformerSettings) {
        const {
            adapter,
            originalAdapter,
            namespace,
            createLazyPromise,
            defaultBlockingInterval,
            defaultBlockingTime,
            defaultRefreshTime,
            eventBus,
            serdeTransformerName,
        } = settings;
        this.serdeTransformerName = serdeTransformerName;
        this.adapter = adapter;
        this.originalAdapter = originalAdapter;
        this.namespace = namespace;
        this.createLazyPromise = createLazyPromise;
        this.defaultBlockingInterval = defaultBlockingInterval;
        this.defaultBlockingTime = defaultBlockingTime;
        this.defaultRefreshTime = defaultRefreshTime;
        this.eventBus = eventBus;
    }

    get name(): OneOrMore<string> {
        return [
            "semaphore",
            this.serdeTransformerName,
            getConstructorName(this.originalAdapter),
            this.namespace._internal_get().namespaced,
        ].filter((str) => str !== "");
    }

    isApplicable(value: unknown): value is Semaphore {
        const isSemaphore =
            value instanceof Semaphore &&
            getConstructorName(value) === Semaphore.name;
        if (!isSemaphore) {
            return false;
        }

        const isSerdTransformerNameMathcing =
            value._internal_getSerdeTransformerName() ===
            this.serdeTransformerName;

        const isNamespaceMatching =
            this.namespace._internal_get().namespaced ===
            value._internal_getNamespace()._internal_get().namespaced;

        const isAdapterMatching =
            getConstructorName(this.originalAdapter) ===
            getConstructorName(value._internal_getAdapter());

        return (
            isSerdTransformerNameMathcing &&
            isNamespaceMatching &&
            isAdapterMatching
        );
    }

    deserialize(serializedValue: ISerializedSemaphore): Semaphore {
        const { key, slotId, limit, ttlInMs } = serializedValue;
        const keyObj = this.namespace._internal_get().create(key);
        return new Semaphore({
            slotId,
            createLazyPromise: this.createLazyPromise,
            adapter: this.adapter,
            originalAdapter: this.originalAdapter,
            eventDispatcher: this.eventBus,
            key: keyObj,
            limit,
            serdeTransformerName: this.serdeTransformerName,
            ttl: ttlInMs === null ? null : TimeSpan.fromMilliseconds(ttlInMs),
            defaultBlockingInterval: this.defaultBlockingInterval,
            defaultBlockingTime: this.defaultBlockingTime,
            defaultRefreshTime: this.defaultRefreshTime,
            namespace: this.namespace,
        });
    }

    serialize(deserializedValue: Semaphore): ISerializedSemaphore {
        return Semaphore._internal_serialize(deserializedValue);
    }
}
