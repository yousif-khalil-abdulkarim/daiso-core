/**
 * @module Lock
 */

import {
    CORE,
    resolveOneOrMoreStr,
    TimeSpan,
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
import type {
    BackoffPolicy,
    LazyPromise,
    RetryPolicy,
} from "@/async/_module-exports.js";
import { Lock } from "@/lock/implementations/derivables/lock-provider/lock.js";
import type {
    EventClass,
    EventInstance,
    IEventBus,
    IGroupableEventBus,
    EventListener,
    Unsubscribe,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    IEventListenable,
} from "@/event-bus/contracts/_module-exports.js";
import { EventBus } from "@/event-bus/implementations/derivables/_module-exports.js";
import { NoOpEventBusAdapter } from "@/event-bus/implementations/adapters/_module-exports.js";
import { v4 } from "uuid";
import type { IFlexibleSerde } from "@/serde/contracts/_module-exports.js";
import { DatabaseLockAdapter } from "@/lock/implementations/derivables/lock-provider/database-lock-adapter.js";
import type { ILockStateRecord } from "@/lock/implementations/derivables/lock-provider/lock-state.js";
import { LockSerdeTransformer } from "@/lock/implementations/derivables/lock-provider/lock-serde-transformer.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/implementations/derivables"```
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
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/implementations/derivables"```
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
     * @example
     * ```ts
     * import type { IGroupableLockProvider } from "@daiso-tech/core/lock/contracts";
     * import { LockProvider } from "@daiso-tech/core/lock/implementations/derivables";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/implementations/adapters";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { Serde } from "@daiso-tech/core/serde/implementations/derivables";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/implementations/adapters";
     *
     * const eventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     * const serde = new Serde(SuperJsonSerdeAdapter);
     * const lockProvider: IGroupableLockProvider = new LockProvider({
     *   serde,
     *   adapter: new MemoryLockAdapter({
     *     rootGroup: "@global"
     *   }),
     *   eventBus,
     * });
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
            serde_.registerCustom(transformer, CORE);
        }
    }

    /**
     * You can listen to different events of all locks created by <i>LockProvider</i> class instance.
     *
     * Refer to <i>{@link LockEvents}</i>, to se all events dispatched by <i>LockProvider</i> class instance.
     * Refer to <i>{@link IEventListenable}</i> for details on how the method works.
     * @example
     * ```ts
     * import { type IGroupableLockProvider, type LockEvents, KeyAcquiredLockEvent } from "@daiso-tech/core/lock/contracts";
     * import { LockProvider } from "@daiso-tech/core/lock/implementations/derivables";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/implementations/adapters";
     * import type { EventListener} from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { Serde } from "@daiso-tech/core/serde/implementations/derivables";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/implementations/adapters";
     *
     * const eventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     * const serde = new Serde(SuperJsonSerdeAdapter);
     * const lockProvider: IGroupableLockProvider = new LockProvider({
     *   serde,
     *   adapter: new MemoryLockAdapter({
     *     rootGroup: "@global"
     *   }),
     *   eventBus,
     * });
     *
     * const listener: EventListener<LockEvents> = event => {
     *   console.log(event);
     * }
     * await lockProvider.addListener(KeyAcquiredLockEvent, listener);
     * await lockProvider.removeListener(KeyAcquiredLockEvent, listener);
     * await lockProvider.create("a").acquire();
     * ```
     */
    addListener<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.lockProviderEventBus.addListener(event, listener);
    }

    /**
     * You can listen to different events of all locks created by <i>LockProvider</i> class instance.
     *
     * Refer to <i>{@link LockEvents}</i>, to se all events dispatched by <i>LockProvider</i> class instance.
     * Refer to <i>{@link IEventListenable}</i> for details on how the method works.
     * @example
     * ```ts
     * import { type IGroupableLockProvider, type LockEvents, KeyAcquiredLockEvent } from "@daiso-tech/core/lock/contracts";
     * import { LockProvider } from "@daiso-tech/core/lock/implementations/derivables";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/implementations/adapters";
     * import type { EventListener} from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { Serde } from "@daiso-tech/core/serde/implementations/derivables";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/implementations/adapters";
     *
     * const eventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     * const serde = new Serde(SuperJsonSerdeAdapter);
     * const lockProvider: IGroupableLockProvider = new LockProvider({
     *   serde,
     *   adapter: new MemoryLockAdapter({
     *     rootGroup: "@global"
     *   }),
     *   eventBus,
     * });
     *
     * const listener: EventListener<LockEvents> = event => {
     *   console.log(event);
     * }
     * await lockProvider.addListenerMany([KeyAcquiredLockEvent], listener);
     * await lockProvider.removeListenerMany([KeyAcquiredLockEvent], listener);
     * await lockProvider.create("a").acquire();
     * ```
     */
    addListenerMany<TEventClass extends EventClass<LockEvents>>(
        events: TEventClass[],
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.lockProviderEventBus.addListenerMany(events, listener);
    }

    /**
     * You can listen to different events of all locks created by <i>LockProvider</i> class instance.
     *
     * Refer to <i>{@link LockEvents}</i>, to se all events dispatched by <i>LockProvider</i> class instance.
     * Refer to <i>{@link IEventListenable}</i> for details on how the method works.
     * @example
     * ```ts
     * import { type IGroupableLockProvider, type LockEvents, KeyAcquiredLockEvent } from "@daiso-tech/core/lock/contracts";
     * import { LockProvider } from "@daiso-tech/core/lock/implementations/derivables";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/implementations/adapters";
     * import type { EventListener} from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { Serde } from "@daiso-tech/core/serde/implementations/derivables";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/implementations/adapters";
     *
     * const eventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     * const serde = new Serde(SuperJsonSerdeAdapter);
     * const lockProvider: IGroupableLockProvider = new LockProvider({
     *   serde,
     *   adapter: new MemoryLockAdapter({
     *     rootGroup: "@global"
     *   }),
     *   eventBus,
     * });
     *
     * const listener: EventListener<LockEvents> = event => {
     *   console.log(event);
     * }
     * await lockProvider.addListener(KeyAcquiredLockEvent, listener);
     * await lockProvider.removeListener(KeyAcquiredLockEvent, listener);
     * await lockProvider.create("a").acquire();
     * ```
     */
    removeListener<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.lockProviderEventBus.removeListener(event, listener);
    }

    /**
     * You can listen to different events of all locks created by <i>LockProvider</i> class instance.
     *
     * Refer to <i>{@link LockEvents}</i>, to se all events dispatched by <i>LockProvider</i> class instance.
     * Refer to <i>{@link IEventListenable}</i> for details on how the method works.
     * @example
     * ```ts
     * import { type IGroupableLockProvider, type LockEvents, KeyAcquiredLockEvent } from "@daiso-tech/core/lock/contracts";
     * import { LockProvider } from "@daiso-tech/core/lock/implementations/derivables";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/implementations/adapters";
     * import type { EventListener} from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { Serde } from "@daiso-tech/core/serde/implementations/derivables";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/implementations/adapters";
     *
     * const eventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     * const serde = new Serde(SuperJsonSerdeAdapter);
     * const lockProvider: IGroupableLockProvider = new LockProvider({
     *   serde,
     *   adapter: new MemoryLockAdapter({
     *     rootGroup: "@global"
     *   }),
     *   eventBus,
     * });
     *
     * const listener: EventListener<LockEvents> = event => {
     *   console.log(event);
     * }
     * await lockProvider.addListenerMany(KeyAcquiredLockEvent, listener);
     * await lockProvider.removeListenerMany([KeyAcquiredLockEvent], listener);
     * await lockProvider.create("a").acquire();
     * ```
     */
    removeListenerMany<TEventClass extends EventClass<LockEvents>>(
        events: TEventClass[],
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.lockProviderEventBus.removeListenerMany(events, listener);
    }

    /**
     * You can listen to different events of all locks created by <i>LockProvider</i> class instance.
     *
     * Refer to <i>{@link LockEvents}</i>, to se all events dispatched by <i>LockProvider</i> class instance.
     * Refer to <i>{@link IEventListenable}</i> for details on how the method works.
     * @example
     * ```ts
     * import { type IGroupableLockProvider, type LockEvents, KeyAcquiredLockEvent } from "@daiso-tech/core/lock/contracts";
     * import { LockProvider } from "@daiso-tech/core/lock/implementations/derivables";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/implementations/adapters";
     * import type { EventListener} from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { Serde } from "@daiso-tech/core/serde/implementations/derivables";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/implementations/adapters";
     *
     * const eventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     * const serde = new Serde(SuperJsonSerdeAdapter);
     * const lockProvider: IGroupableLockProvider = new LockProvider({
     *   serde,
     *   adapter: new MemoryLockAdapter({
     *     rootGroup: "@global"
     *   }),
     *   eventBus,
     * });
     *
     * const listener: EventListener<LockEvents> = event => {
     *   console.log(event);
     * }
     * await lockProvider.listenOnce(KeyAcquiredLockEvent, listener);
     * await lockProvider.create("a").acquire();
     * ```
     */
    listenOnce<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.lockProviderEventBus.listenOnce(event, listener);
    }

    /**
     * You can listen to different events of all locks created by <i>LockProvider</i> class instance.
     *
     * Refer to <i>{@link LockEvents}</i>, to se all events dispatched by <i>LockProvider</i> class instance.
     * Refer to <i>{@link IEventListenable}</i> for details on how the method works.
     * @example
     * ```ts
     * import { type IGroupableLockProvider, type LockEvents, KeyAcquiredLockEvent } from "@daiso-tech/core/lock/contracts";
     * import { LockProvider } from "@daiso-tech/core/lock/implementations/derivables";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/implementations/adapters";
     * import type { EventListener} from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { Serde } from "@daiso-tech/core/serde/implementations/derivables";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/implementations/adapters";
     *
     * const eventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     * const serde = new Serde(SuperJsonSerdeAdapter);
     * const lockProvider: IGroupableLockProvider = new LockProvider({
     *   serde,
     *   adapter: new MemoryLockAdapter({
     *     rootGroup: "@global"
     *   }),
     *   eventBus,
     * });
     *
     * const listener: EventListener<LockEvents> = event => {
     *   console.log(event);
     * }
     * const unsubscribe = await lockProvider.subscribe(KeyAcquiredLockEvent, listener);
     * await lockProvider.create("a").acquire();
     * await unsubscribe();
     * ```
     */
    subscribe<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<Unsubscribe> {
        return this.lockProviderEventBus.subscribe(event, listener);
    }

    /**
     * You can listen to different events of all locks created by <i>LockProvider</i> class instance.
     *
     * Refer to <i>{@link LockEvents}</i>, to se all events dispatched by <i>LockProvider</i> class instance.
     * Refer to <i>{@link IEventListenable}</i> for details on how the method works.
     * @example
     * ```ts
     * import { type IGroupableLockProvider, type LockEvents, KeyAcquiredLockEvent } from "@daiso-tech/core/lock/contracts";
     * import { LockProvider } from "@daiso-tech/core/lock/implementations/derivables";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/implementations/adapters";
     * import type { EventListener} from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { Serde } from "@daiso-tech/core/serde/implementations/derivables";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/implementations/adapters";
     *
     * const eventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     * const serde = new Serde(SuperJsonSerdeAdapter);
     * const lockProvider: IGroupableLockProvider = new LockProvider({
     *   serde,
     *   adapter: new MemoryLockAdapter({
     *     rootGroup: "@global"
     *   }),
     *   eventBus,
     * });
     *
     * const listener: EventListener<LockEvents> = event => {
     *   console.log(event);
     * }
     * const unsubscribe = await lockProvider.subscribeMany([KeyAcquiredLockEvent], listener);
     * await lockProvider.create("a").acquire();
     * await unsubscribe();
     * ```
     */
    subscribeMany<TEventClass extends EventClass<LockEvents>>(
        events: TEventClass[],
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<Unsubscribe> {
        return this.lockProviderEventBus.subscribeMany(events, listener);
    }

    /**
     * ```ts
     * import type { IGroupableLockProvider } from "@daiso-tech/core/lock/contracts";
     * import { LockProvider } from "@daiso-tech/core/lock/implementations/derivables";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/implementations/adapters";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { Serde } from "@daiso-tech/core/serde/implementations/derivables";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/implementations/adapters";
     * import { TimeSpan } from "@daiso-tech/core/utilities";
     *
     * const eventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     * const serde = new Serde(SuperJsonSerdeAdapter);
     * const lockProvider: IGroupableLockProvider = new LockProvider({
     *   serde,
     *   adapter: new MemoryLockAdapter({
     *     rootGroup: "@global"
     *   }),
     *   eventBus,
     * });
     *
     * // You can use the lock
     * const lockA = lockProvider.create("a");
     *
     * // You can provide ttl
     * const lockB = lockProvider.create("b", {
     *   ttl: TimeSpan.fromMinutes(2),
     * });
     *
     * // You can provide a custom owner. By default the owner will be unique random value.
     * const lockC = lockProvider.create("b", {
     *   owner: "user-1"
     * });
     * ```
     */
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
            key: resolveOneOrMoreStr(key),
            owner: resolveOneOrMoreStr(owner),
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

    /**
     * @example
     * ```ts
     * import type { IGroupableLockProvider } from "@daiso-tech/core/lock/contracts";
     * import { LockProvider } from "@daiso-tech/core/lock/implementations/derivables";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/implementations/adapters";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { Serde } from "@daiso-tech/core/serde/implementations/derivables";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/implementations/adapters";
     *
     * const eventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     * const serde = new Serde(SuperJsonSerdeAdapter);
     * const lockProvider: IGroupableLockProvider = new LockProvider({
     *   serde,
     *   adapter: new MemoryLockAdapter({
     *     rootGroup: "@global"
     *   }),
     *   eventBus,
     * });
     *
     * // Will print "@global"
     * console.log(lockProvider.getGroup());
     * ```
     */
    getGroup(): string {
        return this.adapter.getGroup();
    }

    /**
     * @example
     * ```ts
     * import type { IGroupableLockProvider, ILockProvider } from "@daiso-tech/core/lock/contracts";
     * import { LockProvider } from "@daiso-tech/core/lock/implementations/derivables";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/implementations/adapters";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { Serde } from "@daiso-tech/core/serde/implementations/derivables";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/implementations/adapters";
     *
     * const eventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     * const serde = new Serde(SuperJsonSerdeAdapter);
     * const lockProvider: IGroupableLockProvider = new LockProvider({
     *   serde,
     *   adapter: new MemoryLockAdapter({
     *     rootGroup: "@global"
     *   }),
     *   eventBus,
     * });
     *
     * // Will print "@global"
     * console.log(lockProvider.getGroup());
     *
     * const groupedLockProvider: ILockProvider = lockProvider.withGroup("company-1");
     *
     * // Will print "@global/company-1"
     * console.log(groupedLockProvider.getGroup());
     * ```
     */
    withGroup(group: OneOrMore<string>): ILockProvider {
        return new LockProvider({
            adapter: this.adapter.withGroup(resolveOneOrMoreStr(group)),
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
