/**
 * @module Semaphore
 */

import type { ISerdeTransformer } from "@/serde/contracts/_module-exports.js";
import {
    Semaphore,
    type ISerializedSemaphore,
} from "@/semaphore/implementations/derivables/semaphore-provider/semaphore.js";
import { TimeSpan, type OneOrMore } from "@/utilities/_module-exports.js";
import type {
    ISemaphoreAdapter,
    SemaphoreEventMap,
} from "@/semaphore/contracts/_module-exports.js";
import {
    getConstructorName,
    type Namespace,
} from "@/utilities/_module-exports.js";
import type { LazyPromise } from "@/async/_module-exports.js";
import type { IEventBus } from "@/event-bus/contracts/_module-exports.js";

/**
 * @internal
 */
export type SemaphoreSerdeTransformerSettings = {
    adapter: ISemaphoreAdapter;
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
        this.namespace = namespace;
        this.createLazyPromise = createLazyPromise;
        this.defaultBlockingInterval = defaultBlockingInterval;
        this.defaultBlockingTime = defaultBlockingTime;
        this.defaultRefreshTime = defaultRefreshTime;
        this.eventBus = eventBus;
    }

    get name(): OneOrMore<string> {
        if (this.serdeTransformerName === "") {
            return [
                "semaphore",
                getConstructorName(this.adapter),
                this.namespace._getInternal().namespaced,
            ];
        }
        return [
            "semaphore",
            this.serdeTransformerName,
            getConstructorName(this.adapter),
            this.namespace._getInternal().namespaced,
        ];
    }

    isApplicable(value: unknown): value is Semaphore {
        return (
            value instanceof Semaphore &&
            getConstructorName(value) === Semaphore.name &&
            value._internal_getSerdeTransformerName() ===
                this.serdeTransformerName &&
            this.namespace._getInternal().namespaced ===
                value._internal_getNamespace()._getInternal().namespaced
        );
    }

    deserialize(serializedValue: ISerializedSemaphore): Semaphore {
        const { key, slotId, limit, expirationInMs } = serializedValue;
        const keyObj = this.namespace._getInternal().create(key);
        return new Semaphore({
            slotId,
            createLazyPromise: this.createLazyPromise,
            adapter: this.adapter,
            eventDispatcher: this.eventBus,
            key: keyObj,
            limit,
            serdeTransformerName: this.serdeTransformerName,
            ttl:
                expirationInMs !== null
                    ? TimeSpan.fromMilliseconds(expirationInMs)
                    : null,
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
