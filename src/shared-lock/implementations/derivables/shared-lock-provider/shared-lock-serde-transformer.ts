/**
 * @module SharedLock
 */

import type { ISerdeTransformer } from "@/serde/contracts/_module-exports.js";
import {
    SharedLock,
    type ISerializedSharedLock,
} from "@/shared-lock/implementations/derivables/shared-lock-provider/shared-lock.js";
import { type OneOrMore } from "@/utilities/_module-exports.js";
import type {
    IDatabaseSharedLockAdapter,
    ISharedLockAdapter,
    SharedLockAdapterVariants,
    SharedLockEventMap,
} from "@/shared-lock/contracts/_module-exports.js";
import { getConstructorName } from "@/utilities/_module-exports.js";
import type { Task } from "@/task/_module-exports.js";
import type { IEventBus } from "@/event-bus/contracts/_module-exports.js";
import { TimeSpan } from "@/time-span/implementations/_module-exports.js";
import type { Namespace } from "@/namespace/_module-exports.js";

/**
 * @internal
 */
export type SharedLockSerdeTransformerSettings = {
    adapter: ISharedLockAdapter;
    originalAdapter: SharedLockAdapterVariants;
    namespace: Namespace;
    createTask: <TValue = void>(
        asyncFn: () => Promise<TValue>,
    ) => Task<TValue>;
    defaultBlockingInterval: TimeSpan;
    defaultBlockingTime: TimeSpan;
    defaultRefreshTime: TimeSpan;
    eventBus: IEventBus<SharedLockEventMap>;
    serdeTransformerName: string;
};

/**
 * @internal
 */
export class SharedLockSerdeTransformer
    implements ISerdeTransformer<SharedLock, ISerializedSharedLock>
{
    private readonly adapter: ISharedLockAdapter;
    private readonly originalAdapter:
        | ISharedLockAdapter
        | IDatabaseSharedLockAdapter;
    private readonly namespace: Namespace;
    private readonly createTask: <TValue = void>(
        asyncFn: () => Promise<TValue>,
    ) => Task<TValue>;
    private readonly defaultBlockingInterval: TimeSpan;
    private readonly defaultBlockingTime: TimeSpan;
    private readonly defaultRefreshTime: TimeSpan;
    private readonly eventBus: IEventBus<SharedLockEventMap>;
    private readonly serdeTransformerName: string;

    constructor(settings: SharedLockSerdeTransformerSettings) {
        const {
            adapter,
            originalAdapter,
            namespace,
            createTask,
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
        this.createTask = createTask;
        this.defaultBlockingInterval = defaultBlockingInterval;
        this.defaultBlockingTime = defaultBlockingTime;
        this.defaultRefreshTime = defaultRefreshTime;
        this.eventBus = eventBus;
    }

    get name(): OneOrMore<string> {
        return [
            "shared-lock",
            this.serdeTransformerName,
            getConstructorName(this.originalAdapter),
            this.namespace.toString(),
        ].filter((str) => str !== "");
    }

    isApplicable(value: unknown): value is SharedLock {
        const isSharedLock =
            value instanceof SharedLock &&
            getConstructorName(value) === SharedLock.name;
        if (!isSharedLock) {
            return false;
        }

        const isSerdTransformerNameMathcing =
            value._internal_getSerdeTransformerName() ===
            this.serdeTransformerName;

        const isNamespaceMatching =
            this.namespace.toString() ===
            value._internal_getNamespace().toString();

        const isAdapterMatching =
            getConstructorName(this.originalAdapter) ===
            getConstructorName(value._internal_getAdapter());

        return (
            isSerdTransformerNameMathcing &&
            isNamespaceMatching &&
            isAdapterMatching
        );
    }

    deserialize(serializedValue: ISerializedSharedLock): SharedLock {
        const { key, lockId, limit, ttlInMs } = serializedValue;
        const keyObj = this.namespace.create(key);
        return new SharedLock({
            lockId,
            createTask: this.createTask,
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

    serialize(deserializedValue: SharedLock): ISerializedSharedLock {
        return SharedLock._internal_serialize(deserializedValue);
    }
}
