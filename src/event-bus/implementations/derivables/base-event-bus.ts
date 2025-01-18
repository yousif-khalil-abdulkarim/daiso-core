/**
 * @module EventBus
 */

import { LazyPromise } from "@/async/_module";
import type {
    SelectEvent,
    BaseEvents,
    Unsubscribe,
    AllEvents,
} from "@/event-bus/contracts/_module";
import {
    type IEventBus,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type IEventBusAdapter,
    type INamespacedEventBus,
    type Listener,
} from "@/event-bus/contracts/_module";

import type { OneOrMore } from "@/utilities/_module";
import { isArrayEmpty } from "@/utilities/_module";

/**
 * The BaseEventBus class serves as an abstract base class that provides implementations for redundant methods.
 * It simplifies implementing the {@link INamespacedEventBus} interface without using an {@link IEventBusAdapter}.
 * @group Derivables
 */
export abstract class BaseEventBus<TEvents extends BaseEvents = BaseEvents>
    implements INamespacedEventBus<TEvents>
{
    abstract withNamespace(namespace: OneOrMore<string>): IEventBus<TEvents>;

    abstract getNamespace(): string;

    abstract addListener<TEventName extends keyof TEvents>(
        eventName: TEventName,
        listener: Listener<SelectEvent<TEvents, TEventName>>,
    ): LazyPromise<void>;

    addListenerMany<TEventName extends keyof TEvents>(
        eventNames: TEventName[],
        listener: Listener<SelectEvent<TEvents, TEventName>>,
    ): LazyPromise<void> {
        return new LazyPromise(async () => {
            if (isArrayEmpty(eventNames)) {
                return;
            }
            const promises: PromiseLike<void>[] = [];
            for (const event of eventNames) {
                promises.push(this.addListener(event, listener));
            }
            await Promise.all(promises);
        });
    }

    abstract removeListener<TEventName extends keyof TEvents>(
        eventName: TEventName,
        listener: Listener<SelectEvent<TEvents, TEventName>>,
    ): LazyPromise<void>;

    removeListenerMany<TEventName extends keyof TEvents>(
        eventNames: TEventName[],
        listener: Listener<SelectEvent<TEvents, TEventName>>,
    ): LazyPromise<void> {
        return new LazyPromise(async () => {
            if (isArrayEmpty(eventNames)) {
                return;
            }
            const promises: PromiseLike<void>[] = [];
            for (const event of eventNames) {
                promises.push(this.removeListener(event, listener));
            }
            await Promise.all(promises);
        });
    }

    subscribe<TEventName extends keyof TEvents>(
        eventName: TEventName,
        listener: Listener<SelectEvent<TEvents, TEventName>>,
    ): LazyPromise<Unsubscribe> {
        return this.subscribeMany([eventName], listener);
    }

    subscribeMany<TEventName extends keyof TEvents>(
        eventNames: TEventName[],
        listener: Listener<SelectEvent<TEvents, TEventName>>,
    ): LazyPromise<Unsubscribe> {
        return new LazyPromise(async () => {
            await this.addListenerMany(eventNames, listener);
            const unsubscribe = () => {
                return new LazyPromise(async () => {
                    await this.removeListenerMany(eventNames, listener);
                });
            };
            return unsubscribe;
        });
    }

    abstract dispatch(events: OneOrMore<AllEvents<TEvents>>): LazyPromise<void>;
}
