/**
 * @module SharedLock
 */

import {
    CORE,
    resolveOneOrMore,
    type Invokable,
    callInvokable,
} from "@/utilities/_module-exports.js";
import { type OneOrMore } from "@/utilities/_module-exports.js";
import type {
    ISharedLock,
    ISharedLockAdapter,
    SharedLockEventMap,
    SharedLockProviderCreateSettings,
    ISharedLockProvider,
    SharedLockAdapterVariants,
} from "@/shared-lock/contracts/_module-exports.js";
import type { Task } from "@/task/_module-exports.js";
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
import { resolveDatabaseSharedLockAdapter } from "@/shared-lock/implementations/derivables/shared-lock-provider/resolve-database-shared-lock-adapter.js";
import { SharedLockSerdeTransformer } from "@/shared-lock/implementations/derivables/shared-lock-provider/shared-lock-serde-transformer.js";
import { SharedLock } from "@/shared-lock/implementations/derivables/shared-lock-provider/shared-lock.js";
import { Namespace } from "@/namespace/namespace.js";
import { TimeSpan } from "@/time-span/implementations/_module-exports.js";
import type { ITimeSpan } from "@/time-span/contracts/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock"`
 * @group Derivables
 */
export type SharedLockProviderSettingsBase = {
    /**
     * @default
     * ```ts
     * import { Namespace } from "@daiso-tech/core/namespace";
     *
     * new Namespace("@shared-lock")
     * ```
     */
    namespace?: Namespace;

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
     * You can decide the default ttl value for {@link ISharedLock | `ISharedLock`} expiration. If null is passed then no ttl will be used by default.
     * @default
     * ```ts
     * TimeSpan.fromMinutes(5);
     * ```
     */
    defaultTtl?: ITimeSpan | null;

    /**
     * The default refresh time used in the {@link ISharedLock | `ISharedLock`} `acquireBlocking` and `runBlocking` methods.
     * @default
     * ```ts
     * TimeSpan.fromSeconds(1);
     * ```
     */
    defaultBlockingInterval?: ITimeSpan;

    /**
     * The default refresh time used in the {@link ISharedLock | `ISharedLock`} `acquireBlocking` and `runBlocking` methods.
     * @default
     * ```ts
     * TimeSpan.fromMinutes(1);
     * ```
     */
    defaultBlockingTime?: ITimeSpan;

    /**
     * The default refresh time used in the {@link ISharedLock | `ISharedLock`} `referesh` method.
     * ```ts
     * TimeSpan.fromMinutes(5);
     * ```
     */
    defaultRefreshTime?: ITimeSpan;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock"`
 * @group Derivables
 */
export type SharedLockProviderSettings = SharedLockProviderSettingsBase & {
    adapter: SharedLockAdapterVariants;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock"`
 * @group Derivables
 */
export const DEFAULT_SHARED_LOCK_NAMESPACE = new Namespace("@shared-lock");

/**
 * `SharedLockProvider` class can be derived from any {@link ISharedLockAdapter | `ISharedLockAdapter`} or {@link IDatabaseSharedLockAdapter | `IDatabaseSharedLockAdapter`}.
 *
 * Note the {@link ISharedLock | `ISharedLock`} instances created by the `SharedLockProvider` class are serializable and deserializable,
 * allowing them to be seamlessly transferred across different servers, processes, and databases.
 * This can be done directly using {@link ISerderRegister | `ISerderRegister`} or indirectly through components that rely on {@link ISerderRegister | `ISerderRegister`} internally.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock"`
 * @group Derivables
 */
export class SharedLockProvider implements ISharedLockProvider {
    private readonly eventBus: IEventBus<SharedLockEventMap>;
    private readonly originalAdapter: SharedLockAdapterVariants;
    private readonly adapter: ISharedLockAdapter;
    private readonly namespace: Namespace;
    private readonly creatLockId: Invokable<[], string>;
    private readonly defaultTtl: TimeSpan | null;
    private readonly defaultBlockingInterval: TimeSpan;
    private readonly defaultBlockingTime: TimeSpan;
    private readonly defaultRefreshTime: TimeSpan;
    private readonly serde: OneOrMore<ISerderRegister>;
    private readonly serdeTransformerName: string;

    /**
     * @example
     * ```ts
     * import { SqliteSharedLockAdapter } from "@daiso-tech/core/shared-lock/adapters";
     * import { SharedLockProvider } from "@daiso-tech/core/shared-lock";
     * import { Serde } from "@daiso-tech/core/serde";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
     * import Sqlite from "better-sqlite3";
     *
     * const database = new Sqlite("local.db");
     * const lockAdapter = new SqliteSharedLockAdapter({
     *   database,
     * });
     * // You need initialize the adapter once before using it.
     * await lockAdapter.init();
     *
     * const serde = new Serde(new SuperJsonSerdeAdapter())
     * const lockProvider = new SharedLockProvider({
     *   serde,
     *   adapter: lockAdapter,
     * });
     * ```
     */
    constructor(settings: SharedLockProviderSettings) {
        const {
            defaultTtl = TimeSpan.fromMinutes(5),
            defaultBlockingInterval = TimeSpan.fromSeconds(1),
            defaultBlockingTime = TimeSpan.fromMinutes(1),
            defaultRefreshTime = TimeSpan.fromMinutes(5),
            createLockId = () => v4(),
            serde,
            namespace = DEFAULT_SHARED_LOCK_NAMESPACE,
            adapter,
            eventBus = new EventBus<any>({
                adapter: new MemoryEventBusAdapter(),
            }),
            serdeTransformerName = "",
        } = settings;

        this.serde = serde;
        this.defaultBlockingInterval = TimeSpan.fromTimeSpan(
            defaultBlockingInterval,
        );
        this.defaultBlockingTime = TimeSpan.fromTimeSpan(defaultBlockingTime);
        this.defaultRefreshTime = TimeSpan.fromTimeSpan(defaultRefreshTime);
        this.creatLockId = createLockId;
        this.namespace = namespace;
        this.defaultTtl =
            defaultTtl === null ? null : TimeSpan.fromTimeSpan(defaultTtl);
        this.eventBus = eventBus;
        this.serdeTransformerName = serdeTransformerName;

        this.originalAdapter = adapter;
        this.adapter = resolveDatabaseSharedLockAdapter(adapter);
        this.registerToSerde();
    }

    private registerToSerde(): void {
        const transformer = new SharedLockSerdeTransformer({
            originalAdapter: this.originalAdapter,
            adapter: this.adapter,
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
     * You can listen to the following {@link SharedLockEventMap | `SharedLockEventMap`} of all {@link ISharedLock | `ISharedLock`} instances created by the {@link ISharedLockProvider | `ISharedLockProvider`}.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    addListener<TEventName extends keyof SharedLockEventMap>(
        eventName: TEventName,
        listener: EventListener<SharedLockEventMap[TEventName]>,
    ): Task<void> {
        return this.eventBus.addListener(eventName, listener);
    }

    /**
     * You can listen to the following {@link SharedLockEventMap | `SharedLockEventMap`} of all {@link ISharedLock | `ISharedLock`} instances created by the {@link ISharedLockProvider | `ISharedLockProvider`}.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    removeListener<TEventName extends keyof SharedLockEventMap>(
        eventName: TEventName,
        listener: EventListener<SharedLockEventMap[TEventName]>,
    ): Task<void> {
        return this.eventBus.removeListener(eventName, listener);
    }

    /**
     * You can listen to the following {@link SharedLockEventMap | `SharedLockEventMap`} of all {@link ISharedLock | `ISharedLock`} instances created by the {@link ISharedLockProvider | `ISharedLockProvider`}.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    listenOnce<TEventName extends keyof SharedLockEventMap>(
        eventName: TEventName,
        listener: EventListener<SharedLockEventMap[TEventName]>,
    ): Task<void> {
        return this.eventBus.listenOnce(eventName, listener);
    }

    /**
     * You can listen to the following {@link SharedLockEventMap | `SharedLockEventMap`} of all {@link ISharedLock | `ISharedLock`} instances created by the {@link ISharedLockProvider | `ISharedLockProvider`}.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    asPromise<TEventName extends keyof SharedLockEventMap>(
        eventName: TEventName,
    ): Task<SharedLockEventMap[TEventName]> {
        return this.eventBus.asPromise(eventName);
    }

    /**
     * You can listen to the following {@link SharedLockEventMap | `SharedLockEventMap`} of all {@link ISharedLock | `ISharedLock`} instances created by the {@link ISharedLockProvider | `ISharedLockProvider`}.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    subscribeOnce<TEventName extends keyof SharedLockEventMap>(
        eventName: TEventName,
        listener: EventListener<SharedLockEventMap[TEventName]>,
    ): Task<Unsubscribe> {
        return this.eventBus.subscribeOnce(eventName, listener);
    }

    /**
     * You can listen to the following {@link SharedLockEventMap | `SharedLockEventMap`} of all {@link ISharedLock | `ISharedLock`} instances created by the {@link ISharedLockProvider | `ISharedLockProvider`}.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    subscribe<TEventName extends keyof SharedLockEventMap>(
        eventName: TEventName,
        listener: EventListener<SharedLockEventMap[TEventName]>,
    ): Task<Unsubscribe> {
        return this.eventBus.subscribe(eventName, listener);
    }

    /**
     * @example
     * ```ts
     * import { SharedLockProvider } from "@daiso-tech/core/shared-lock";
     * import { MemorySharedLockAdapter } from "@daiso-tech/core/shared-lock/adapters";
     * import { Namespace } from "@daiso-tech/core/namespace";
     * import { Serde } from "@daiso-tech/core/serde";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
     *
     * const lockProvider = new SharedLockProvider({
     *   adapter: new MemorySharedLockAdapter(),
     *   namespace: new Namespace("shared_lock"),
     *   serde: new Serde(new SuperJsonSerdeAdapter())
     * });
     *
     * const lock = lockProvider.create("a");
     * ```
     */
    create(
        key: string,
        settings: SharedLockProviderCreateSettings,
    ): ISharedLock {
        const {
            ttl = this.defaultTtl,
            lockId = callInvokable(this.creatLockId),
            limit,
        } = settings;

        const keyObj = this.namespace.create(key);

        return new SharedLock({
            limit,
            namespace: this.namespace,
            adapter: this.adapter,
            originalAdapter: this.originalAdapter,
            eventDispatcher: this.eventBus,
            key: keyObj,
            lockId,
            ttl: ttl === null ? null : TimeSpan.fromTimeSpan(ttl),
            serdeTransformerName: this.serdeTransformerName,
            defaultBlockingInterval: this.defaultBlockingInterval,
            defaultBlockingTime: this.defaultBlockingTime,
            defaultRefreshTime: this.defaultRefreshTime,
        });
    }
}
