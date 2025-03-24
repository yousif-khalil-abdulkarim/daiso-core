/**
 * @module Lock
 */

import {
    TimeSpan,
    type IKeyPrefixer,
    CORE,
    type Factory,
    type AsyncLazy,
    type FactoryFn,
    resolveFactory,
    resolveOneOrMore,
} from "@/utilities/_module-exports.js";
import { KeyPrefixer, type OneOrMore } from "@/utilities/_module-exports.js";
import type {
    IDatabaseLockAdapter,
    LockEvents,
} from "@/lock/contracts/_module-exports.js";
import {
    type ILock,
    type LockProviderCreateSettings,
    type ILockProvider,
    type ILockAdapter,
} from "@/lock/contracts/_module-exports.js";
import { LazyPromise } from "@/async/_module-exports.js";
import type {
    EventClass,
    EventInstance,
    EventListener,
    IEventBus,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    IEventListenable,
    Unsubscribe,
} from "@/event-bus/contracts/_module-exports.js";

import type { IFlexibleSerde } from "@/serde/contracts/_module-exports.js";
import { EventBus } from "@/event-bus/implementations/derivables/_module-exports.js";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/adapters/_module-exports.js";
import { v4 } from "uuid";
import { Lock } from "@/lock/implementations/derivables/lock-provider/lock.js";
import {
    LockState,
    type ILockStore,
} from "@/lock/implementations/derivables/lock-provider/lock-state.js";
import { isDatabaseLockAdapter } from "@/lock/implementations/derivables/lock-provider/is-database-lock-adapter.js";
import { DatabaseLockAdapter } from "@/lock/implementations/derivables/lock-provider/database-lock-adapter.js";
import { LockSerdeTransformer } from "@/lock/implementations/derivables/lock-provider/lock-serde-transformer.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock"```
 * @group Derivables
 */
export type LockProviderSettingsBase = {
    keyPrefixer: IKeyPrefixer;

    /**
     * You can pass a <i>{@link Factory}</i> of <i>{@link LazyPromise}</i> to configure default settings for all <i>{@link LazyPromise}</i> instances used in the <i>LockProvider</i> class.
     * @default
     * ```ts
     * import { LazyPromise } from "@daiso-tech/core/async";
     *
     * (invokable) => new LazyPromise(invokable)
     * ```
     */
    lazyPromiseFactory?: Factory<AsyncLazy<any>, LazyPromise<any>>;

    serde: OneOrMore<IFlexibleSerde>;

    /**
     * @default {""}
     */
    serdeTransformerName?: string;

    /**
     * You can pass your owner id generator function.
     */
    createOwnerId?: () => string;

    /**
     * @default
     * ```ts
     * import { EventBus } from "@daiso-tech/core/event-bus";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
     * import { KeyPrefixer } from "@daiso-tech/core/utilities";
     *
     * new EventBus({
     *   keyPrefixer: new KeyPrefixer("event-bus"),
     *   adapter: new MemoryEventBusAdapter()
     * })
     * ```
     */
    eventBus?: IEventBus<any>;

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
};

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock"```
 * @group Derivables
 */
export type LockAdapter = ILockAdapter | IDatabaseLockAdapter;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock"```
 * @group Derivables
 */
export type LockProviderSettings = LockProviderSettingsBase & {
    adapter: LockAdapter;
};

/**
 * <i>LockProvider</i> class can be derived from any <i>{@link ILockAdapter}</i> or <i>{@link IDatabaseLockAdapter}</i>.
 *
 * Note the <i>{@link ILock}</i> instances created by the <i>LockProvider</i> class are serializable and deserializable,
 * allowing them to be seamlessly transferred across different servers, processes, and databases.
 * This can be done directly using <i>{@link IFlexibleSerde}</i> or indirectly through components that rely on <i>{@link IFlexibleSerde}</i> internally.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock"```
 * @group Derivables
 */
export class LockProvider implements ILockProvider {
    private lockStore: ILockStore = {};
    private readonly eventBus: IEventBus<LockEvents>;
    private readonly adapter: ILockAdapter;
    private readonly keyPrefixer: IKeyPrefixer;
    private readonly createOwnerId: () => string;
    private readonly defaultTtl: TimeSpan | null;
    private readonly defaultBlockingInterval: TimeSpan;
    private readonly defaultBlockingTime: TimeSpan;
    private readonly defaultRefreshTime: TimeSpan;
    private readonly serde: OneOrMore<IFlexibleSerde>;
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
     * import { KeyPrefixer } from "@daiso-tech/core/utilities";
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
     *   keyPrefixer: new KeyPrefixer("lock"),
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
            createOwnerId = () => v4(),
            serde,
            keyPrefixer,
            adapter,
            eventBus = new EventBus({
                keyPrefixer: new KeyPrefixer("events"),
                adapter: new MemoryEventBusAdapter(),
            }),
            serdeTransformerName = "",
            lazyPromiseFactory = (invokable) => new LazyPromise(invokable),
        } = settings;

        this.serde = serde;
        this.defaultBlockingInterval = defaultBlockingInterval;
        this.defaultBlockingTime = defaultBlockingTime;
        this.defaultRefreshTime = defaultRefreshTime;
        this.createOwnerId = createOwnerId;
        this.keyPrefixer = keyPrefixer;
        this.defaultTtl = defaultTtl;
        this.eventBus = eventBus;
        this.lazyPromiseFactory = resolveFactory(lazyPromiseFactory);
        this.serdeTransformerName = serdeTransformerName;

        if (isDatabaseLockAdapter(adapter)) {
            this.adapter = new DatabaseLockAdapter(adapter);
        } else {
            this.adapter = adapter;
        }

        this.registerToSerde();
    }

    private registerToSerde() {
        const transformer = new LockSerdeTransformer({
            adapter: this.adapter,
            createLazyPromise: this.createLazyPromise.bind(this),
            defaultBlockingInterval: this.defaultBlockingInterval,
            defaultBlockingTime: this.defaultBlockingTime,
            defaultRefreshTime: this.defaultRefreshTime,
            eventBus: this.eventBus,
            keyPrefixer: this.keyPrefixer,
            lockStore: this.lockStore,
            serdeTransformerName: this.serdeTransformerName,
        });
        for (const serde of resolveOneOrMore(this.serde)) {
            serde.registerCustom(transformer, CORE);
        }
    }

    /**
     * You can listen to the following <i>{@link LockEvents}</i> of all <i>{@link ILock}</i> instances created by the <i>{@link ILockProvider}</i>.
     * To understand how this method works, refer to <i>{@link IEventListenable}</i>.
     */
    addListener<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.eventBus.addListener(event, listener);
    }

    /**
     * You can listen to the following <i>{@link LockEvents}</i> of all <i>{@link ILock}</i> instances created by the <i>{@link ILockProvider}</i>.
     * To understand how this method works, refer to <i>{@link IEventListenable}</i>.
     */
    removeListener<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.eventBus.removeListener(event, listener);
    }

    /**
     * You can listen to the following <i>{@link LockEvents}</i> of all <i>{@link ILock}</i> instances created by the <i>{@link ILockProvider}</i>.
     * To understand how this method works, refer to <i>{@link IEventListenable}</i>.
     */
    listenOnce<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.eventBus.listenOnce(event, listener);
    }

    /**
     * You can listen to the following <i>{@link LockEvents}</i> of all <i>{@link ILock}</i> instances created by the <i>{@link ILockProvider}</i>.
     * To understand how this method works, refer to <i>{@link IEventListenable}</i>.
     */
    asPromise<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
    ): LazyPromise<EventInstance<TEventClass>> {
        return this.eventBus.asPromise(event);
    }

    /**
     * You can listen to the following <i>{@link LockEvents}</i> of all <i>{@link ILock}</i> instances created by the <i>{@link ILockProvider}</i>.
     * To understand how this method works, refer to <i>{@link IEventListenable}</i>.
     */
    subscribeOnce<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<Unsubscribe> {
        return this.eventBus.subscribeOnce(event, listener);
    }

    /**
     * You can listen to the following <i>{@link LockEvents}</i> of all <i>{@link ILock}</i> instances created by the <i>{@link ILockProvider}</i>.
     * To understand how this method works, refer to <i>{@link IEventListenable}</i>.
     */
    subscribe<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<Unsubscribe> {
        return this.eventBus.subscribe(event, listener);
    }

    private createLazyPromise<TValue = void>(
        asyncFn: () => PromiseLike<TValue>,
    ): LazyPromise<TValue> {
        return new LazyPromise(asyncFn);
    }

    /**
     * @example
     * ```ts
     * import { LockProvider } from "@daiso-tech/core/lock";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/adapters";
     * import { KeyPrefixer } from "@daiso-tech/core/utilities";
     * import { Serde } from "@daiso-tech/core/serde";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
     *
     * const lockProvider = new LockProvider({
     *   adapter: new MemoryLockAdapter(),
     *   keyPrefixer: new KeyPrefixer("lock"),
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
        const { ttl = this.defaultTtl, owner = this.createOwnerId() } =
            settings;

        const keyObj = this.keyPrefixer.create(key);

        return new Lock({
            adapter: this.adapter,
            createLazyPromise: this.createLazyPromise.bind(this),
            lockState: new LockState(this.lockStore, keyObj.prefixed),
            eventDispatcher: this.eventBus,
            key: keyObj,
            owner,
            ttl,
            expirationInMs: null,
            defaultBlockingInterval: this.defaultBlockingInterval,
            defaultBlockingTime: this.defaultBlockingTime,
            defaultRefreshTime: this.defaultRefreshTime,
        });
    }
}
