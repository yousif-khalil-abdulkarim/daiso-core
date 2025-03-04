/**
 * @module Lock
 */

import {
    TimeSpan,
    type Factoryable,
    type IKeyPrefixer,
} from "@/utilities/_module-exports.js";
import {
    KeyPrefixer,
    resolveFactoryable,
    type Invokable,
    type OneOrMore,
} from "@/utilities/_module-exports.js";
import type {
    IDatabaseLockAdapter,
    LockEvents,
} from "@/lock/contracts/_module-exports.js";
import {
    type ILock,
    type IGroupableLockProvider,
    type LockProviderCreateSettings,
    type ILockProvider,
    type ILockAdapter,
} from "@/lock/contracts/_module-exports.js";
import {
    LazyPromise,
    type BackoffPolicy,
    type RetryPolicy,
} from "@/async/_module-exports.js";
import type {
    EventClass,
    EventInstance,
    IEventBus,
    IGroupableEventBus,
    Unsubscribe,
} from "@/event-bus/contracts/_module-exports.js";

import type { IFlexibleSerde } from "@/serde/contracts/_module-exports.js";
import { isDatabaseLockAdapter } from "@/lock/implementations/derivables/lock-provider/is-database-lock-adapter.js";
import { DatabaseLockAdapter } from "@/lock/implementations/derivables/lock-provider/database-lock-adapter.js";
import { EventBus } from "@/event-bus/implementations/derivables/_module-exports.js";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/adapters/_module-exports.js";
import { v4 } from "uuid";
import { Lock } from "@/lock/implementations/derivables/lock-provider/lock.js";
import {
    LockState,
    type ILockStore,
} from "@/lock/implementations/derivables/lock-provider/lock-state.js";
import type { LockSerdeTransformerSettings } from "@/lock/implementations/derivables/lock-provider/lock-serde-transformer.js";
import { LockSerdeTransformer } from "@/lock/implementations/derivables/lock-provider/lock-serde-transformer.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/implementations/derivables"```
 * @group Derivables
 */
export type LockProviderSettingsBase = {
    keyPrefixer: IKeyPrefixer;

    serde: OneOrMore<IFlexibleSerde>;

    /**
     * You can pass your owner id generator function.
     */
    createOwnerId?: () => string;

    /**
     * @default
     * ```ts
     * new EventBus({
     *   adapter: new MemoryEventBusAdapter()
     * })
     * ```
     */
    eventBus?: IGroupableEventBus<any>;

    /**
     * You can decide the default ttl value for <i>{@link ILock}</i> expiration. If null is passed then no ttl will be used by default.
     * @default
     * ```ts
     * TimeSpan.fromMinutes(5);
     * ```
     */
    defaultTtl?: TimeSpan | null;

    /**
     * The default refresh time used in the <i>{@link ILock}</i> <i>acquireBlocking</i> and <i>runBlocking</i> methods.
     * @default
     * ```ts
     * TimeSpan.fromSeconds(1);
     * ```
     */
    defaultBlockingInterval?: TimeSpan;

    /**
     * The default refresh time used in the <i>{@link ILock}</i> <i>acquireBlocking</i> and <i>runBlocking</i> methods.
     * @default
     * ```ts
     * TimeSpan.fromMinutes(1);
     * ```
     */
    defaultBlockingTime?: TimeSpan;

    /**
     * The default refresh time used in the <i>{@link ILock}</i> <i>referesh</i> method.
     * ```ts
     * TimeSpan.fromMinutes(5);
     * ```
     */
    defaultRefreshTime?: TimeSpan;

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
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/implementations/derivables"```
 * @group Derivables
 */
export type LockAdapterFactoryable = Factoryable<
    string,
    ILockAdapter | IDatabaseLockAdapter
>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/implementations/derivables"```
 * @group Derivables
 */
export type LockProviderSettings = LockProviderSettingsBase & {
    adapter: LockAdapterFactoryable;
};

/**
 * <i>LockProvider</i> class can be derived from any <i>{@link ILockAdapter}</i> or <i>{@link IDatabaseLockAdapter}</i>.
 *
 * Note the <i>{@link ILock}</i> instances created by the <i>LockProvider</i> class are serializable and deserializable,
 * allowing them to be seamlessly transferred across different servers, processes, and databases.
 * This can be done directly using <i>{@link IFlexibleSerde}</i> or indirectly through components that rely on <i>{@link IFlexibleSerde}</i> internally.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/implementations/derivables"```
 * @group Derivables
 */
export class LockProvider implements IGroupableLockProvider {
    private static resolveLockAdapter(
        adapter: ILockAdapter | IDatabaseLockAdapter,
    ): ILockAdapter {
        if (isDatabaseLockAdapter(adapter)) {
            return new DatabaseLockAdapter(adapter);
        }
        return adapter;
    }

    private static async resolveLockAdapterFactoryable(
        factoryable: LockAdapterFactoryable,
        settings: Omit<LockSerdeTransformerSettings, "adapter"> & {
            serde: OneOrMore<IFlexibleSerde>;
        },
    ): Promise<ILockAdapter> {
        const {
            lockStore,
            keyPrefixer,
            createLazyPromise,
            defaultBlockingInterval,
            defaultBlockingTime,
            defaultRefreshTime,
            groupableEventBus,
        } = settings;
        let { serde } = settings;
        const adapter = await resolveFactoryable(
            factoryable,
            keyPrefixer.keyPrefix,
        );
        const resolvedAdapter = LockProvider.resolveLockAdapter(adapter);
        const transformer = new LockSerdeTransformer({
            keyPrefixer,
            adapter: resolvedAdapter,
            createLazyPromise,
            lockStore,
            defaultBlockingInterval,
            defaultBlockingTime,
            defaultRefreshTime,
            groupableEventBus,
        });
        if (!Array.isArray(serde)) {
            serde = [serde];
        }
        for (const serde_ of serde) {
            serde_.registerCustom(transformer);
        }
        return resolvedAdapter;
    }

    private lockStore: ILockStore = {};
    private readonly groupableEventBus: IGroupableEventBus<LockEvents>;
    private readonly eventBus: IEventBus<LockEvents>;
    private readonly adapterFactoryable: LockAdapterFactoryable;
    private readonly adapterPromise: PromiseLike<ILockAdapter>;
    private readonly retryAttempts: number | null;
    private readonly backoffPolicy: BackoffPolicy | null;
    private readonly retryPolicy: RetryPolicy | null;
    private readonly timeout: TimeSpan | null;
    private readonly keyPrefixer: IKeyPrefixer;
    private readonly createOwnerId: () => string;
    private readonly defaultTtl: TimeSpan | null;
    private readonly defaultBlockingInterval: TimeSpan;
    private readonly defaultBlockingTime: TimeSpan;
    private readonly defaultRefreshTime: TimeSpan;
    private readonly serde: OneOrMore<IFlexibleSerde>;

    constructor(settings: LockProviderSettings) {
        const {
            defaultTtl = TimeSpan.fromMinutes(5),
            defaultBlockingInterval = TimeSpan.fromSeconds(1),
            defaultBlockingTime = TimeSpan.fromMinutes(1),
            defaultRefreshTime = TimeSpan.fromMinutes(5),
            createOwnerId = () => v4(),
            serde,
            keyPrefixer,
            adapter,
            eventBus: groupableEventBus = new EventBus({
                keyPrefixer: new KeyPrefixer("events"),
                adapter: new MemoryEventBusAdapter(),
            }),
            retryAttempts = null,
            backoffPolicy = null,
            retryPolicy = null,
            timeout = null,
        } = settings;

        this.serde = serde;
        this.defaultBlockingInterval = defaultBlockingInterval;
        this.defaultBlockingTime = defaultBlockingTime;
        this.defaultRefreshTime = defaultRefreshTime;
        this.createOwnerId = createOwnerId;
        this.keyPrefixer = keyPrefixer;
        this.groupableEventBus = groupableEventBus;
        this.adapterFactoryable = adapter;
        this.defaultTtl = defaultTtl;
        this.retryAttempts = retryAttempts;
        this.backoffPolicy = backoffPolicy;
        this.retryPolicy = retryPolicy;
        this.timeout = timeout;
        this.eventBus = this.eventBus = this.groupableEventBus.withGroup(
            this.keyPrefixer.resolvedRootPrefix,
        );

        if (this.keyPrefixer.resolvedGroup) {
            this.eventBus = this.groupableEventBus.withGroup([
                this.keyPrefixer.resolvedRootPrefix,
                this.keyPrefixer.resolvedGroup,
            ]);
        }

        this.adapterPromise = new LazyPromise(async () =>
            LockProvider.resolveLockAdapterFactoryable(
                this.adapterFactoryable,
                {
                    serde,
                    lockStore: this.lockStore,
                    keyPrefixer,
                    createLazyPromise: this.createLazyPromise.bind(this),
                    defaultBlockingInterval,
                    defaultBlockingTime,
                    defaultRefreshTime,
                    groupableEventBus,
                },
            ),
        );
    }

    private createLazyPromise<TValue = void>(
        asyncFn: () => PromiseLike<TValue>,
    ): LazyPromise<TValue> {
        return new LazyPromise(asyncFn)
            .setRetryAttempts(this.retryAttempts)
            .setBackoffPolicy(this.backoffPolicy)
            .setRetryPolicy(this.retryPolicy)
            .setTimeout(this.timeout);
    }

    addListener<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: Invokable<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.eventBus.addListener(event, listener);
    }

    addListenerMany<TEventClass extends EventClass<LockEvents>>(
        events: TEventClass[],
        listener: Invokable<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.eventBus.addListenerMany(events, listener);
    }

    removeListener<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: Invokable<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.eventBus.removeListener(event, listener);
    }

    removeListenerMany<TEventClass extends EventClass<LockEvents>>(
        events: TEventClass[],
        listener: Invokable<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.eventBus.removeListenerMany(events, listener);
    }

    listenOnce<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: Invokable<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.eventBus.listenOnce(event, listener);
    }

    asPromise<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
    ): LazyPromise<EventInstance<TEventClass>> {
        return this.eventBus.asPromise(event);
    }

    subscribe<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: Invokable<EventInstance<TEventClass>>,
    ): LazyPromise<Unsubscribe> {
        return this.eventBus.subscribe(event, listener);
    }

    subscribeMany<TEventClass extends EventClass<LockEvents>>(
        events: TEventClass[],
        listener: Invokable<EventInstance<TEventClass>>,
    ): LazyPromise<Unsubscribe> {
        return this.eventBus.subscribeMany(events, listener);
    }

    create(
        key: OneOrMore<string>,
        settings: LockProviderCreateSettings = {},
    ): ILock {
        const { ttl = this.defaultTtl, owner = this.createOwnerId() } =
            settings;

        const keyObj = this.keyPrefixer.create(key);
        let lockEventBus = this.groupableEventBus.withGroup([
            this.keyPrefixer.resolvedRootPrefix,
            keyObj.resolved,
        ]);
        if (this.keyPrefixer.resolvedGroup) {
            lockEventBus = this.groupableEventBus.withGroup([
                this.keyPrefixer.resolvedRootPrefix,
                this.keyPrefixer.resolvedGroup,
                keyObj.resolved,
            ]);
        }

        return new Lock({
            adapterPromise: this.adapterPromise,
            group: this.keyPrefixer.resolvedGroup,
            createLazyPromise: this.createLazyPromise.bind(this),
            lockState: new LockState(this.lockStore, keyObj.prefixed),
            lockEventBus: lockEventBus,
            lockProviderEventDispatcher: this.eventBus,
            key: keyObj,
            owner,
            ttl,
            expirationInMs: null,
            defaultBlockingInterval: this.defaultBlockingInterval,
            defaultBlockingTime: this.defaultBlockingTime,
            defaultRefreshTime: this.defaultRefreshTime,
        });
    }

    getGroup(): string | null {
        return this.keyPrefixer.resolvedGroup;
    }

    withGroup(group: OneOrMore<string>): ILockProvider {
        return new LockProvider({
            adapter: this.adapterFactoryable,
            keyPrefixer: this.keyPrefixer.withGroup(group),
            serde: this.serde,
            createOwnerId: this.createOwnerId,
            eventBus: this.groupableEventBus,
            defaultTtl: this.defaultTtl,
            defaultBlockingInterval: this.defaultBlockingInterval,
            defaultBlockingTime: this.defaultBlockingTime,
            defaultRefreshTime: this.defaultRefreshTime,
            retryAttempts: this.retryAttempts,
            backoffPolicy: this.backoffPolicy,
            retryPolicy: this.retryPolicy,
            timeout: this.timeout,
        });
    }
}
