/**
 * @module Lock
 */

import type { ISerdeTransformer } from "@/serde/contracts/_module-exports.js";
import {
    Lock,
    type ISerializedLock,
} from "@/lock/implementations/derivables/lock-provider/lock.js";
import type { OneOrMore } from "@/utilities/_module-exports.js";
import type {
    IDatabaseLockAdapter,
    ILockAdapter,
    LockEventMap,
} from "@/lock/contracts/_module-exports.js";
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
export type LockSerdeTransformerSettings = {
    adapter: ILockAdapter;
    originalAdapter: ILockAdapter | IDatabaseLockAdapter;
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
    private readonly originalAdapter: ILockAdapter | IDatabaseLockAdapter;
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
            this.namespace._getInternal().namespaced,
        ].filter((str) => str !== "");
    }

    isApplicable(value: unknown): value is Lock {
        const isLock =
            value instanceof Lock && getConstructorName(value) === Lock.name;
        if (!isLock) {
            return false;
        }

        const isSerdTransformerNameMathcing =
            value._internal_getSerdeTransformerName() ===
            this.serdeTransformerName;

        const isNamespaceMatching =
            this.namespace._getInternal().namespaced ===
            value._internal_getNamespace()._getInternal().namespaced;

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
        const keyObj = this.namespace._getInternal().create(key);

        return new Lock({
            createLazyPromise: this.createLazyPromise,
            namespace: this.namespace,
            adapter: this.adapter,
            originalAdapter: this.originalAdapter,
            eventDispatcher: this.eventBus,
            key: keyObj,
            lockId,
            serdeTransformerName: this.serdeTransformerName,
            ttl: ttlInMs !== null ? TimeSpan.fromMilliseconds(ttlInMs) : null,
            defaultBlockingInterval: this.defaultBlockingInterval,
            defaultBlockingTime: this.defaultBlockingTime,
            defaultRefreshTime: this.defaultRefreshTime,
        });
    }

    serialize(deserializedValue: Lock): ISerializedLock {
        return Lock._internal_serialize(deserializedValue);
    }
}
