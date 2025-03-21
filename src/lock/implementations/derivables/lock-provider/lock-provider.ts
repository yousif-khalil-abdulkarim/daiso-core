/**
 * @module Lock
 */

import {
    resolveOneOrMore,
    TimeSpan,
    type AsyncFactoryable,
    type IKeyPrefixer,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type IFactoryObject,
    type Items,
    CORE,
    resolveAsyncFactoryable,
    type Factory,
    type AsyncLazy,
    type FactoryFn,
    resolveFactory,
} from "@/utilities/_module-exports.js";
import { KeyPrefixer, type OneOrMore } from "@/utilities/_module-exports.js";
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
import { LazyPromise } from "@/async/_module-exports.js";
import type {
    EventClass,
    EventInstance,
    EventListener,
    IEventBus,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    IEventListenable,
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
};

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock"```
 * @group Derivables
 */
export type LockAdapterFactoryable = AsyncFactoryable<
    string,
    ILockAdapter | IDatabaseLockAdapter
>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock"```
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
 * IMPORT_PATH: ```"@daiso-tech/core/lock"```
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
            serdeTransformerName,
            serde,
            lockStore,
            keyPrefixer,
            createLazyPromise,
            defaultBlockingInterval,
            defaultBlockingTime,
            defaultRefreshTime,
            groupableEventBus,
        } = settings;
        const adapter = await resolveAsyncFactoryable(
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
            serdeTransformerName,
        });
        for (const serde_ of resolveOneOrMore(serde)) {
            serde_.registerCustom(transformer, CORE);
        }
        return resolvedAdapter;
    }

    private lockStore: ILockStore = {};
    private readonly groupableEventBus: IGroupableEventBus<LockEvents>;
    private readonly eventBus: IEventBus<LockEvents>;
    private readonly adapterFactoryable: LockAdapterFactoryable;
    private readonly adapterPromise: PromiseLike<ILockAdapter>;
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
     *
     * You can pass factory function that will create an adapter for every group.
     * @example
     * ```ts
     * import { SqliteLockAdapter } from "@daiso-tech/core/lock/adapters";
     * import type { IDatabaseLockAdapter } from "@daiso-tech/core/lock/contracts";
     * import { LockProvider } from "@daiso-tech/core/lock";
     * import { KeyPrefixer, type ISqliteDatabase, type AsyncFactoryFn } from "@daiso-tech/core/utilities";
     * import { Serde } from "@daiso-tech/core/serde";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
     * import Sqlite from "better-sqlite3";
     *
     * function lockAdapterFactory(database: ISqliteDatabase): AsyncFactoryFn<string, IDatabaseLockAdapter> {
     *   return async (prefix) => {
     *     const lockAdapter = new SqliteLockAdapter({
     *       database,
     *       tableName: `lock_${prefix}`,
     *     });
     *     // You need initialize the adapter once before using it.
     *     await lockAdapter.init();
     *     return lockAdapter;
     *   }
     * }
     *
     * const database = new Sqlite("local.db");
     * const serde = new Serde(new SuperJsonSerdeAdapter());
     * const lockProvider = new LockProvider({
     *   keyPrefixer: new KeyPrefixer("lock"),
     *   serde,
     *   adapter: lockAdapterFactory(database),
     * });
     * ```
     *
     * You can also pass factory object that implements <i>{@link IFactoryObject}</i> contract. This useful for depedency injection libraries.
     * @example
     * ```ts
     * import { SqliteLockAdapter } from "@daiso-tech/core/lock/adapters";
     * import type { IDatabaseLockAdapter } from "@daiso-tech/core/lock/contracts";
     * import { LockProvider } from "@daiso-tech/core/lock";
     * import { KeyPrefixer, type ISqliteDatabase, type IAsyncFactoryObject, type Promisable } from "@daiso-tech/core/utilities";
     * import { Serde } from "@daiso-tech/core/serde";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
     * import Sqlite from "better-sqlite3";
     *
     * class LockAdapterFactory implements IAsyncFactoryObject<string, IDatabaseLockAdapter> {
     *   constructor(private readonly database: ISqliteDatabase) {}
     *
     *   async use(prefix: string): Promise<IDatabaseLockAdapter> {
     *     const lockAdapter = new SqliteLockAdapter({
     *       database,
     *       tableName: `lock_${prefix}`,
     *     });
     *     // You need initialize the adapter once before using it.
     *     await lockAdapter.init();
     *     return lockAdapter;
     *   }
     * }
     *
     * const database = new Sqlite("local.db");
     * const serde = new Serde(new SuperJsonSerdeAdapter())
     * const lockProvider = new LockProvider({
     *   keyPrefixer: new KeyPrefixer("lock"),
     *   serde,
     *   adapter: new LockAdapterFactory(database),
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
            eventBus: groupableEventBus = new EventBus({
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
        this.groupableEventBus = groupableEventBus;
        this.adapterFactoryable = adapter;
        this.defaultTtl = defaultTtl;
        this.eventBus = this.eventBus = this.groupableEventBus.withGroup(
            this.keyPrefixer.resolvedRootPrefix,
        );
        this.lazyPromiseFactory = resolveFactory(lazyPromiseFactory);

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
                    serdeTransformerName,
                },
            ),
        );
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
    addListenerMany<TEventClassArr extends EventClass<LockEvents>[]>(
        events: [...TEventClassArr],
        listener: EventListener<EventInstance<Items<TEventClassArr>>>,
    ): LazyPromise<void> {
        return this.eventBus.addListenerMany(events, listener);
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
    removeListenerMany<TEventClassArr extends EventClass<LockEvents>[]>(
        events: [...TEventClassArr],
        listener: EventListener<EventInstance<Items<TEventClassArr>>>,
    ): LazyPromise<void> {
        return this.eventBus.removeListenerMany(events, listener);
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

    /**
     * You can listen to the following <i>{@link LockEvents}</i> of all <i>{@link ILock}</i> instances created by the <i>{@link ILockProvider}</i>.
     * To understand how this method works, refer to <i>{@link IEventListenable}</i>.
     */
    subscribeMany<TEventClassArr extends EventClass<LockEvents>[]>(
        events: [...TEventClassArr],
        listener: EventListener<EventInstance<Items<TEventClassArr>>>,
    ): LazyPromise<Unsubscribe> {
        return this.eventBus.subscribeMany(events, listener);
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

    /**
     * @example
     * ```ts
     * import { LockProvider } from "@daiso-tech/core/lock";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/adapters";
     * import { KeyPrefixer } from "@daiso-tech/core/utilities";
     * import { Serde } from "@daiso-tech/core/serde";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
     *
     * const serde = new Serde(new SuperJsonSerdeAdapter());
     * const lockProvider = new LockProvider({
     *   adapter: new MemoryLockAdapter(),
     *   keyPrefixer: new KeyPrefixer("lock"),
     *   serde,
     * });
     *
     * // Will log null because the lockProvider is not in a group
     * console.log(lockProvider.getGroup());
     *
     * const groupedLockProvider = lockProvider.withGroup("group-a");
     *
     * // Will log "group-a" because the groupedLockProvider is in a group
     * console.log(groupedLockProvider.getGroup());
     * ```
     */
    getGroup(): string | null {
        return this.keyPrefixer.resolvedGroup;
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
     * const serde = new Serde(new SuperJsonSerdeAdapter());
     * const lockProvider = new LockProvider({
     *   adapter: new MemoryLockAdapter(),
     *   keyPrefixer: new KeyPrefixer("lock"),
     *   serde,
     * });
     *
     * const groupedLockProvider = lockProvider.withGroup("group-a");
     *
     * // Will log true because they are in different groups.
     * console.log(
     *   await lockProvider
     *     .create("a")
     *     .acquire()
     * );
     *
     * // Will log true because the lockProviders are in different groups.
     * console.log(
     *   await groupedLockProvider
     *     .create("a")
     *     .acquire()
     * );
     * ```
     */
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
            lazyPromiseFactory: this.lazyPromiseFactory,
        });
    }
}
