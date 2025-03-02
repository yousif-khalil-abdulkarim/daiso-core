/**
 * @module Lock
 */

import {
    getConstructorName,
    KeyPrefixer,
    TimeSpan,
    type OneOrMore,
} from "@/utilities/_module-exports.js";
import type { LockEvents } from "@/lock/contracts/_module-exports.js";
import type { ILockAdapter } from "@/lock/contracts/_module-exports.js";
import type { BackoffPolicy, RetryPolicy } from "@/async/_module-exports.js";
import {
    Lock,
    type ISerializedLock,
} from "@/lock/implementations/derivables/lock-provider/lock.js";
import type {
    IEventBus,
    IGroupableEventBus,
} from "@/event-bus/contracts/_module-exports.js";
import { NoOpEventBusAdapter } from "@/event-bus/implementations/adapters/_module-exports.js";
import { EventBus } from "@/event-bus/implementations/derivables/_module-exports.js";
import type { ISerdeTransformer } from "@/serde/contracts/_module-exports.js";
import type { ILockStateRecord } from "@/lock/implementations/derivables/lock-provider/lock-state.js";

/**
 * @internal
 */
export type LockSerdeTransformerSettings = {
    adapter: ILockAdapter;
    eventBus: IGroupableEventBus<any>;
    defaultBlockingTime: TimeSpan;
    defaultBlockingInterval: TimeSpan;
    defaultRefreshTime: TimeSpan;
    retryAttempts?: number | null;
    backoffPolicy?: BackoffPolicy | null;
    retryPolicy?: RetryPolicy | null;
    timeout?: TimeSpan | null;
};

/**
 * @internal
 */
export class LockSerdeTransformer
    implements ISerdeTransformer<Lock, ISerializedLock>
{
    private readonly adapter: ILockAdapter;
    private readonly defaultBlockingInterval: TimeSpan;
    private readonly defaultBlockingTime: TimeSpan;
    private readonly defaultRefreshTime: TimeSpan;
    private readonly retryAttempts: number | null;
    private readonly backoffPolicy: BackoffPolicy | null;
    private readonly retryPolicy: RetryPolicy | null;
    private readonly timeout: TimeSpan | null;
    private readonly eventBus: IGroupableEventBus<LockEvents>;
    private readonly lockProviderEventBus: IEventBus<LockEvents>;
    private stateRecord: ILockStateRecord = {};

    constructor(settings: LockSerdeTransformerSettings) {
        const {
            adapter,
            defaultBlockingInterval,
            defaultBlockingTime,
            defaultRefreshTime,
            retryAttempts = null,
            backoffPolicy = null,
            retryPolicy = null,
            timeout = null,
            eventBus = new EventBus({
                keyPrefixer: new KeyPrefixer("event-bus"),
                adapter: new NoOpEventBusAdapter(),
            }),
        } = settings;
        this.adapter = adapter;
        this.defaultBlockingInterval = defaultBlockingInterval;
        this.defaultBlockingTime = defaultBlockingTime;
        this.defaultRefreshTime = defaultRefreshTime;
        this.retryAttempts = retryAttempts;
        this.backoffPolicy = backoffPolicy;
        this.retryPolicy = retryPolicy;
        this.timeout = timeout;
        this.eventBus = eventBus;
        this.lockProviderEventBus = eventBus.withGroup(adapter.getGroup());
    }

    get name(): OneOrMore<string> {
        return ["lock", getConstructorName(this.adapter)];
    }

    isApplicable(value: unknown): value is Lock {
        return value instanceof Lock && getConstructorName(value) === Lock.name;
    }

    deserialize(serializedValue: ISerializedLock): Lock {
        const { group, key, owner, ttlInMs } = serializedValue;
        let adapter = this.adapter;
        const rootGroup = adapter.getGroup();
        const isRoot = group === rootGroup;
        if (!isRoot) {
            const groupWithouRoot = group.slice(
                this.adapter.getGroup().length + 1,
            );
            adapter = adapter.withGroup(groupWithouRoot);
        }
        const ttl = ttlInMs ? TimeSpan.fromMilliseconds(ttlInMs) : null;
        return new Lock({
            defaultBlockingInterval: this.defaultBlockingInterval,
            defaultBlockingTime: this.defaultBlockingTime,
            defaultRefreshTime: this.defaultRefreshTime,
            lockProviderEventDispatcher: this.lockProviderEventBus,
            lockEventBus: this.eventBus,
            adapter,
            key,
            owner,
            ttl,
            lazyPromiseSettings: {
                backoffPolicy: this.backoffPolicy,
                retryAttempts: this.retryAttempts,
                retryPolicy: this.retryPolicy,
                timeout: this.timeout,
            },
            stateRecord: this.stateRecord,
            expirationInMs: serializedValue.expirationInMs,
        });
    }

    serialize(deserializedValue: Lock): ISerializedLock {
        return Lock.serialize(deserializedValue);
    }
}
