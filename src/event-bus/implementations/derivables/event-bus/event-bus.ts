/**
 * @module EventBus
 */

import type { BackoffPolicy, RetryPolicy } from "@/async/_module-exports.js";
import { LazyPromise } from "@/async/_module-exports.js";
import type {
    EventClass,
    EventInstance,
    Unsubscribe,
} from "@/event-bus/contracts/_module-exports.js";
import {
    type IEventBus,
    type IGroupableEventBus,
    type IEventBusAdapter,
    type Listener,
    type BaseEvent,
    UnableToDispatchEventBusError,
    UnableToRemoveListenerEventBusError,
    UnableToAddListenerEventBusError,
} from "@/event-bus/contracts/_module-exports.js";

import type { OneOrMore, TimeSpan } from "@/utilities/_module-exports.js";
import {
    getConstructorName,
    isArrayEmpty,
    simplifyOneOrMoreStr,
} from "@/utilities/_module-exports.js";

/**
 * @group Derivables
 */
export type EventBusSettings = {
    adapter: IEventBusAdapter;

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
 * <i>EventBus</i> class can be derived from any <i>{@link IEventBusAdapter}</i>.
 * @group Derivables
 */
export class EventBus<TEvents extends BaseEvent = BaseEvent>
    implements IGroupableEventBus<TEvents>
{
    private readonly adapter: IEventBusAdapter;
    private readonly retryAttempts: number | null;
    private readonly backoffPolicy: BackoffPolicy | null;
    private readonly retryPolicy: RetryPolicy | null;
    private readonly timeout: TimeSpan | null;

    /**
     * @example
     * ```ts
     * import { EventBus, MemoryEventBusAdapter, registerEventErrors, SuperJsonSerde } from "@daiso-tech/core";
     *
     * const eventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     * const serde = new SuperJsonSerde();
     * registerEventErrors(serde)
     * ```
     */
    constructor(settings: EventBusSettings) {
        const {
            adapter,
            retryAttempts = null,
            backoffPolicy = null,
            retryPolicy = null,
            timeout = null,
        } = settings;
        this.retryAttempts = retryAttempts;
        this.backoffPolicy = backoffPolicy;
        this.retryPolicy = retryPolicy;
        this.timeout = timeout;
        this.adapter = adapter;
    }

    private createLayPromise<TValue = void>(
        asyncFn: () => PromiseLike<TValue>,
    ): LazyPromise<TValue> {
        return new LazyPromise(asyncFn)
            .setRetryAttempts(this.retryAttempts)
            .setBackoffPolicy(this.backoffPolicy)
            .setRetryPolicy(this.retryPolicy)
            .setTimeout(this.timeout);
    }

    withGroup(group: OneOrMore<string>): IEventBus<TEvents> {
        return new EventBus({
            adapter: this.adapter.withGroup(simplifyOneOrMoreStr(group)),
            retryAttempts: this.retryAttempts,
            backoffPolicy: this.backoffPolicy,
            retryPolicy: this.retryPolicy,
            timeout: this.timeout,
        });
    }

    getGroup(): string {
        return this.adapter.getGroup();
    }

    addListener<TEventClass extends EventClass<TEvents>>(
        event: TEventClass,
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.createLayPromise(async () => {
            try {
                await this.adapter.addListener(
                    event.name,
                    listener as Listener<BaseEvent>,
                );
            } catch (error: unknown) {
                throw new UnableToAddListenerEventBusError(
                    `A listener with name of "${listener.name}" could not added for "${String(event)}" event`,
                    error,
                );
            }
        });
    }

    removeListener<TEventClass extends EventClass<TEvents>>(
        event: TEventClass,
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.createLayPromise(async () => {
            try {
                await this.adapter.removeListener(
                    event.name,
                    listener as Listener<BaseEvent>,
                );
            } catch (error: unknown) {
                throw new UnableToRemoveListenerEventBusError(
                    `A listener with name of "${listener.name}" could not removed of "${String(event)}" event`,
                    error,
                );
            }
        });
    }

    addListenerMany<TEventClass extends EventClass<TEvents>>(
        events: TEventClass[],
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.createLayPromise(async () => {
            if (isArrayEmpty(events)) {
                return;
            }
            const promises: PromiseLike<void>[] = [];
            for (const event of events) {
                promises.push(this.addListener(event, listener));
            }
            await Promise.all(promises);
        });
    }

    removeListenerMany<TEventClass extends EventClass<TEvents>>(
        events: TEventClass[],
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.createLayPromise(async () => {
            if (isArrayEmpty(events)) {
                return;
            }
            const promises: PromiseLike<void>[] = [];
            for (const event of events) {
                promises.push(this.removeListener(event, listener));
            }
            await Promise.all(promises);
        });
    }

    listenOnce<TEventClass extends EventClass<TEvents>>(
        event: TEventClass,
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.createLayPromise(async () => {
            const wrappedListener = async (
                event_: EventInstance<TEventClass>,
            ) => {
                try {
                    await listener(event_);
                } finally {
                    await this.removeListener(event, wrappedListener);
                }
            };
            await this.addListener(event, wrappedListener);
        });
    }

    subscribe<TEventClass extends EventClass<TEvents>>(
        event: TEventClass,
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<Unsubscribe> {
        return this.subscribeMany([event], listener);
    }

    subscribeMany<TEventClass extends EventClass<TEvents>>(
        events: TEventClass[],
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<Unsubscribe> {
        return this.createLayPromise(async () => {
            await this.addListenerMany(events, listener);
            const unsubscribe = () => {
                return this.createLayPromise(async () => {
                    await this.removeListenerMany(events, listener);
                });
            };
            return unsubscribe;
        });
    }

    dispatchMany(events: TEvents[]): LazyPromise<void> {
        return this.createLayPromise(async () => {
            try {
                const promises: PromiseLike<void>[] = [];
                for (const event of events) {
                    promises.push(
                        this.adapter.dispatch(getConstructorName(event), event),
                    );
                }
                await Promise.all(promises);
            } catch (error: unknown) {
                throw new UnableToDispatchEventBusError(
                    `Events of types "${events.map((event) => getConstructorName(event)).join(", ")}" could not be dispatched`,
                    error,
                );
            }
        });
    }

    dispatch(event: TEvents): LazyPromise<void> {
        return this.createLayPromise(async () => {
            try {
                await this.adapter.dispatch(getConstructorName(event), event);
            } catch (error: unknown) {
                throw new UnableToDispatchEventBusError(
                    `Event of type "${String(getConstructorName(event))}" could not be dispatched`,
                    error,
                );
            }
        });
    }
}
