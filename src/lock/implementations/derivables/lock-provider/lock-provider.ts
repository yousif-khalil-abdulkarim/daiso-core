/**
 * @module Lock
 */

import {
    CORE,
    resolveOneOrMore,
    type Invokable,
    callInvokable,
} from "@/utilities/_module.js";
import { type OneOrMore } from "@/utilities/_module.js";
import type {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    IDatabaseLockAdapter,
    LockAdapterVariants,
    LockEventMap,
} from "@/lock/contracts/_module.js";
import {
    type ILock,
    type LockProviderCreateSettings,
    type ILockProvider,
    type ILockAdapter,
} from "@/lock/contracts/_module.js";
import type { ITask } from "@/task/contracts/_module.js";
import type {
    EventListener,
    IEventBus,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    IEventListenable,
    Unsubscribe,
} from "@/event-bus/contracts/_module.js";

import type { ISerderRegister } from "@/serde/contracts/_module.js";
import { EventBus } from "@/event-bus/implementations/derivables/_module.js";
import { NoOpEventBusAdapter } from "@/event-bus/implementations/adapters/_module.js";
import { v4 } from "uuid";
import { Lock } from "@/lock/implementations/derivables/lock-provider/lock.js";
import { LockSerdeTransformer } from "@/lock/implementations/derivables/lock-provider/lock-serde-transformer.js";
import { resolveLockAdapter } from "@/lock/implementations/derivables/lock-provider/resolve-lock-adapter.js";
import { TimeSpan } from "@/time-span/implementations/_module.js";
import type { ITimeSpan } from "@/time-span/contracts/_module.js";
import { Namespace } from "@/namespace/_module.js";
import { Serde } from "@/serde/implementations/derivables/_module.js";
import { NoOpSerdeAdapter } from "@/serde/implementations/adapters/_module.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock"`
 * @group Derivables
 */
export type LockProviderSettingsBase = {
    /**
     * @default
     * ```ts
     * import { Namespace } from "@daiso-tech/core/namespace";
     *
     * new Namespace("@lock")
     * ```
     */
    namespace?: Namespace;

    serde?: OneOrMore<ISerderRegister>;

    /**
     * @default ""
     */
    serdeTransformerName?: string;

    /**
     * You can pass your lock id id generator function.
     * @default
     * ```ts
     * import { v4 } from "uuid";
     *
     * () => v4
     */
    createLockId?: Invokable<[], string>;

    /**
     * @default
     * ```ts
     * import { EventBus } from "@daiso-tech/core/event-bus";
     * import { NoOpEventBusAdapter } from "@daiso-tech/core/event-bus/no-op-event-bus-adapter";
     *
     * new EventBus({
     *   adapter: new NoOpEventBusAdapter()
     * })
     * ```
     */
    eventBus?: IEventBus;

    /**
     * You can decide the default ttl value for {@link ILock | `ILock`} expiration. If null is passed then no ttl will be used by default.
     * @default
     * ```ts
     * import { TimeSpan } from "@daiso-tech/core/time-span";
     *
     * TimeSpan.fromMinutes(5);
     * ```
     */
    defaultTtl?: ITimeSpan | null;

    /**
     * The default refresh time used in the {@link ILock | `ILock`} `acquireBlocking` and `runBlocking` methods.
     * @default
     * ```ts
     * import { TimeSpan } from "@daiso-tech/core/time-span";
     *
     * TimeSpan.fromSeconds(1);
     * ```
     */
    defaultBlockingInterval?: ITimeSpan;

    /**
     * The default refresh time used in the {@link ILock | `ILock`} `acquireBlocking` and `runBlocking` methods.
     * @default
     * ```ts
     * import { TimeSpan } from "@daiso-tech/core/time-span";
     *
     * TimeSpan.fromMinutes(1);
     * ```
     */
    defaultBlockingTime?: ITimeSpan;

    /**
     * The default refresh time used in the {@link ILock | `ILock`} `referesh` method.
     * ```ts
     * import { TimeSpan } from "@daiso-tech/core/time-span";
     *
     * TimeSpan.fromMinutes(5);
     * ```
     */
    defaultRefreshTime?: ITimeSpan;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock"`
 * @group Derivables
 */
export type LockProviderSettings = LockProviderSettingsBase & {
    adapter: LockAdapterVariants;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock"`
 * @group Derivables
 */
export const DEFAULT_LOCK_PROVIDER_NAMESPACE = new Namespace("@lock");

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
    private readonly originalAdapter: LockAdapterVariants;
    private readonly adapter: ILockAdapter;
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
     * import { KyselyLockAdapter } from "@daiso-tech/core/lock/kysely-lock-adapter";
     * import { LockProvider } from "@daiso-tech/core/lock";
     * import { Serde } from "@daiso-tech/core/serde";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/super-json-serde-adapter";
     * import Sqlite from "better-sqlite3";
     * import { Kysely, SqliteDialect } from "kysely";
     *
     * const lockAdapter = new KyselyLockAdapter({
     *   kysely: new Kysely({
     *     dialect: new SqliteDialect({
     *       database: new Sqlite("local.db"),
     *     }),
     *   });
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
            serde = new Serde(new NoOpSerdeAdapter()),
            namespace = DEFAULT_LOCK_PROVIDER_NAMESPACE,
            adapter,
            eventBus = new EventBus<any>({
                adapter: new NoOpEventBusAdapter(),
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
        this.adapter = resolveLockAdapter(adapter);
        this.registerToSerde();
    }

    private registerToSerde(): void {
        const transformer = new LockSerdeTransformer({
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
     * You can listen to the following {@link LockEventMap | `LockEventMap`} of all {@link ILock | `ILock`} instances created by the {@link ILockProvider | `ILockProvider`}.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    addListener<TEventName extends keyof LockEventMap>(
        eventName: TEventName,
        listener: EventListener<LockEventMap[TEventName]>,
    ): ITask<void> {
        return this.eventBus.addListener(eventName, listener);
    }

    /**
     * You can listen to the following {@link LockEventMap | `LockEventMap`} of all {@link ILock | `ILock`} instances created by the {@link ILockProvider | `ILockProvider`}.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    removeListener<TEventName extends keyof LockEventMap>(
        eventName: TEventName,
        listener: EventListener<LockEventMap[TEventName]>,
    ): ITask<void> {
        return this.eventBus.removeListener(eventName, listener);
    }

    /**
     * You can listen to the following {@link LockEventMap | `LockEventMap`} of all {@link ILock | `ILock`} instances created by the {@link ILockProvider | `ILockProvider`}.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    listenOnce<TEventName extends keyof LockEventMap>(
        eventName: TEventName,
        listener: EventListener<LockEventMap[TEventName]>,
    ): ITask<void> {
        return this.eventBus.listenOnce(eventName, listener);
    }

    /**
     * You can listen to the following {@link LockEventMap | `LockEventMap`} of all {@link ILock | `ILock`} instances created by the {@link ILockProvider | `ILockProvider`}.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    asPromise<TEventName extends keyof LockEventMap>(
        eventName: TEventName,
    ): ITask<LockEventMap[TEventName]> {
        return this.eventBus.asPromise(eventName);
    }

    /**
     * You can listen to the following {@link LockEventMap | `LockEventMap`} of all {@link ILock | `ILock`} instances created by the {@link ILockProvider | `ILockProvider`}.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    subscribeOnce<TEventName extends keyof LockEventMap>(
        eventName: TEventName,
        listener: EventListener<LockEventMap[TEventName]>,
    ): ITask<Unsubscribe> {
        return this.eventBus.subscribeOnce(eventName, listener);
    }

    /**
     * You can listen to the following {@link LockEventMap | `LockEventMap`} of all {@link ILock | `ILock`} instances created by the {@link ILockProvider | `ILockProvider`}.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    subscribe<TEventName extends keyof LockEventMap>(
        eventName: TEventName,
        listener: EventListener<LockEventMap[TEventName]>,
    ): ITask<Unsubscribe> {
        return this.eventBus.subscribe(eventName, listener);
    }

    /**
     * @example
     * ```ts
     * import { LockProvider } from "@daiso-tech/core/lock";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/memory-lock-adapter";
     * import { Namespace } from "@daiso-tech/core/namespace";
     * import { Serde } from "@daiso-tech/core/serde";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/super-json-serde-adapter";
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
    create(key: string, settings: LockProviderCreateSettings = {}): ILock {
        const {
            ttl = this.defaultTtl,
            lockId = callInvokable(this.creatLockId),
        } = settings;

        const keyObj = this.namespace.create(key);

        return new Lock({
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
