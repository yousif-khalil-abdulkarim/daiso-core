/**
 * @module RateLimiter
 */

import {
    type EventListener,
    type IEventBus,
    type Unsubscribe,
} from "@/event-bus/contracts/_module.js";
import { NoOpEventBusAdapter } from "@/event-bus/implementations/adapters/_module.js";
import { EventBus } from "@/event-bus/implementations/derivables/_module.js";
import { Namespace } from "@/namespace/implementations/_module.js";
import {
    type IRateLimiter,
    type IRateLimiterAdapter,
    type IRateLimiterProvider,
    type RateLimiterEventMap,
    type RateLimiterProviderCreateSettings,
} from "@/rate-limiter/contracts/_module.js";
import { RateLimiterSerdeTransformer } from "@/rate-limiter/implementations/derivables/rate-limiter-provider/rate-limiter-serde-transformer.js";
import { RateLimiter } from "@/rate-limiter/implementations/derivables/rate-limiter-provider/rate-limiter.js";
import { type ISerderRegister } from "@/serde/contracts/_module.js";
import { NoOpSerdeAdapter } from "@/serde/implementations/adapters/_module.js";
import { Serde } from "@/serde/implementations/derivables/_module.js";
import { type ITask } from "@/task/contracts/_module.js";
import {
    CORE,
    resolveOneOrMore,
    type ErrorPolicy,
    type OneOrMore,
} from "@/utilities/_module.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter"`
 * @group Derivables
 */
export type RateLimiterProviderSettingsBase = {
    /**
     * @default
     * ```ts
     * import { Namespace } from "@daiso-tech/core/namespace";
     *
     * new Namespace("@rate-limiter")
     * ```
     */
    namespace?: Namespace;

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
     * You can set the default `ErrorPolicy`
     *
     * @default
     * ```ts
     * (_error: unknown) => true
     * ```
     */
    defaultErrorPolicy?: ErrorPolicy;

    /**
     * If true will only apply rate limiting when function errors and not when function is called.
     * @default false
     */
    onlyError?: boolean;

    /**
     * If true, metric tracking will run asynchronously in the background and won't block the function utilizing the circuit breaker logic.
     * This will only have effect if `onlyError` settings is true.
     * @default true
     */
    enableAsyncTracking?: boolean;

    /**
     * @default
     * ```ts
     * import { Serde } from "@daiso-tech/serde";
     * import { NoOpSerdeAdapter } from "@daiso-tech/serde/no-op-serde-adapter";
     *
     * new Serde(new NoOpSerdeAdapter())
     * ```
     */
    serde?: OneOrMore<ISerderRegister>;

    /**
     * @default ""
     */
    serdeTransformerName?: string;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter"`
 * @group Derivables
 */
export type RateLimiterProviderSettings = RateLimiterProviderSettingsBase & {
    adapter: IRateLimiterAdapter;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter"`
 * @group Derivables
 */
export const DEFAULT_CIRCUIT_BREAKER_PROVIDER_NAMESPACE = new Namespace(
    "@rate-limiter",
);

/**
 * The `RateLimiterProvider` class can be derived from any {@link IRateLimiterAdapter | `IRateLimiterAdapter`}.
 *
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter"`
 * @group Derivables
 */
export class RateLimiterProvider implements IRateLimiterProvider {
    private readonly namespace: Namespace;
    private readonly eventBus: IEventBus<RateLimiterEventMap>;
    private readonly adapter: IRateLimiterAdapter;
    private readonly onlyError: boolean;
    private readonly defaultErrorPolicy: ErrorPolicy;
    private readonly enableAsyncTracking: boolean;
    private readonly serde: OneOrMore<ISerderRegister>;
    private readonly serdeTransformerName: string;

    /**
     * @example
     * ```ts
     * import { KyselyRateLimiterStorageAdapter } from "@daiso-tech/core/rate-limiter/kysely-rate-limiter-storage-adapter";
     * import { DatabaseRateLimiterAdapter } from "@daiso-tech/core/rate-limiter/database-rate-limiter-adapter";
     * import { Serde } from "@daiso-tech/core/serde";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/super-json-serde-adapter"
     * import Sqlite from "better-sqlite3";
     * import { Kysely, SqliteDialect } from "kysely";
     *
     * const serde = new Serde(new SuperJsonSerdeAdapter());
     * const rateLimiterStorageAdapter = new KyselyRateLimiterStorageAdapter({
     *   kysely: new Kysely({
     *     dialect: new SqliteDialect({
     *       database: new Sqlite("local.db"),
     *     }),
     *   }),
     *   serde
     * });
     * // You need initialize the adapter once before using it.
     * await rateLimiterStorageAdapter.init();
     *
     * const rateLimiterAdapter = new DatabaseRateLimiterAdapter({
     *   adapter: rateLimiterStorageAdapter
     * });
     *
     * const rateLimiterProvider = new RateLimiterProvider({
     *   adapter: rateLimiterAdapter
     * })
     * ```
     */
    constructor(settings: RateLimiterProviderSettings) {
        const {
            enableAsyncTracking = true,
            namespace = DEFAULT_CIRCUIT_BREAKER_PROVIDER_NAMESPACE,
            eventBus = new EventBus({
                adapter: new NoOpEventBusAdapter(),
            }),
            adapter,
            onlyError = false,
            defaultErrorPolicy = () => true,
            serde = new Serde(new NoOpSerdeAdapter()),
            serdeTransformerName = "",
        } = settings;

        this.serdeTransformerName = serdeTransformerName;
        this.enableAsyncTracking = enableAsyncTracking;
        this.namespace = namespace;
        this.eventBus = eventBus;
        this.adapter = adapter;
        this.onlyError = onlyError;
        this.defaultErrorPolicy = defaultErrorPolicy;
        this.serde = serde;
        this.registerToSerde();
    }

    private registerToSerde(): void {
        const transformer = new RateLimiterSerdeTransformer({
            enableAsyncTracking: this.enableAsyncTracking,
            namespace: this.namespace,
            eventBus: this.eventBus,
            adapter: this.adapter,
            onlyError: this.onlyError,
            errorPolicy: this.defaultErrorPolicy,
            serdeTransformerName: this.serdeTransformerName,
        });
        for (const serde of resolveOneOrMore(this.serde)) {
            serde.registerCustom(transformer, CORE);
        }
    }

    addListener<TEventName extends keyof RateLimiterEventMap>(
        eventName: TEventName,
        listener: EventListener<RateLimiterEventMap[TEventName]>,
    ): ITask<void> {
        return this.eventBus.addListener(eventName, listener);
    }

    removeListener<TEventName extends keyof RateLimiterEventMap>(
        eventName: TEventName,
        listener: EventListener<RateLimiterEventMap[TEventName]>,
    ): ITask<void> {
        return this.eventBus.removeListener(eventName, listener);
    }

    listenOnce<TEventName extends keyof RateLimiterEventMap>(
        eventName: TEventName,
        listener: EventListener<RateLimiterEventMap[TEventName]>,
    ): ITask<void> {
        return this.eventBus.listenOnce(eventName, listener);
    }

    asTask<TEventName extends keyof RateLimiterEventMap>(
        eventName: TEventName,
    ): ITask<RateLimiterEventMap[TEventName]> {
        return this.eventBus.asTask(eventName);
    }

    subscribeOnce<TEventName extends keyof RateLimiterEventMap>(
        eventName: TEventName,
        listener: EventListener<RateLimiterEventMap[TEventName]>,
    ): ITask<Unsubscribe> {
        return this.eventBus.subscribeOnce(eventName, listener);
    }

    subscribe<TEventName extends keyof RateLimiterEventMap>(
        eventName: TEventName,
        listener: EventListener<RateLimiterEventMap[TEventName]>,
    ): ITask<Unsubscribe> {
        return this.eventBus.subscribe(eventName, listener);
    }

    create(
        key: string,
        settings: RateLimiterProviderCreateSettings,
    ): IRateLimiter {
        const {
            errorPolicy = this.defaultErrorPolicy,
            onlyError = this.onlyError,
            limit,
        } = settings;
        return new RateLimiter({
            limit,
            enableAsyncTracking: this.enableAsyncTracking,
            eventDispatcher: this.eventBus,
            adapter: this.adapter,
            key: this.namespace.create(key),
            errorPolicy,
            onlyError,
            serdeTransformerName: this.serdeTransformerName,
            namespace: this.namespace,
        });
    }
}
