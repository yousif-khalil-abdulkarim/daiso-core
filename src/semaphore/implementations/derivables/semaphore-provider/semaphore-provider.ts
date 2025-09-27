/**
 * @module Semaphore
 */

import { LazyPromise } from "@/async/_module-exports.js";
import type {
    EventListener,
    IEventBus,
    Unsubscribe,
} from "@/event-bus/contracts/_module-exports.js";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/adapters/_module-exports.js";
import { EventBus } from "@/event-bus/implementations/derivables/_module-exports.js";
import type {
    IDatabaseSemaphoreAdapter,
    ISemaphore,
    ISemaphoreAdapter,
    SemaphoreAdapterVariants,
    SemaphoreEventMap,
    SemaphoreProviderCreateSettings,
} from "@/semaphore/contracts/_module-exports.js";
import type { ISemaphoreProvider } from "@/semaphore/contracts/_module-exports.js";
import type { ISerderRegister } from "@/serde/contracts/_module-exports.js";
import {
    callInvokable,
    CORE,
    isPositiveNbr,
    resolveInvokable,
    resolveOneOrMore,
    type AsyncLazy,
    type Factory,
    type FactoryFn,
    type Invokable,
    type OneOrMore,
} from "@/utilities/_module-exports.js";
import { Semaphore } from "@/semaphore/implementations/derivables/semaphore-provider/semaphore.js";
import { v4 } from "uuid";
import { SemaphoreSerdeTransformer } from "@/semaphore/implementations/derivables/semaphore-provider/semaphore-serde-transformer.js";
import { resolveDatabaseSemaphoreAdapter } from "@/semaphore/implementations/derivables/semaphore-provider/resolve-database-semaphore-adapter.js";
import { TimeSpan } from "@/time-span/implementations/_module-exports.js";
import type { ITimeSpan } from "@/time-span/contracts/_module-exports.js";
import { Namespace } from "@/namespace/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore"`
 * @group Derivables
 */
export type SemaphoreProviderSettingsBase = {
    /**
     * @default
     * ```ts
     * import { Namespace } from "@daiso-tech/core/utilities";
     *
     * new Namespace(["@", "semaphore"])
     * ```
     */
    namespace?: Namespace;

    /**
     * You can pass a {@link Factory | `Factory`} of {@link LazyPromise| `LazyPromise`} to configure default settings for all {@link LazyPromise| `LazyPromise`} instances used in the `SemaphoreProvider` class.
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
     * You can pass your slot id generator function.
     */
    createSlotId?: Invokable<[], string>;

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
     * You can decide the default ttl value for {@link ISemaphore | `ISemaphore`} expiration. If null is passed then no ttl will be used by default.
     * @default
     * ```ts
     * TimeSpan.fromMinutes(5);
     * ```
     */
    defaultTtl?: ITimeSpan | null;

    /**
     * The default refresh time used in the {@link ISemaphore | `ISemaphore`} `acquireBlocking` and `runBlocking` methods.
     * @default
     * ```ts
     * TimeSpan.fromSeconds(1);
     * ```
     */
    defaultBlockingInterval?: ITimeSpan;

    /**
     * The default refresh time used in the {@link ISemaphore | `ISemaphore`} `acquireBlocking` and `runBlocking` methods.
     * @default
     * ```ts
     * TimeSpan.fromMinutes(1);
     * ```
     */
    defaultBlockingTime?: ITimeSpan;

    /**
     * The default refresh time used in the {@link ISemaphore | `ISemaphore`} `referesh` method.
     * ```ts
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
    private readonly lazyPromiseFactory: FactoryFn<
        AsyncLazy<any>,
        LazyPromise<any>
    >;
    private readonly serdeTransformerName: string;
    private readonly createSlotId: Invokable<[], string>;

    constructor(settings: SemaphoreProviderSettings) {
        const {
            createSlotId = () => v4(),
            defaultTtl = TimeSpan.fromMinutes(5),
            defaultBlockingInterval = TimeSpan.fromSeconds(1),
            defaultBlockingTime = TimeSpan.fromMinutes(1),
            defaultRefreshTime = TimeSpan.fromMinutes(5),
            serde,
            namespace = new Namespace(["@", "lock"]),
            adapter,
            eventBus = new EventBus<any>({
                adapter: new MemoryEventBusAdapter(),
            }),
            serdeTransformerName = "",
            lazyPromiseFactory = (invokable) => new LazyPromise(invokable),
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
        this.lazyPromiseFactory = resolveInvokable(lazyPromiseFactory);
        this.serdeTransformerName = serdeTransformerName;

        this.originalAdapter = adapter;
        this.adapter = resolveDatabaseSemaphoreAdapter(adapter);

        this.registerToSerde();
    }

    private registerToSerde(): void {
        const transformer = new SemaphoreSerdeTransformer({
            adapter: this.adapter,
            originalAdapter: this.originalAdapter,
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
     * You can listen to the following {@link SemaphoreEventMap | `SemaphoreEventMap`} of all {@link ISemaphore | `ISemaphore`} instances created by the {@link ISemaphoreProvider | `ISemaphoreProvider`}.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    addListener<TEventName extends keyof SemaphoreEventMap>(
        eventName: TEventName,
        listener: EventListener<SemaphoreEventMap[TEventName]>,
    ): LazyPromise<void> {
        return this.eventBus.addListener(eventName, listener);
    }

    /**
     * You can listen to the following {@link SemaphoreEventMap | `SemaphoreEventMap`} of all {@link ISemaphore | `ISemaphore`} instances created by the {@link ISemaphoreProvider | `ISemaphoreProvider`}.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    removeListener<TEventName extends keyof SemaphoreEventMap>(
        eventName: TEventName,
        listener: EventListener<SemaphoreEventMap[TEventName]>,
    ): LazyPromise<void> {
        return this.eventBus.removeListener(eventName, listener);
    }

    /**
     * You can listen to the following {@link SemaphoreEventMap | `SemaphoreEventMap`} of all {@link ISemaphore | `ISemaphore`} instances created by the {@link ISemaphoreProvider | `ISemaphoreProvider`}.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    listenOnce<TEventName extends keyof SemaphoreEventMap>(
        eventName: TEventName,
        listener: EventListener<SemaphoreEventMap[TEventName]>,
    ): LazyPromise<void> {
        return this.eventBus.listenOnce(eventName, listener);
    }

    /**
     * You can listen to the following {@link SemaphoreEventMap | `SemaphoreEventMap`} of all {@link ISemaphore | `ISemaphore`} instances created by the {@link ISemaphoreProvider | `ISemaphoreProvider`}.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    asPromise<TEventName extends keyof SemaphoreEventMap>(
        eventName: TEventName,
    ): LazyPromise<SemaphoreEventMap[TEventName]> {
        return this.eventBus.asPromise(eventName);
    }

    /**
     * You can listen to the following {@link SemaphoreEventMap | `SemaphoreEventMap`} of all {@link ISemaphore | `ISemaphore`} instances created by the {@link ISemaphoreProvider | `ISemaphoreProvider`}.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    subscribeOnce<TEventName extends keyof SemaphoreEventMap>(
        eventName: TEventName,
        listener: EventListener<SemaphoreEventMap[TEventName]>,
    ): LazyPromise<Unsubscribe> {
        return this.eventBus.subscribeOnce(eventName, listener);
    }

    /**
     * You can listen to the following {@link SemaphoreEventMap | `SemaphoreEventMap`} of all {@link ISemaphore | `ISemaphore`} instances created by the {@link ISemaphoreProvider | `ISemaphoreProvider`}.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    subscribe<TEventName extends keyof SemaphoreEventMap>(
        eventName: TEventName,
        listener: EventListener<SemaphoreEventMap[TEventName]>,
    ): LazyPromise<Unsubscribe> {
        return this.eventBus.subscribe(eventName, listener);
    }

    private createLazyPromise<TValue = void>(
        asyncFn: () => Promise<TValue>,
    ): LazyPromise<TValue> {
        return this.lazyPromiseFactory(asyncFn);
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
            createLazyPromise: (asyncFn) => this.createLazyPromise(asyncFn),
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
