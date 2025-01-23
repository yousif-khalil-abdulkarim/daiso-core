/**
 * @module EventBus
 */

import type { LazyPromiseSettings } from "@/async/_module";
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
} from "@/event-bus/contracts/_module";

import type { OneOrMore } from "@/utilities/_module";
import { getConstructorName, isArrayEmpty } from "@/utilities/_module";

/**
 * @group Derivables
 */
export type EventBusSettings = {
    lazyPromiseSettings?: LazyPromiseSettings;
};

/**
 * <i>EventBus</i> class can be derived from any <i>{@link IEventBusAdapter}</i>.
 * @group Derivables
 */
export class EventBus<TEvents extends BaseEvent = BaseEvent>
    implements IGroupableEventBus<TEvents>
{
    private readonly eventBusAdapter: IEventBusAdapter;
    private readonly lazyPromiseSettings?: LazyPromiseSettings;

    constructor(
        eventBusAdapter: IEventBusAdapter,
        settings: EventBusSettings = {},
    ) {
        const { lazyPromiseSettings } = settings;
        this.lazyPromiseSettings = lazyPromiseSettings;
        this.eventBusAdapter = eventBusAdapter;
    }

    private createLayPromise<TValue = void>(
        asyncFn: () => PromiseLike<TValue>,
    ): LazyPromise<TValue> {
        return new LazyPromise(asyncFn, this.lazyPromiseSettings);
    }

    withGroup(group: OneOrMore<string>): IEventBus<TEvents> {
        return new EventBus(this.eventBusAdapter.withGroup(group), {
            lazyPromiseSettings: this.lazyPromiseSettings,
        });
    }

    getGroup(): string {
        return this.eventBusAdapter.getGroup();
    }

    addListener<TEventClass extends EventClass<TEvents>>(
        event: TEventClass,
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.createLayPromise(async () => {
            try {
                await this.eventBusAdapter.addListener(
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
                await this.eventBusAdapter.removeListener(
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
                        this.eventBusAdapter.dispatch(
                            getConstructorName(event),
                            event,
                        ),
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
                await this.eventBusAdapter.dispatch(
                    getConstructorName(event),
                    event,
                );
            } catch (error: unknown) {
                throw new DispatchEventBusError(
                    `Event of type "${String(getConstructorName(event))}" could not be dispatched`,
                    error,
                );
            }
        });
    }
}
