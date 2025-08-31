/**
 * @module Lock
 */

import {
    TimeSpan,
    CORE,
    type Factory,
    type AsyncLazy,
    type FactoryFn,
    resolveOneOrMore,
    resolveInvokable,
    type Invokable,
    callInvokable,
} from "@/utilities/_module-exports.js";
import { Namespace, type OneOrMore } from "@/utilities/_module-exports.js";
import type {
    IDatabaseLockAdapter,
    LockEventMap,
} from "@/lock/contracts/_module-exports.js";
import {
    type ILock,
    type LockProviderCreateSettings,
    type ILockProvider,
    type ILockAdapter,
} from "@/lock/contracts/_module-exports.js";
import { LazyPromise } from "@/async/_module-exports.js";
import type {
    EventListener,
    IEventBus,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    IEventListenable,
    Unsubscribe,
} from "@/event-bus/contracts/_module-exports.js";

import type { ISerderRegister } from "@/serde/contracts/_module-exports.js";
import { EventBus } from "@/event-bus/implementations/derivables/_module-exports.js";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/adapters/_module-exports.js";
import { v4 } from "uuid";
import { Lock } from "@/lock/implementations/derivables/lock-provider/lock.js";
import { isDatabaseLockAdapter } from "@/lock/implementations/derivables/lock-provider/is-database-lock-adapter.js";
import { DatabaseLockAdapter } from "@/lock/implementations/derivables/lock-provider/database-lock-adapter.js";
import { LockSerdeTransformer } from "@/lock/implementations/derivables/lock-provider/lock-serde-transformer.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock"`
 * @group Derivables
 */
export type LockProviderSettingsBase = {
    /**
     * @default
     * ```ts
     * import { Namespace } from "@daiso-tech/core/utilities";
     *
     * new Namespace(["@", "lock"])
     * ```
     */
    namespace?: Namespace;

    /**
     * You can pass a {@link Factory | `Factory`} of {@link LazyPromise| `LazyPromise`} to configure default settings for all {@link LazyPromise| `LazyPromise`} instances used in the `LockProvider` class.
     * @default
     * ```ts
     * import { LazyPromise } from "@daiso-tech/core/async";
     *
     * (invokable) => new LazyPromise(invokable)
     * ```
     */
    lazyPromiseFactory?: Factory<AsyncLazy<any>, LazyPromise<any>>;

    serde: OneOrMore<ISerderRegister>;

    /**
     * @default ""
     */
    serdeTransformerName?: string;

    /**
     * You can pass your lock id id generator function.
     */
    createLockId?: Invokable<[], string>;

    /**
     * @default
     * ```ts
     * import { EventBus } from "@daiso-tech/core/event-bus";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
     *
     * new EventBus({
     *   adapter: new MemoryEventBusAdapter()
     * })
     * ```
     */
    eventBus?: IEventBus;

    /**
     * You can decide the default ttl value for {@link ILock | `ILock`} expiration. If null is passed then no ttl will be used by default.
     * @default
     * ```ts
     * TimeSpan.fromMinutes(5);
     * ```
     */
    defaultTtl?: TimeSpan | null;

    /**
     * The default refresh time used in the {@link ILock | `ILock`} `acquireBlocking` and `runBlocking` methods.
     * @default
     * ```ts
     * TimeSpan.fromSeconds(1);
     * ```
     */
    defaultBlockingInterval?: TimeSpan;

    /**
     * The default refresh time used in the {@link ILock | `ILock`} `acquireBlocking` and `runBlocking` methods.
     * @default
     * ```ts
     * TimeSpan.fromMinutes(1);
     * ```
     */
    defaultBlockingTime?: TimeSpan;

    /**
     * The default refresh time used in the {@link ILock | `ILock`} `referesh` method.
     * ```ts
     * TimeSpan.fromMinutes(5);
     * ```
     */
    defaultRefreshTime?: TimeSpan;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock"`
 * @group Derivables
 */
export type LockAdapter = ILockAdapter | IDatabaseLockAdapter;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock"`
 * @group Derivables
 */
export type LockProviderSettings = LockProviderSettingsBase & {
    adapter: LockAdapter;
};

/**
 * `LockProvider` class can be derived from any {@link ILockAdapter | `ILockAdapter`} or {@link IDatabaseLockAdapter | `IDatabaseLockAdapter`}.
 *
 * Note the {@link ILock | `ILock`} instances created by the `LockProvider` class are serializable and deserializable,
 * allowing them to be seamlessly transferred across different servers, processes, and databases.
 * This can be done directly using {@link ISerderRegister | `ISerderRegister`} or indirectly through components that rely on {@link ISerderRegister | `ISerderRegister`} internally.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock"`
 * @group Derivables
 */
export class LockProvider implements ILockProvider {
    private readonly eventBus: IEventBus<LockEventMap>;
    private readonly originalAdapter: ILockAdapter | IDatabaseLockAdapter;
    private readonly adapter: ILockAdapter;
    private readonly namespace: Namespace;
    private readonly creatLockId: Invokable<[], string>;
    private readonly defaultTtl: TimeSpan | null;
    private readonly defaultBlockingInterval: TimeSpan;
    private readonly defaultBlockingTime: TimeSpan;
    private readonly defaultRefreshTime: TimeSpan;
    private readonly serde: OneOrMore<ISerderRegister>;
    private readonly lazyPromiseFactory: FactoryFn<
        AsyncLazy<any>,
        LazyPromise<any>
    >;
    private readonly serdeTransformerName: string;

    /**
     * @example
     * ```ts
     * import { SqliteLockAdapter } from "@daiso-tech/core/lock/adapters";
     * import { LockProvider } from "@daiso-tech/core/lock";
     * import { Serde } from "@daiso-tech/core/serde";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
     * import Sqlite from "better-sqlite3";
     *
     * const database = new Sqlite("local.db");
     * const lockAdapter = new SqliteLockAdapter({
     *   database,
     * });
     * // You need initialize the adapter once before using it.
     * await lockAdapter.init();
     *
     * const serde = new Serde(new SuperJsonSerdeAdapter())
     * const lockProvider = new LockProvider({
     *   serde,
     *   adapter: lockAdapter,
     * });
     * ```
     */
    constructor(settings: LockProviderSettings) {
        const {
            defaultTtl = TimeSpan.fromMinutes(5),
            defaultBlockingInterval = TimeSpan.fromSeconds(1),
            defaultBlockingTime = TimeSpan.fromMinutes(1),
            defaultRefreshTime = TimeSpan.fromMinutes(5),
            createLockId = () => v4(),
            serde,
            namespace = new Namespace(["@", "lock"]),
            adapter,
            eventBus = new EventBus<any>({
                adapter: new MemoryEventBusAdapter(),
            }),
            serdeTransformerName = "",
            lazyPromiseFactory = (invokable) => new LazyPromise(invokable),
        } = settings;

        this.serde = serde;
        this.defaultBlockingInterval = defaultBlockingInterval;
        this.defaultBlockingTime = defaultBlockingTime;
        this.defaultRefreshTime = defaultRefreshTime;
        this.creatLockId = createLockId;
        this.namespace = namespace;
        this.defaultTtl = defaultTtl;
        this.eventBus = eventBus;
        this.lazyPromiseFactory = resolveInvokable(lazyPromiseFactory);
        this.serdeTransformerName = serdeTransformerName;

        this.originalAdapter = adapter;
        if (isDatabaseLockAdapter(adapter)) {
            this.adapter = new DatabaseLockAdapter(adapter);
        } else {
            this.adapter = adapter;
        }

        this.registerToSerde();
    }

    private registerToSerde(): void {
        const transformer = new LockSerdeTransformer({
            originalAdapter: this.originalAdapter,
            adapter: this.adapter,
            createLazyPromise: (asyncFn) => this.createLazyPromise(asyncFn),
            defaultBlockingInterval: this.defaultBlockingInterval,
            defaultBlockingTime: this.defaultBlockingTime,
            defaultRefreshTime: this.defaultRefreshTime,
            eventBus: this.eventBus,
            namespace: this.namespace,
            serdeTransformerName: this.serdeTransformerName,
        });
        for (const serde of resolveOneOrMore(this.serde)) {
            serde.registerCustom(transformer, CORE);
        }
    }

    /**
     * You can listen to the following {@link LockEventMap | `LockEventMap`} of all {@link ILock | `ILock`} instances created by the {@link ILockProvider | `ILockProvider`}.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    addListener<TEventName extends keyof LockEventMap>(
        eventName: TEventName,
        listener: EventListener<LockEventMap[TEventName]>,
    ): LazyPromise<void> {
        return this.eventBus.addListener(eventName, listener);
    }

    /**
     * You can listen to the following {@link LockEventMap | `LockEventMap`} of all {@link ILock | `ILock`} instances created by the {@link ILockProvider | `ILockProvider`}.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    removeListener<TEventName extends keyof LockEventMap>(
        eventName: TEventName,
        listener: EventListener<LockEventMap[TEventName]>,
    ): LazyPromise<void> {
        return this.eventBus.removeListener(eventName, listener);
    }

    /**
     * You can listen to the following {@link LockEventMap | `LockEventMap`} of all {@link ILock | `ILock`} instances created by the {@link ILockProvider | `ILockProvider`}.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    listenOnce<TEventName extends keyof LockEventMap>(
        eventName: TEventName,
        listener: EventListener<LockEventMap[TEventName]>,
    ): LazyPromise<void> {
        return this.eventBus.listenOnce(eventName, listener);
    }

    /**
     * You can listen to the following {@link LockEventMap | `LockEventMap`} of all {@link ILock | `ILock`} instances created by the {@link ILockProvider | `ILockProvider`}.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    asPromise<TEventName extends keyof LockEventMap>(
        eventName: TEventName,
    ): LazyPromise<LockEventMap[TEventName]> {
        return this.eventBus.asPromise(eventName);
    }

    /**
     * You can listen to the following {@link LockEventMap | `LockEventMap`} of all {@link ILock | `ILock`} instances created by the {@link ILockProvider | `ILockProvider`}.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    subscribeOnce<TEventName extends keyof LockEventMap>(
        eventName: TEventName,
        listener: EventListener<LockEventMap[TEventName]>,
    ): LazyPromise<Unsubscribe> {
        return this.eventBus.subscribeOnce(eventName, listener);
    }

    /**
     * You can listen to the following {@link LockEventMap | `LockEventMap`} of all {@link ILock | `ILock`} instances created by the {@link ILockProvider | `ILockProvider`}.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    subscribe<TEventName extends keyof LockEventMap>(
        eventName: TEventName,
        listener: EventListener<LockEventMap[TEventName]>,
    ): LazyPromise<Unsubscribe> {
        return this.eventBus.subscribe(eventName, listener);
    }

    private createLazyPromise<TValue = void>(
        asyncFn: () => Promise<TValue>,
    ): LazyPromise<TValue> {
        return this.lazyPromiseFactory(asyncFn);
    }

    /**
     * @example
     * ```ts
     * import { LockProvider } from "@daiso-tech/core/lock";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/adapters";
     * import { Namespace } from "@daiso-tech/core/utilities";
     * import { Serde } from "@daiso-tech/core/serde";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
     *
     * const lockProvider = new LockProvider({
     *   adapter: new MemoryLockAdapter(),
     *   namespace: new Namespace("lock"),
     *   serde: new Serde(new SuperJsonSerdeAdapter())
     * });
     *
     * const lock = lockProvider.create("a");
     * ```
     */
    create(
        key: OneOrMore<string>,
        settings: LockProviderCreateSettings = {},
    ): ILock {
        const {
            ttl = this.defaultTtl,
            lockId = callInvokable(this.creatLockId),
        } = settings;

        const keyObj = this.namespace._getInternal().create(key);
        const lockIdAsStr = this.namespace
            ._getInternal()
            .create(lockId).resolved;

        return new Lock({
            namespace: this.namespace,
            adapter: this.adapter,
            originalAdapter: this.originalAdapter,
            createLazyPromise: (asyncFn) => this.createLazyPromise(asyncFn),
            eventDispatcher: this.eventBus,
            key: keyObj,
            lockId: lockIdAsStr,
            ttl,
            serdeTransformerName: this.serdeTransformerName,
            defaultBlockingInterval: this.defaultBlockingInterval,
            defaultBlockingTime: this.defaultBlockingTime,
            defaultRefreshTime: this.defaultRefreshTime,
        });
    }
}
