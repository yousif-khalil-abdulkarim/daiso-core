/**
 * @module EventBus
 */

import type { BackoffPolicy, RetryPolicy } from "@/async/_module";
import { LazyPromise } from "@/async/_module";
import type {
    EventClass,
    EventInstance,
    Unsubscribe,
} from "@/event-bus/contracts/_module";
import {
    type IEventBus,
    type IGroupableEventBus,
    type IEventBusAdapter,
    type Listener,
    type BaseEvent,
    DispatchEventBusError,
    RemoveListenerEventBusError,
    AddListenerEventBusError,
    UnexpectedEventBusError,
    EventBusError,
} from "@/event-bus/contracts/_module";

import type { OneOrMore, TimeSpan } from "@/utilities/_module";
import { getConstructorName, isArrayEmpty } from "@/utilities/_module";
import type { EventBusSettings } from "@/event-bus/implementations/derivables/event-bus-settings";
import { EventBusSettingsBuilder } from "@/event-bus/implementations/derivables/event-bus-settings";
import type { IFlexibleSerde } from "@/serde/contracts/_module";

/**
 * <i>EventBus</i> class can be derived from any <i>{@link IEventBusAdapter}</i>.
 * @group Derivables
 */
export class EventBus<TEvents extends BaseEvent = BaseEvent>
    implements IGroupableEventBus<TEvents>
{
    static readonly errors = {
        Error: EventBusError,
        Unexpected: UnexpectedEventBusError,
        RemoveListener: RemoveListenerEventBusError,
        AddListener: AddListenerEventBusError,
    } as const;

    /**
     * @example
     * ```ts
     * import { EventBus, MemoryEventBusAdapter } from "@daiso-tech/core";
     *
     * const cache = new EventBus(
     *   EventBus
     *     .settings()
     *     .setAdapter(new MemoryEventBusAdapter({ rootGroup: "@global" }))
     *     .build()
     * );
     * ```
     */
    static settings<
        TSettings extends Partial<EventBusSettings>,
    >(): EventBusSettingsBuilder<TSettings> {
        return new EventBusSettingsBuilder();
    }

    private readonly serde: OneOrMore<IFlexibleSerde>;
    private readonly adapter: IEventBusAdapter;
    private readonly retryAttempts: number | null;
    private readonly backoffPolicy: BackoffPolicy | null;
    private readonly retryPolicy: RetryPolicy | null;
    private readonly timeout: TimeSpan | null;

    constructor(settings: EventBusSettings) {
        const {
            serde,
            adapter,
            retryAttempts = null,
            backoffPolicy = null,
            retryPolicy = null,
            timeout = null,
        } = settings;
        this.serde = serde;
        this.retryAttempts = retryAttempts;
        this.backoffPolicy = backoffPolicy;
        this.retryPolicy = retryPolicy;
        this.timeout = timeout;
        this.adapter = adapter;
        this.registerErrors();
    }

    /**
     * Registers all event bus related error within the given <i>IFlexibleSerde</i> contract.
     */
    private registerErrors(): void {
        let array = this.serde;
        if (!Array.isArray(array)) {
            array = [array];
        }
        for (const serde of array) {
            serde
                .registerClass(EventBusError)
                .registerClass(UnexpectedEventBusError)
                .registerClass(RemoveListenerEventBusError)
                .registerClass(AddListenerEventBusError);
        }
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
            serde: this.serde,
            adapter: this.adapter.withGroup(group),
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
                throw new AddListenerEventBusError(
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
                throw new RemoveListenerEventBusError(
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
                throw new DispatchEventBusError(
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
                throw new DispatchEventBusError(
                    `Event of type "${String(getConstructorName(event))}" could not be dispatched`,
                    error,
                );
            }
        });
    }
}
