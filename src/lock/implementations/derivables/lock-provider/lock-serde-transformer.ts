/**
 * @module Lock
 */

import type { ISerdeTransformer } from "@/serde/contracts/_module-exports.js";
import {
    Lock,
    type ISerializedLock,
} from "@/lock/implementations/derivables/lock-provider/lock.js";
import type { OneOrMore, Namespace } from "@/utilities/_module-exports.js";
import type {
    ILockAdapter,
    LockAdapterVariants,
    LockEventMap,
} from "@/lock/contracts/_module-exports.js";
import { getConstructorName } from "@/utilities/_module-exports.js";
import type { LazyPromise } from "@/async/_module-exports.js";
import type { IEventBus } from "@/event-bus/contracts/_module-exports.js";
import { TimeSpan } from "@/time-span/implementations/_module-exports.js";

/**
 * @internal
 */
export type LockSerdeTransformerSettings = {
    adapter: ILockAdapter;
    originalAdapter: LockAdapterVariants;
    namespace: Namespace;
    createLazyPromise: <TValue = void>(
        asyncFn: () => Promise<TValue>,
    ) => LazyPromise<TValue>;
    defaultBlockingInterval: TimeSpan;
    defaultBlockingTime: TimeSpan;
    defaultRefreshTime: TimeSpan;
    eventBus: IEventBus<LockEventMap>;
    serdeTransformerName: string;
};

/**
 * @internal
 */
export class LockSerdeTransformer
    implements ISerdeTransformer<Lock, ISerializedLock>
{
    private readonly adapter: ILockAdapter;
    private readonly originalAdapter: LockAdapterVariants;
    private readonly namespace: Namespace;
    private readonly createLazyPromise: <TValue = void>(
        asyncFn: () => Promise<TValue>,
    ) => LazyPromise<TValue>;
    private readonly defaultBlockingInterval: TimeSpan;
    private readonly defaultBlockingTime: TimeSpan;
    private readonly defaultRefreshTime: TimeSpan;
    private readonly eventBus: IEventBus<LockEventMap>;
    private readonly serdeTransformerName: string;

    constructor(settings: LockSerdeTransformerSettings) {
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
            "lock",
            this.serdeTransformerName,
            getConstructorName(this.originalAdapter),
            this.namespace._internal_get().namespaced,
        ].filter((str) => str !== "");
    }

    isApplicable(value: unknown): value is Lock {
        const isLock =
            value instanceof Lock && getConstructorName(value) === Lock.name;
        if (!isLock) {
            return false;
        }

        const isSerdTransformerNameMathcing =
            this.serdeTransformerName ===
            value._internal_getSerdeTransformerName();

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

    deserialize(serializedValue: ISerializedLock): Lock {
        const { key, ttlInMs, lockId } = serializedValue;
        const keyObj = this.namespace._internal_get().create(key);

        return new Lock({
            createLazyPromise: this.createLazyPromise,
            namespace: this.namespace,
            adapter: this.adapter,
            originalAdapter: this.originalAdapter,
            eventDispatcher: this.eventBus,
            key: keyObj,
            lockId,
            serdeTransformerName: this.serdeTransformerName,
            ttl: ttlInMs === null ? null : TimeSpan.fromMilliseconds(ttlInMs),
            defaultBlockingInterval: this.defaultBlockingInterval,
            defaultBlockingTime: this.defaultBlockingTime,
            defaultRefreshTime: this.defaultRefreshTime,
        });
    }

    serialize(deserializedValue: Lock): ISerializedLock {
        return Lock._internal_serialize(deserializedValue);
    }
}
