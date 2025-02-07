/**
 * @module Lock
 */

import type { LazyPromiseable, Result } from "@/utilities/_module";
import type { TimeSpan } from "@/utilities/_module";
import type { BackoffPolicy, RetryPolicy } from "@/async/_module";
import { LazyPromise } from "@/async/_module";
import type { ILockAdapter, LockEvents } from "@/lock/contracts/_module";
import {
    KeyAcquiredLockEvent,
    KeyAlreadyAcquiredLockError,
    KeyAlreadyAcquiredLockEvent,
    KeyForceReleasedLockEvent,
    KeyReleasedLockEvent,
    KeyRefreshedLockEvent,
    UnableToAquireLockError,
    UnownedExtendLockError,
    UnownedRefreshLockEvent,
    UnownedReleaseLockError,
    UnownedReleaseLockEvent,
    type ILock,
} from "@/lock/contracts/_module";
import type {
    EventClass,
    Listener,
    EventInstance,
    Unsubscribe,
    IGroupableEventBus,
    IEventBus,
} from "@/event-bus/contracts/_module";

/**
 * @group Derivables
 */
export type ISerializedLock = {
    group: string;
    key: string;
    owner: string;
    ttlInMs: number | null;
};

/**
 * @internal
 */
export type LockSettings = {
    eventBus: IGroupableEventBus<LockEvents>;
    adapter: ILockAdapter;
    key: string;
    owner: string;
    defaultRefreshTime: TimeSpan;
    ttl: TimeSpan | null;
    lazyPromiseSettings: {
        retryAttempts: number | null;
        backoffPolicy: BackoffPolicy | null;
        retryPolicy: RetryPolicy | null;
        timeout: TimeSpan | null;
    };
};

/**
 * @internal
 */
export class Lock implements ILock {
    static serialize(deserializedValue: Lock): ISerializedLock {
        return {
            group: deserializedValue.adapter.getGroup(),
            key: deserializedValue.key,
            owner: deserializedValue.owner,
            ttlInMs: deserializedValue.ttl?.toMilliseconds() ?? null,
        };
    }

    private readonly eventBus: IEventBus<LockEvents>;
    private readonly adapter: ILockAdapter;
    private readonly key: string;
    private readonly owner: string;
    private readonly ttl: TimeSpan | null;
    private readonly defaultRefreshTime: TimeSpan;
    private readonly lazyPromiseSettings: LockSettings["lazyPromiseSettings"];

    constructor(settings: LockSettings) {
        const {
            eventBus,
            defaultRefreshTime,
            adapter,
            key,
            owner,
            ttl,
            lazyPromiseSettings,
        } = settings;
        this.eventBus = eventBus.withGroup([adapter.getGroup(), key]);
        this.defaultRefreshTime = defaultRefreshTime;
        this.adapter = adapter;
        this.key = key;
        this.owner = owner;
        this.ttl = ttl;
        this.lazyPromiseSettings = lazyPromiseSettings;
    }

    private createLayPromise<TValue = void>(
        asyncFn: () => PromiseLike<TValue>,
    ): LazyPromise<TValue> {
        return new LazyPromise(asyncFn)
            .setRetryAttempts(this.lazyPromiseSettings.retryAttempts)
            .setBackoffPolicy(this.lazyPromiseSettings.backoffPolicy)
            .setRetryPolicy(this.lazyPromiseSettings.retryPolicy)
            .setTimeout(this.lazyPromiseSettings.timeout);
    }

    run<TValue = void>(
        asyncFn: LazyPromiseable<TValue>,
        shouldTimeout = false,
    ): LazyPromise<Result<TValue, KeyAlreadyAcquiredLockError>> {
        return this.createLayPromise(
            async (): Promise<Result<TValue, KeyAlreadyAcquiredLockError>> => {
                if (typeof asyncFn === "function") {
                    asyncFn = new LazyPromise(asyncFn);
                }
                try {
                    const hasAquired = await this.acquire();
                    if (!hasAquired) {
                        return [
                            null,
                            new KeyAlreadyAcquiredLockError("!!__message__!!"),
                        ];
                    }
                    if (shouldTimeout) {
                        asyncFn.setTimeout(this.ttl);
                    }
                    return [await asyncFn, null];
                } finally {
                    await this.release();
                }
            },
        ).setRetryPolicy((error) => error instanceof UnableToAquireLockError);
    }

    runOrFail<TValue = void>(
        asyncFn: LazyPromiseable<TValue>,
        shouldTimeout = false,
    ): LazyPromise<TValue> {
        return this.createLayPromise(async () => {
            try {
                if (typeof asyncFn === "function") {
                    asyncFn = new LazyPromise(asyncFn);
                }
                await this.acquireOrFail();
                if (shouldTimeout) {
                    asyncFn.setTimeout(this.ttl);
                }
                return await asyncFn;
            } finally {
                await this.release();
            }
        }).setRetryPolicy(
            (error) =>
                error instanceof UnableToAquireLockError ||
                error instanceof KeyAlreadyAcquiredLockError,
        );
    }

    acquire(): LazyPromise<boolean> {
        return this.createLayPromise(async () => {
            const hasAquired = await this.adapter.acquire(
                this.key,
                this.owner,
                this.ttl,
            );
            if (hasAquired) {
                await this.eventBus.dispatch(
                    new KeyAcquiredLockEvent({
                        key: this.key,
                        owner: this.owner,
                        ttl: this.ttl,
                    }),
                );
            } else {
                await this.eventBus.dispatch(
                    new KeyAlreadyAcquiredLockEvent({
                        key: this.key,
                        owner: this.owner,
                    }),
                );
            }
            return hasAquired;
        });
    }

    acquireOrFail(): LazyPromise<void> {
        return this.createLayPromise(async () => {
            const hasAquired = await this.acquire();
            if (!hasAquired) {
                throw new KeyAlreadyAcquiredLockError("!!__message__!!");
            }
        });
    }

    release(): LazyPromise<boolean> {
        return this.createLayPromise(async () => {
            const hasReleased = await this.adapter.release(
                this.key,
                this.owner,
            );
            if (hasReleased) {
                await this.eventBus.dispatch(
                    new KeyReleasedLockEvent({
                        key: this.key,
                        owner: this.owner,
                    }),
                );
            } else {
                await this.eventBus.dispatch(
                    new UnownedReleaseLockEvent({
                        key: this.key,
                        owner: this.owner,
                    }),
                );
            }
            return hasReleased;
        });
    }

    releaseOrFail(): LazyPromise<void> {
        return this.createLayPromise(async () => {
            const hasRelased = await this.release();
            if (!hasRelased) {
                throw new UnownedReleaseLockError("!!__message__!!");
            }
        });
    }

    forceRelease(): LazyPromise<void> {
        return this.createLayPromise(async () => {
            await this.adapter.forceRelease(this.key);
            await this.eventBus.dispatch(
                new KeyForceReleasedLockEvent({
                    key: this.key,
                }),
            );
        });
    }

    isExpired(): LazyPromise<boolean> {
        return this.createLayPromise(async () => {
            const isLocked = await this.isLocked();
            return !isLocked;
        });
    }

    isLocked(): LazyPromise<boolean> {
        return this.createLayPromise(async () => {
            return await this.adapter.isLocked(this.key);
        });
    }

    refresh(ttl: TimeSpan = this.defaultRefreshTime): LazyPromise<boolean> {
        return this.createLayPromise(async () => {
            const hasExtended = await this.adapter.refresh(
                this.key,
                this.owner,
                ttl,
            );
            if (hasExtended) {
                await this.eventBus.dispatch(
                    new KeyRefreshedLockEvent({
                        key: this.key,
                        owner: this.owner,
                        ttl,
                    }),
                );
            } else {
                await this.eventBus.dispatch(
                    new UnownedRefreshLockEvent({
                        key: this.key,
                        owner: this.owner,
                    }),
                );
            }
            return hasExtended;
        });
    }

    refreshOrFail(ttl?: TimeSpan): LazyPromise<void> {
        return this.createLayPromise(async () => {
            const hasExtended = await this.refresh(ttl);
            if (!hasExtended) {
                throw new UnownedExtendLockError("!!__message__!!");
            }
        });
    }

    getRemainingTime(): LazyPromise<TimeSpan | null> {
        // eslint-disable-next-line @typescript-eslint/require-await
        return this.createLayPromise(async () => {
            return await this.adapter.getRemainingTime(this.key);
        });
    }

    getOwner(): LazyPromise<string> {
        // eslint-disable-next-line @typescript-eslint/require-await
        return this.createLayPromise(async () => {
            return this.owner;
        });
    }

    addListener<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.eventBus.addListener(event, listener);
    }

    addListenerMany<TEventClass extends EventClass<LockEvents>>(
        events: TEventClass[],
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.eventBus.addListenerMany(events, listener);
    }

    removeListener<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.eventBus.removeListener(event, listener);
    }

    removeListenerMany<TEventClass extends EventClass<LockEvents>>(
        events: TEventClass[],
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.eventBus.removeListenerMany(events, listener);
    }

    listenOnce<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.eventBus.listenOnce(event, listener);
    }

    subscribe<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<Unsubscribe> {
        return this.eventBus.subscribe(event, listener);
    }

    subscribeMany<TEventClass extends EventClass<LockEvents>>(
        events: TEventClass[],
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<Unsubscribe> {
        return this.eventBus.subscribeMany(events, listener);
    }
}
