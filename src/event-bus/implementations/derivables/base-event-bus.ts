/**
 * @module EventBus
 */

import { LazyPromise } from "@/utilities/_module";
import type { SelectEvent, Unsubscribe } from "@/event-bus/contracts/_module";
import {
    type IEventBus,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type IEventBusAdapter,
    type INamespacedEventBus,
    type Listener,
    type IBaseEvent,
} from "@/event-bus/contracts/_module";

import type { OneOrMore } from "@/_shared/types";
import { isArrayEmpty } from "@/_shared/utilities";

/**
 * The BaseEventBus class serves as an abstract base class that provides implementations for redundant methods.
 * It simplifies implementing the {@link INamespacedEventBus} interface without using an {@link IEventBusAdapter}.
 * @group Derivables
 */
export abstract class BaseEventBus<TEvents extends IBaseEvent>
    implements INamespacedEventBus<TEvents>
{
    abstract withNamespace(namespace: OneOrMore<string>): IEventBus<TEvents>;

    abstract getNamespace(): string;

    abstract addListener<TEventType extends TEvents["type"]>(
        event: TEventType,
        listener: Listener<SelectEvent<TEvents, TEventType>>,
    ): LazyPromise<void>;

    addListenerMany<TEventType extends TEvents["type"]>(
        events: TEventType[],
        listener: Listener<SelectEvent<TEvents, TEventType>>,
    ): LazyPromise<void> {
        return new LazyPromise(async () => {
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

    abstract removeListener<TEventType extends TEvents["type"]>(
        event: TEventType,
        listener: Listener<SelectEvent<TEvents, TEventType>>,
    ): LazyPromise<void>;

    removeListenerMany<TEventType extends TEvents["type"]>(
        events: TEventType[],
        listener: Listener<SelectEvent<TEvents, TEventType>>,
    ): LazyPromise<void> {
        return new LazyPromise(async () => {
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

    subscribe<TEventType extends TEvents["type"]>(
        event: TEventType,
        listener: Listener<SelectEvent<TEvents, TEventType>>,
    ): LazyPromise<Unsubscribe> {
        return this.subscribeMany([event], listener);
    }

    subscribeMany<TEventType extends TEvents["type"]>(
        events: TEventType[],
        listener: Listener<SelectEvent<TEvents, TEventType>>,
    ): LazyPromise<Unsubscribe> {
        return new LazyPromise(async () => {
            await this.addListenerMany(events, listener);
            const unsubscribe = () => {
                return new LazyPromise(async () => {
                    await this.removeListenerMany(events, listener);
                });
            };
            return unsubscribe;
        });
    }

    abstract dispatch(events: OneOrMore<TEvents>): LazyPromise<void>;
}
