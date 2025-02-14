/**
 * @module Lock
 */

import {
    simplifyOneOrMoreStr,
    TimeSpan,
    type OneOrMore,
} from "@/utilities/_module";
import type {
    IDatabaseLockAdapter,
    LockEvents,
} from "@/lock/contracts/_module";
import {
    type ILock,
    type IGroupableLockProvider,
    type LockProviderCreateSettings,
    type ILockProvider,
    type ILockAdapter,
} from "@/lock/contracts/_module";
import type { BackoffPolicy, LazyPromise, RetryPolicy } from "@/async/_module";
import { Lock } from "@/lock/implementations/derivables/lock-provider/lock";
import type {
    EventClass,
    EventInstance,
    IEventBus,
    IGroupableEventBus,
    Listener,
    Unsubscribe,
} from "@/event-bus/contracts/_module";
import {
    EventBus,
    NoOpEventBusAdapter,
} from "@/event-bus/implementations/_module";
import { v4 } from "uuid";
import type { IFlexibleSerde } from "@/serde/contracts/_module";
import { DatabaseLockAdapter } from "@/lock/implementations/derivables/lock-provider/database-lock-adapter";
import type { ILockStateRecord } from "@/lock/implementations/derivables/lock-provider/lock-state";
import { LockSerdeTransformer } from "@/lock/implementations/derivables/lock-provider/lock-serde-transformer";

/**
 * @group Derivables
 */
export type LockProviderSettings = {
    /**
     * You can pass your owner id generator function.
     */
    createOwnerId?: () => string;

    adapter: ILockAdapter | IDatabaseLockAdapter;

    serde: OneOrMore<IFlexibleSerde>;

    /**
     * In order to listen to events of <i>{@link LockProvider}</i> class you must pass in <i>{@link IGroupableEventBus}</i>.
     */
    eventBus?: IGroupableEventBus<any>;

    /**
     * You can decide the default ttl value for <i>{@link ILock}</i> expiration. If null is passed then no ttl will be used by default.
     * @default TimeSpan.fromMinutes(5);
     */
    defaultTtl?: TimeSpan | null;

    /**
     * The default refresh time used in the <i>{@link ILock}</i> <i>extend</i> method.
     * @default TimeSpan.fromMinutes(5);
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
 * <i>LockProvider</i> class can be derived from any <i>{@link ILockAdapter}</i> or <i>{@link IDatabaseLockAdapter}</i>.
 *
 * Note the <i>{@link ILock}</i> instances created by the <i>LockProvider</i> class are serializable and deserializable,
 * allowing them to be seamlessly transferred across different servers, processes, and databases.
 * This can be done directly using <i>{@link IFlexibleSerde}</i> or indirectly through components that rely on <i>{@link IFlexibleSerde}</i> internally.
 * @group Derivables
 */
export class LockProvider implements IGroupableLockProvider {
    private static DEFAULT_TTL = TimeSpan.fromMinutes(5);
    private static DEFAULT_REFRESH_TIME = TimeSpan.fromMinutes(5);

    private static isDatabaseAdapter(
        adapter: ILockAdapter | IDatabaseLockAdapter,
    ): adapter is IDatabaseLockAdapter {
        const adapter_ = adapter as Partial<
            Record<string, (...args_: unknown[]) => unknown>
        >;
        return (
            typeof adapter_["init"] === "function" &&
            adapter_["init"].length === 0 &&
            typeof adapter_["deInit"] === "function" &&
            adapter_["deInit"].length === 0 &&
            typeof adapter_["insert"] === "function" &&
            adapter_["insert"].length === 3 &&
            typeof adapter_["update"] === "function" &&
            adapter_["update"].length === 3 &&
            typeof adapter_["remove"] === "function" &&
            adapter_["remove"].length === 2 &&
            typeof adapter_["refresh"] === "function" &&
            adapter_["refresh"].length === 3 &&
            typeof adapter_["find"] === "function" &&
            adapter_["find"].length === 1 &&
            typeof adapter_["getGroup"] === "function" &&
            adapter_["getGroup"].length === 0 &&
            typeof adapter_["withGroup"] === "function" &&
            adapter_["withGroup"].length === 1
        );
    }

    private readonly serde: OneOrMore<IFlexibleSerde>;
    private readonly createOwnerId: () => string;
    private readonly adapter: ILockAdapter;
    private readonly defaultTtl: TimeSpan;
    private readonly defaultRefreshTime: TimeSpan;
    private readonly retryAttempts: number | null;
    private readonly backoffPolicy: BackoffPolicy | null;
    private readonly retryPolicy: RetryPolicy | null;
    private readonly timeout: TimeSpan | null;
    private readonly eventBus: IGroupableEventBus<LockEvents>;
    private readonly lockProviderEventBus: IEventBus<LockEvents>;
    private stateRecord: ILockStateRecord = {};

    /**
     *@example
     * ```ts
     * import { LockProvider, MemoryLockAdapter, EventBus, MemoryEventBusAdapter, registerLockEvents, reigsterLockErrors, SuperJsonSerde } from "@daiso-tech/core";
     *
     * const eventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     * const serde = new SuperJsonSerde();
     * const lockProvider = new LockProvider({
     *   serde,
     *   adapter: new MemoryLockAdapter({
     *     rootGroup: "@global"
     *   }),
     *   eventBus,
     * });
     * registerLockEvents(serde);
     * reigsterLockErrors(serde);
     * ```
     */
    constructor(settings: LockProviderSettings) {
        const {
            createOwnerId = () => v4(),
            adapter,
            defaultTtl = LockProvider.DEFAULT_TTL,
            defaultRefreshTime = LockProvider.DEFAULT_REFRESH_TIME,
            retryAttempts = null,
            backoffPolicy = null,
            retryPolicy = null,
            timeout = null,
            eventBus = new EventBus({
                adapter: new NoOpEventBusAdapter(),
            }),
            serde,
        } = settings;
        this.createOwnerId = createOwnerId;
        if (LockProvider.isDatabaseAdapter(adapter)) {
            this.adapter = new DatabaseLockAdapter(adapter);
        } else {
            this.adapter = adapter;
        }
        this.serde = serde;
        this.defaultTtl = defaultTtl ?? LockProvider.DEFAULT_TTL;
        this.defaultRefreshTime = defaultRefreshTime;
        this.retryAttempts = retryAttempts;
        this.backoffPolicy = backoffPolicy;
        this.retryPolicy = retryPolicy;
        this.timeout = timeout;
        this.eventBus = eventBus;
        this.lockProviderEventBus = eventBus.withGroup(adapter.getGroup());
        this.registerToSerde();
    }

    private registerToSerde(): void {
        const transformer = new LockSerdeTransformer({
            adapter: this.adapter,
            backoffPolicy: this.backoffPolicy,
            defaultRefreshTime: this.defaultRefreshTime,
            eventBus: this.eventBus,
            retryAttempts: this.retryAttempts,
            retryPolicy: this.retryPolicy,
            timeout: this.timeout,
        });

        let serde = this.serde;
        if (!Array.isArray(serde)) {
            serde = [serde];
        }
        for (const serde_ of serde) {
            serde_.registerCustom(transformer);
        }
    }

    addListener<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.lockProviderEventBus.addListener(event, listener);
    }

    addListenerMany<TEventClass extends EventClass<LockEvents>>(
        events: TEventClass[],
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.lockProviderEventBus.addListenerMany(events, listener);
    }

    removeListener<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.lockProviderEventBus.removeListener(event, listener);
    }

    removeListenerMany<TEventClass extends EventClass<LockEvents>>(
        events: TEventClass[],
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.lockProviderEventBus.removeListenerMany(events, listener);
    }

    listenOnce<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.lockProviderEventBus.listenOnce(event, listener);
    }

    subscribe<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<Unsubscribe> {
        return this.lockProviderEventBus.subscribe(event, listener);
    }

    subscribeMany<TEventClass extends EventClass<LockEvents>>(
        events: TEventClass[],
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<Unsubscribe> {
        return this.lockProviderEventBus.subscribeMany(events, listener);
    }

    create(
        key: OneOrMore<string>,
        settings: LockProviderCreateSettings = {},
    ): ILock {
        const { ttl = this.defaultTtl, owner = this.createOwnerId() } =
            settings;
        return new Lock({
            lockProviderEventDispatcher: this.lockProviderEventBus,
            lockEventBus: this.eventBus,
            adapter: this.adapter,
            defaultRefreshTime: this.defaultRefreshTime,
            key: simplifyOneOrMoreStr(key),
            owner: simplifyOneOrMoreStr(owner),
            ttl,
            lazyPromiseSettings: {
                backoffPolicy: this.backoffPolicy,
                retryAttempts: this.retryAttempts,
                retryPolicy: this.retryPolicy,
                timeout: this.timeout,
            },
            stateRecord: this.stateRecord,
            expirationInMs: null,
        });
    }

    getGroup(): string {
        return this.adapter.getGroup();
    }

    withGroup(group: OneOrMore<string>): ILockProvider {
        return new LockProvider({
            adapter: this.adapter.withGroup(simplifyOneOrMoreStr(group)),
            eventBus: this.eventBus,
            defaultTtl: this.defaultTtl,
            defaultRefreshTime: this.defaultRefreshTime,
            retryAttempts: this.retryAttempts,
            backoffPolicy: this.backoffPolicy,
            retryPolicy: this.retryPolicy,
            timeout: this.timeout,
            serde: this.serde,
        });
    }
}
