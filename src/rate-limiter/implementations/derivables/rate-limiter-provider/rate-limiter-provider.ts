/**
 * @module RateLimiter
 */

import type {
    EventListener,
    IEventBus,
    Unsubscribe,
} from "@/event-bus/contracts/_module-exports.js";
import { NoOpEventBusAdapter } from "@/event-bus/implementations/adapters/_module.js";
import { EventBus } from "@/event-bus/implementations/derivables/_module-exports.js";
import { Namespace } from "@/namespace/_module-exports.js";
import type {
    IRateLimiter,
    IRateLimiterAdapter,
    IRateLimiterProvider,
    RateLimiterEventMap,
    RateLimiterProviderCreateSettings,
} from "@/rate-limiter/contracts/_module-exports.js";
import type { Task } from "@/task/task.js";
import type { ITimeSpan } from "@/time-span/contracts/_module-exports.js";
import { TimeSpan } from "@/time-span/implementations/_module-exports.js";
import type {
    ErrorPolicy,
    ErrorPolicySettings,
} from "@/utilities/_module-exports.js";
import { RateLimiter } from "@/rate-limiter/implementations/derivables/rate-limiter-provider/rate-limiter.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter"`
 * @group Derivables
 */
export type RateLimiterProviderSettingsBase = ErrorPolicySettings & {
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
     * @default
     * ```ts
     * import { TimeSpan } from "@daiso-tech/core/time-span";
     *
     * TimeSpan.fromSeconds(10);
     * ```
     */
    slowCallTime?: ITimeSpan;

    /**
     * If true will only apply rate limiting when function errors and not when function is called.
     * @default false
     */
    onlyError?: boolean;

    /**
     * If true, metric tracking will run asynchronously in the background and won't block the function utilizing the circuit breaker logic.
     * @default true
     */
    enableAsyncTracking?: boolean;
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
    private readonly slowCallTime: TimeSpan;
    private readonly onlyError: boolean;
    private readonly errorPolicy: ErrorPolicy;
    private readonly enableAsyncTracking: boolean;

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
            slowCallTime = TimeSpan.fromSeconds(10),
            onlyError = false,
            errorPolicy = () => true,
        } = settings;

        this.enableAsyncTracking = enableAsyncTracking;
        this.namespace = namespace;
        this.eventBus = eventBus;
        this.adapter = adapter;
        this.slowCallTime = TimeSpan.fromTimeSpan(slowCallTime);
        this.onlyError = onlyError;
        this.errorPolicy = errorPolicy;
    }

    addListener<TEventName extends keyof RateLimiterEventMap>(
        eventName: TEventName,
        listener: EventListener<RateLimiterEventMap[TEventName]>,
    ): Task<void> {
        return this.eventBus.addListener(eventName, listener);
    }

    removeListener<TEventName extends keyof RateLimiterEventMap>(
        eventName: TEventName,
        listener: EventListener<RateLimiterEventMap[TEventName]>,
    ): Task<void> {
        return this.eventBus.removeListener(eventName, listener);
    }

    listenOnce<TEventName extends keyof RateLimiterEventMap>(
        eventName: TEventName,
        listener: EventListener<RateLimiterEventMap[TEventName]>,
    ): Task<void> {
        return this.eventBus.listenOnce(eventName, listener);
    }

    asPromise<TEventName extends keyof RateLimiterEventMap>(
        eventName: TEventName,
    ): Task<RateLimiterEventMap[TEventName]> {
        return this.eventBus.asPromise(eventName);
    }

    subscribeOnce<TEventName extends keyof RateLimiterEventMap>(
        eventName: TEventName,
        listener: EventListener<RateLimiterEventMap[TEventName]>,
    ): Task<Unsubscribe> {
        return this.eventBus.subscribeOnce(eventName, listener);
    }

    subscribe<TEventName extends keyof RateLimiterEventMap>(
        eventName: TEventName,
        listener: EventListener<RateLimiterEventMap[TEventName]>,
    ): Task<Unsubscribe> {
        return this.eventBus.subscribe(eventName, listener);
    }

    create(
        key: string,
        settings: RateLimiterProviderCreateSettings,
    ): IRateLimiter {
        const { errorPolicy = this.errorPolicy, onlyError = this.onlyError } =
            settings;
        return new RateLimiter({
            enableAsyncTracking: this.enableAsyncTracking,
            eventDispatcher: this.eventBus,
            adapter: this.adapter,
            key: this.namespace.create(key),
            errorPolicy,
            onlyError,
        });
    }
}
