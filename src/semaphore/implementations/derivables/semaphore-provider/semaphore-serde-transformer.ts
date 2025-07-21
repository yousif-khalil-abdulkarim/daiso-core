/**
 * @module Semaphore
 */

import type { ISerdeTransformer } from "@/serde/contracts/_module-exports.js";
import {
    Semaphore,
    type ISerializedSemaphore,
} from "@/semaphore/implementations/derivables/semaphore-provider/semaphore.js";
import type { OneOrMore } from "@/utilities/_module-exports.js";
import type {
    ISemaphoreAdapter,
    SemaphoreEventMap,
} from "@/semaphore/contracts/_module-exports.js";
import {
    SemaphoreSlotState,
    type ISemaphoreStore,
} from "@/semaphore/implementations/derivables/semaphore-provider/semaphore-slot-state.js";
import {
    getConstructorName,
    TimeSpan,
    type Namespace,
} from "@/utilities/_module-exports.js";
import type { LazyPromise } from "@/async/_module-exports.js";
import type { IEventBus } from "@/event-bus/contracts/_module-exports.js";

/**
 * @internal
 */
export type SemaphoreSerdeTransformerSettings = {
    adapter: ISemaphoreAdapter;
    semaphoreStore: ISemaphoreStore;
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
    private readonly semaphoreStore: ISemaphoreStore;
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
            semaphoreStore,
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
        this.semaphoreStore = semaphoreStore;
        this.namespace = namespace;
        this.createLazyPromise = createLazyPromise;
        this.defaultBlockingInterval = defaultBlockingInterval;
        this.defaultBlockingTime = defaultBlockingTime;
        this.defaultRefreshTime = defaultRefreshTime;
        this.eventBus = eventBus;
    }

    get name(): OneOrMore<string> {
        if (this.serdeTransformerName) {
            return ["semaphore", getConstructorName(this.adapter)];
        }
        return [
            "semaphore",
            this.serdeTransformerName,
            getConstructorName(this.adapter),
        ];
    }

    isApplicable(value: unknown): value is Semaphore {
        return (
            value instanceof Semaphore &&
            getConstructorName(value) === Semaphore.name &&
            value._internal_getSerdeTransformerName() ===
                this.serdeTransformerName
        );
    }

    deserialize(serializedValue: ISerializedSemaphore): Semaphore {
        const { key, keyState, slotId, ttlInMs, limit, expirationInMs } =
            serializedValue;
        const keyObj = this.namespace._getInternal().create(key);

        // We merge the state of this server/process with serialized state from another server/process
        const currentKeyState = this.semaphoreStore[key]?.entries() ?? [];
        const serializedKeyState = Object.entries(keyState).map<
            [string, Date | null]
        >(([key, value]) => [
            key,
            typeof value === "number" ? new Date(value) : null,
        ]);
        const mergedKeyState = new Map([
            ...currentKeyState,
            ...serializedKeyState,
        ]);
        const newStore = {
            ...this.semaphoreStore,
            [key]: mergedKeyState,
        };

        return new Semaphore({
            slotId,
            createLazyPromise: this.createLazyPromise,
            adapter: this.adapter,
            semaphoreState: new SemaphoreSlotState({
                slotId,
                key,
                limit,
                store: newStore,
            }),
            eventDispatcher: this.eventBus,
            key: keyObj,
            limit,
            serdeTransformerName: this.serdeTransformerName,
            ttl: ttlInMs !== null ? TimeSpan.fromMilliseconds(ttlInMs) : null,
            expirationInMs,
            defaultBlockingInterval: this.defaultBlockingInterval,
            defaultBlockingTime: this.defaultBlockingTime,
            defaultRefreshTime: this.defaultRefreshTime,
        });
    }

    serialize(deserializedValue: Semaphore): ISerializedSemaphore {
        return Semaphore._internal_serialize(deserializedValue);
    }
}
