/**
 * @module Lock
 */

import type { ISerdeTransformer } from "@/serde/contracts/_module-exports.js";
import {
    Lock,
    type ISerializedLock,
} from "@/new-lock/implementations/derivables/lock-provider/lock.js";
import type { OneOrMore } from "@/utilities/types.js";
import type {
    ILockAdapter,
    LockEvents,
} from "@/new-lock/contracts/_module-exports.js";
import {
    LockState,
    type ILockStore,
} from "@/new-lock/implementations/derivables/lock-provider/lock-state.js";
import {
    getConstructorName,
    TimeSpan,
    type IKeyPrefixer,
} from "@/utilities/_module-exports.js";
import type { LazyPromise } from "@/async/_module-exports.js";
import type { IGroupableEventBus } from "@/event-bus/contracts/_module-exports.js";

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
    groupableEventBus: IGroupableEventBus<LockEvents>;
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
    private readonly groupableEventBus: IGroupableEventBus<LockEvents>;

    constructor(settings: LockSerdeTransformerSettings) {
        const {
            adapter,
            lockStore,
            keyPrefixer,
            createLazyPromise,
            defaultBlockingInterval,
            defaultBlockingTime,
            defaultRefreshTime,
            groupableEventBus,
        } = settings;
        this.adapter = adapter;
        this.lockStore = lockStore;
        this.keyPrefixer = keyPrefixer;
        this.createLazyPromise = createLazyPromise;
        this.defaultBlockingInterval = defaultBlockingInterval;
        this.defaultBlockingTime = defaultBlockingTime;
        this.defaultRefreshTime = defaultRefreshTime;
        this.groupableEventBus = groupableEventBus;
    }

    get name(): OneOrMore<string> {
        return ["lock", getConstructorName(this.adapter)];
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
        let lockEventBus = this.groupableEventBus.withGroup(
            keyPrefixer.resolvedRootPrefix,
        );
        let lockProviderEventDispatcher = this.groupableEventBus.withGroup([
            keyPrefixer.resolvedRootPrefix,
            keyObj.resolved,
        ]);

        if (keyPrefixer.resolvedGroup) {
            lockEventBus = this.groupableEventBus.withGroup([
                keyPrefixer.resolvedRootPrefix,
                keyPrefixer.resolvedGroup,
            ]);
            lockProviderEventDispatcher = this.groupableEventBus.withGroup([
                keyPrefixer.resolvedRootPrefix,
                keyPrefixer.resolvedGroup,
                keyObj.resolved,
            ]);
        }
        return new Lock({
            group,
            createLazyPromise: this.createLazyPromise,
            adapterPromise: Promise.resolve(this.adapter),
            lockState: new LockState(this.lockStore, keyObj.prefixed),
            lockEventBus,
            lockProviderEventDispatcher,
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
