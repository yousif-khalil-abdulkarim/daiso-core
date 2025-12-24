/**
 * @module Semaphore
 */

import type { ITask } from "@/task/contracts/_module.js";
import type {
    EventListener,
    IEventBus,
    Unsubscribe,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    IEventListenable,
} from "@/event-bus/contracts/_module.js";
import { NoOpEventBusAdapter } from "@/event-bus/implementations/adapters/_module.js";
import { EventBus } from "@/event-bus/implementations/derivables/_module.js";
import type {
    IDatabaseSemaphoreAdapter,
    ISemaphore,
    ISemaphoreAdapter,
    SemaphoreAdapterVariants,
    SemaphoreEventMap,
    SemaphoreProviderCreateSettings,
} from "@/semaphore/contracts/_module.js";
import type { ISemaphoreProvider } from "@/semaphore/contracts/_module.js";
import type { ISerderRegister } from "@/serde/contracts/_module.js";
import {
    callInvokable,
    CORE,
    isPositiveNbr,
    resolveOneOrMore,
    type Invokable,
    type OneOrMore,
} from "@/utilities/_module.js";
import { Semaphore } from "@/semaphore/implementations/derivables/semaphore-provider/semaphore.js";
import { v4 } from "uuid";
import { SemaphoreSerdeTransformer } from "@/semaphore/implementations/derivables/semaphore-provider/semaphore-serde-transformer.js";
import { resolveSemaphoreAdapter } from "@/semaphore/implementations/derivables/semaphore-provider/resolve-semaphore-adapter.js";
import { TimeSpan } from "@/time-span/implementations/_module.js";
import type { ITimeSpan } from "@/time-span/contracts/_module.js";
import { Namespace } from "@/namespace/_module.js";
import { Serde } from "@/serde/implementations/derivables/_module.js";
import { NoOpSerdeAdapter } from "@/serde/implementations/adapters/_module.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore"`
 * @group Derivables
 */
export type SemaphoreProviderSettingsBase = {
    /**
     * @default
     * ```ts
     * import { Namespace } from "@daiso-tech/core/namespace";
     *
     * new Namespace("@semaphore")
     * ```
     */
    namespace?: Namespace;

    serde?: OneOrMore<ISerderRegister>;

    /**
     * @default ""
     */
    serdeTransformerName?: string;

    /**
     * You can pass your slot id generator function.
     * @default
     * ```ts
     * import { v4 } from "uuid";
     *
     * () => v4
     */
    createSlotId?: Invokable<[], string>;

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
     * You can decide the default ttl value for {@link ISemaphore | `ISemaphore`} expiration. If null is passed then no ttl will be used by default.
     * @default
     * ```ts
     * import { TimeSpan } from "@daiso-tech/core/time-span";
     *
     * TimeSpan.fromMinutes(5);
     * ```
     */
    defaultTtl?: ITimeSpan | null;

    /**
     * The default refresh time used in the {@link ISemaphore | `ISemaphore`} `acquireBlocking` and `runBlocking` methods.
     * @default
     * ```ts
     * import { TimeSpan } from "@daiso-tech/core/time-span";
     *
     * TimeSpan.fromSeconds(1);
     * ```
     */
    defaultBlockingInterval?: ITimeSpan;

    /**
     * The default refresh time used in the {@link ISemaphore | `ISemaphore`} `acquireBlocking` and `runBlocking` methods.
     * @default
     * ```ts
     * import { TimeSpan } from "@daiso-tech/core/time-span";
     *
     * TimeSpan.fromMinutes(1);
     * ```
     */
    defaultBlockingTime?: ITimeSpan;

    /**
     * The default refresh time used in the {@link ISemaphore | `ISemaphore`} `referesh` method.
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
 * IMPORT_PATH: `"@daiso-tech/core/semaphore"`
 * @group Derivables
 */
export type SemaphoreProviderSettings = SemaphoreProviderSettingsBase & {
    adapter: SemaphoreAdapterVariants;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore"`
 * @group Derivables
 */
export const DEFAULT_SEMAPHORE_PROVIDER_NAMESPACE = new Namespace("@semaphore");

/**
 * `SemaphoreProvider` class can be derived from any {@link ISemaphoreAdapter | `ISemaphoreAdapter`} or {@link IDatabaseSemaphoreAdapter | `IDatabaseSemaphoreAdapter`}.
 *
 * Note the {@link ISemaphore | `ISemaphore`} instances created by the `SemaphoreProvider` class are serializable and deserializable,
 * allowing them to be seamlessly transferred across different servers, processes, and databases.
 * This can be done directly using {@link ISerderRegister | `ISerderRegister`} or indirectly through components that rely on {@link ISerderRegister | `ISerderRegister`} internally.
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore"`
 * @group Derivables
 */
export class SemaphoreProvider implements ISemaphoreProvider {
    private readonly eventBus: IEventBus<SemaphoreEventMap>;
    private readonly adapter: ISemaphoreAdapter;
    private readonly originalAdapter:
        | ISemaphoreAdapter
        | IDatabaseSemaphoreAdapter;
    private readonly namespace: Namespace;
    private readonly defaultTtl: TimeSpan | null;
    private readonly defaultBlockingInterval: TimeSpan;
    private readonly defaultBlockingTime: TimeSpan;
    private readonly defaultRefreshTime: TimeSpan;
    private readonly serde: OneOrMore<ISerderRegister>;
    private readonly serdeTransformerName: string;
    private readonly createSlotId: Invokable<[], string>;

    /**
     * @example
     * ```ts
     * import { KyselySemaphoreAdapter } from "@daiso-tech/core/semaphore/kysely-semaphore-adapter";
     * import { SemaphoreProvider } from "@daiso-tech/core/semaphore";
     * import { Serde } from "@daiso-tech/core/serde";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/super-json-serde-adapter";
     * import Sqlite from "better-sqlite3";
     * import { Kysely, SqliteDialect } from "kysely";
     *
     * const semaphoreAdapter = new KyselySemaphoreAdapter({
     *   kysely: new Kysely({
     *     dialect: new SqliteDialect({
     *       database: new Sqlite("local.db"),
     *     }),
     *   });
     * });
     * // You need initialize the adapter once before using it.
     * await semaphoreAdapter.init();
     *
     * const serde = new Serde(new SuperJsonSerdeAdapter())
     * const lockProvider = new SemaphoreProvider({
     *   serde,
     *   adapter: semaphoreAdapter,
     * });
     * ```
     */
    constructor(settings: SemaphoreProviderSettings) {
        const {
            createSlotId = () => v4(),
            defaultTtl = TimeSpan.fromMinutes(5),
            defaultBlockingInterval = TimeSpan.fromSeconds(1),
            defaultBlockingTime = TimeSpan.fromMinutes(1),
            defaultRefreshTime = TimeSpan.fromMinutes(5),
            serde = new Serde(new NoOpSerdeAdapter()),
            namespace = DEFAULT_SEMAPHORE_PROVIDER_NAMESPACE,
            adapter,
            eventBus = new EventBus<any>({
                adapter: new NoOpEventBusAdapter(),
            }),
            serdeTransformerName = "",
        } = settings;

        this.createSlotId = createSlotId;
        this.serde = serde;
        this.defaultBlockingInterval = TimeSpan.fromTimeSpan(
            defaultBlockingInterval,
        );
        this.defaultBlockingTime = TimeSpan.fromTimeSpan(defaultBlockingTime);
        this.defaultRefreshTime = TimeSpan.fromTimeSpan(defaultRefreshTime);
        this.namespace = namespace;
        this.defaultTtl =
            defaultTtl === null ? null : TimeSpan.fromTimeSpan(defaultTtl);
        this.eventBus = eventBus;
        this.serdeTransformerName = serdeTransformerName;

        this.originalAdapter = adapter;
        this.adapter = resolveSemaphoreAdapter(adapter);

        this.registerToSerde();
    }

    private registerToSerde(): void {
        const transformer = new SemaphoreSerdeTransformer({
            adapter: this.adapter,
            originalAdapter: this.originalAdapter,
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
     * You can listen to the following {@link SemaphoreEventMap | `SemaphoreEventMap`} of all {@link ISemaphore | `ISemaphore`} instances created by the {@link ISemaphoreProvider | `ISemaphoreProvider`}.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    addListener<TEventName extends keyof SemaphoreEventMap>(
        eventName: TEventName,
        listener: EventListener<SemaphoreEventMap[TEventName]>,
    ): ITask<void> {
        return this.eventBus.addListener(eventName, listener);
    }

    /**
     * You can listen to the following {@link SemaphoreEventMap | `SemaphoreEventMap`} of all {@link ISemaphore | `ISemaphore`} instances created by the {@link ISemaphoreProvider | `ISemaphoreProvider`}.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    removeListener<TEventName extends keyof SemaphoreEventMap>(
        eventName: TEventName,
        listener: EventListener<SemaphoreEventMap[TEventName]>,
    ): ITask<void> {
        return this.eventBus.removeListener(eventName, listener);
    }

    /**
     * You can listen to the following {@link SemaphoreEventMap | `SemaphoreEventMap`} of all {@link ISemaphore | `ISemaphore`} instances created by the {@link ISemaphoreProvider | `ISemaphoreProvider`}.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    listenOnce<TEventName extends keyof SemaphoreEventMap>(
        eventName: TEventName,
        listener: EventListener<SemaphoreEventMap[TEventName]>,
    ): ITask<void> {
        return this.eventBus.listenOnce(eventName, listener);
    }

    /**
     * You can listen to the following {@link SemaphoreEventMap | `SemaphoreEventMap`} of all {@link ISemaphore | `ISemaphore`} instances created by the {@link ISemaphoreProvider | `ISemaphoreProvider`}.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    asPromise<TEventName extends keyof SemaphoreEventMap>(
        eventName: TEventName,
    ): ITask<SemaphoreEventMap[TEventName]> {
        return this.eventBus.asPromise(eventName);
    }

    /**
     * You can listen to the following {@link SemaphoreEventMap | `SemaphoreEventMap`} of all {@link ISemaphore | `ISemaphore`} instances created by the {@link ISemaphoreProvider | `ISemaphoreProvider`}.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    subscribeOnce<TEventName extends keyof SemaphoreEventMap>(
        eventName: TEventName,
        listener: EventListener<SemaphoreEventMap[TEventName]>,
    ): ITask<Unsubscribe> {
        return this.eventBus.subscribeOnce(eventName, listener);
    }

    /**
     * You can listen to the following {@link SemaphoreEventMap | `SemaphoreEventMap`} of all {@link ISemaphore | `ISemaphore`} instances created by the {@link ISemaphoreProvider | `ISemaphoreProvider`}.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    subscribe<TEventName extends keyof SemaphoreEventMap>(
        eventName: TEventName,
        listener: EventListener<SemaphoreEventMap[TEventName]>,
    ): ITask<Unsubscribe> {
        return this.eventBus.subscribe(eventName, listener);
    }

    create(key: string, settings: SemaphoreProviderCreateSettings): ISemaphore {
        const {
            ttl = this.defaultTtl,
            limit,
            slotId = callInvokable(this.createSlotId),
        } = settings;
        isPositiveNbr(limit);

        return new Semaphore({
            slotId,
            limit,
            adapter: this.adapter,
            originalAdapter: this.originalAdapter,
            eventDispatcher: this.eventBus,
            key: this.namespace.create(key),
            ttl: ttl === null ? null : TimeSpan.fromTimeSpan(ttl),
            serdeTransformerName: this.serdeTransformerName,
            defaultBlockingInterval: this.defaultBlockingInterval,
            defaultBlockingTime: this.defaultBlockingTime,
            defaultRefreshTime: this.defaultRefreshTime,
            namespace: this.namespace,
        });
    }
}
