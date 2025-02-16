/**
 * @module Lock
 */

import {
    getConstructorName,
    TimeSpan,
    type OneOrMore,
} from "@/utilities/_module";
import type { LockEvents } from "@/lock/contracts/_module";
import type { ILockAdapter } from "@/lock/contracts/_module";
import type { BackoffPolicy, RetryPolicy } from "@/async/_module";
import {
    Lock,
    type ISerializedLock,
} from "@/lock/implementations/derivables/lock-provider/lock";
import type {
    IEventBus,
    IGroupableEventBus,
} from "@/event-bus/contracts/_module";
import { NoOpEventBusAdapter } from "@/event-bus/implementations/adapters/_module";
import { EventBus } from "@/event-bus/implementations/derivables/_module";
import type { ISerdeTransformer } from "@/serde/contracts/_module";
import type { ILockStateRecord } from "@/lock/implementations/derivables/lock-provider/lock-state";

/**
 * @internal
 */
export type LockSerdeTransformerSettings = {
    adapter: ILockAdapter;

    /**
     * In order to listen to events of <i>{@link LockProvider}</i> class you must pass in <i>{@link IGroupableEventBus}</i>.
     */
    eventBus: IGroupableEventBus<any>;

    /**
     * The default refresh time used in the <i>{@link ILock}</i> <i>extend</i> method.
     * @default TimeSpan.fromMinutes(5);
     */
    defaultRefreshTime: TimeSpan;

    /**
     * The default retry attempt to use in the returned <i>LazyPromise</i>.
     * @default {null}
     */
    retryAttempts?: number | null;

    /**
     * The default backof policy to use in the returned <i>LazyPromise</i>.
     * @default {null}
     */
    backoffPolicy?: BackoffPolicy | null;

    /**
     * The default retry policy to use in the returned <i>LazyPromise</i>.
     * @default {null}
     */
    retryPolicy?: RetryPolicy | null;

    /**
     * The default timeout to use in the returned <i>LazyPromise</i>.
     * @default {null}
     */
    timeout?: TimeSpan | null;
};

/**
 * @internal
 */
export class LockSerdeTransformer
    implements ISerdeTransformer<Lock, ISerializedLock>
{
    private readonly adapter: ILockAdapter;
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
            defaultRefreshTime,
            retryAttempts = null,
            backoffPolicy = null,
            retryPolicy = null,
            timeout = null,
            eventBus = new EventBus({
                adapter: new NoOpEventBusAdapter(),
            }),
        } = settings;
        this.adapter = adapter;
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
            lockProviderEventDispatcher: this.lockProviderEventBus,
            lockEventBus: this.eventBus,
            adapter,
            defaultRefreshTime: this.defaultRefreshTime,
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
