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
    ILockAdapter,
    LockEvents,
} from "@/lock/contracts/_module-exports.js";
import {
    LockState,
    type ILockStore,
} from "@/lock/implementations/derivables/lock-provider/lock-state.js";
import {
    getConstructorName,
    TimeSpan,
    type IKeyPrefixer,
} from "@/utilities/_module-exports.js";
import type { LazyPromise } from "@/async/_module-exports.js";
import type { IEventBus } from "@/event-bus/contracts/_module-exports.js";

/**
 * @internal
 */
export type LockSerdeTransformerSettings = {
    adapter: ILockAdapter;
    lockStore: ILockStore;
    keyPrefixer: IKeyPrefixer;
    createLazyPromise: <TValue = void>(
        asyncFn: () => PromiseLike<TValue>,
    ) => LazyPromise<TValue>;
    defaultBlockingInterval: TimeSpan;
    defaultBlockingTime: TimeSpan;
    defaultRefreshTime: TimeSpan;
    eventBus: IEventBus<LockEvents>;
    serdeTransformerName: string;
};

/**
 * @internal
 */
export class LockSerdeTransformer
    implements ISerdeTransformer<Lock, ISerializedLock>
{
    private readonly adapter: ILockAdapter;
    private readonly lockStore: ILockStore;
    private readonly keyPrefixer: IKeyPrefixer;
    private readonly createLazyPromise: <TValue = void>(
        asyncFn: () => PromiseLike<TValue>,
    ) => LazyPromise<TValue>;
    private readonly defaultBlockingInterval: TimeSpan;
    private readonly defaultBlockingTime: TimeSpan;
    private readonly defaultRefreshTime: TimeSpan;
    private readonly eventBus: IEventBus<LockEvents>;
    private readonly serdeTransformerName: string;

    constructor(settings: LockSerdeTransformerSettings) {
        const {
            adapter,
            lockStore,
            keyPrefixer,
            createLazyPromise,
            defaultBlockingInterval,
            defaultBlockingTime,
            defaultRefreshTime,
            eventBus,
            serdeTransformerName,
        } = settings;
        this.serdeTransformerName = serdeTransformerName;
        this.adapter = adapter;
        this.lockStore = lockStore;
        this.keyPrefixer = keyPrefixer;
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
            getConstructorName(this.adapter),
        ];
    }

    isApplicable(value: unknown): value is Lock {
        return value instanceof Lock && getConstructorName(value) === Lock.name;
    }

    deserialize(serializedValue: ISerializedLock): Lock {
        const { group, key, owner, ttlInMs, expirationInMs } = serializedValue;
        const isRoot = group === null;
        let keyPrefixer = this.keyPrefixer;
        if (!isRoot) {
            keyPrefixer = this.keyPrefixer.withGroup(group);
        }

        const keyObj = keyPrefixer.create(key);

        return new Lock({
            group,
            createLazyPromise: this.createLazyPromise,
            adapter: this.adapter,
            lockState: new LockState(this.lockStore, keyObj.prefixed),
            eventDispatcher: this.eventBus,
            key: keyObj,
            owner,
            ttl: ttlInMs ? TimeSpan.fromMilliseconds(ttlInMs) : null,
            expirationInMs,
            defaultBlockingInterval: this.defaultBlockingInterval,
            defaultBlockingTime: this.defaultBlockingTime,
            defaultRefreshTime: this.defaultRefreshTime,
        });
    }

    serialize(deserializedValue: Lock): ISerializedLock {
        return Lock.serialize(deserializedValue);
    }
}
