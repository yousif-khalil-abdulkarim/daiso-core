/**
 * @module EventBus
 */

import type { LazyPromiseSettings } from "@/async/_module";
import { LazyPromise } from "@/async/_module";
import type {
    SelectEvent,
    AllEvents,
    BaseEvents,
    Unsubscribe,
} from "@/event-bus/contracts/_module";
import {
    type IEventBus,
    type IGroupableEventBus,
    type IEventBusAdapter,
    type Listener,
    type IBaseEvent,
    DispatchEventBusError,
    RemoveListenerEventBusError,
    AddListenerEventBusError,
    UnexpectedEventBusError,
} from "@/event-bus/contracts/_module";

import type { OneOrMore } from "@/utilities/_module";
import { isArrayEmpty } from "@/utilities/_module";

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
export class EventBus<TEvents extends BaseEvents = BaseEvents>
    implements IGroupableEventBus<TEvents>
{
    private readonly eventBusAdapter: IEventBusAdapter;
    private readonly lazyPromiseSettings?: LazyPromiseSettings;
    private readonly listenerMap = new Map<
        Listener<IBaseEvent>,
        Listener<IBaseEvent>
    >();

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

    addListener<TEventName extends keyof TEvents>(
        eventName: TEventName,
        listener: Listener<SelectEvent<TEvents, TEventName>>,
    ): LazyPromise<void> {
        return this.createLayPromise(async () => {
            try {
                if (typeof eventName !== "string") {
                    throw new UnexpectedEventBusError(
                        `The event name "${String(eventName)}" must be of string name`,
                    );
                }
                await this.eventBusAdapter.addListener(
                    eventName,
                    listener as Listener<IBaseEvent>,
                );
            } catch (error: unknown) {
                throw new AddListenerEventBusError(
                    `A listener with name of "${listener.name}" could not added for "${String(eventName)}" event`,
                    error,
                );
            }
        });
    }

    removeListener<TEventName extends keyof TEvents>(
        eventName: TEventName,
        listener: Listener<SelectEvent<TEvents, TEventName>>,
    ): LazyPromise<void> {
        return this.createLayPromise(async () => {
            if (typeof eventName !== "string") {
                throw new UnexpectedEventBusError(
                    `The event name "${String(eventName)}" must be of string name`,
                );
            }
            try {
                await this.eventBusAdapter.removeListener(
                    eventName,
                    listener as Listener<IBaseEvent>,
                );
            } catch (error: unknown) {
                throw new RemoveListenerEventBusError(
                    `A listener with name of "${listener.name}" could not removed of "${String(eventName)}" event`,
                    error,
                );
            }
        });
    }

    dispatch(events: OneOrMore<AllEvents<TEvents>>): LazyPromise<void> {
        return this.createLayPromise(async () => {
            if (!Array.isArray(events)) {
                events = [events];
            }
            if (isArrayEmpty(events)) {
                return;
            }
            try {
                const promises: PromiseLike<void>[] = [];
                for (const event of events) {
                    promises.push(
                        this.eventBusAdapter.dispatch(event as IBaseEvent),
                    );
                }
                await Promise.all(promises);
            } catch (error: unknown) {
                throw new DispatchEventBusError(
                    `Events of types "${events.map((event) => event.type).join(", ")}" could not be dispatched`,
                    error,
                );
            }
        });
    }

    addListenerMany<TEventName extends keyof TEvents>(
        eventNames: TEventName[],
        listener: Listener<SelectEvent<TEvents, TEventName>>,
    ): LazyPromise<void> {
        return this.createLayPromise(async () => {
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

    removeListenerMany<TEventName extends keyof TEvents>(
        eventNames: TEventName[],
        listener: Listener<SelectEvent<TEvents, TEventName>>,
    ): LazyPromise<void> {
        return this.createLayPromise(async () => {
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
        return this.createLayPromise(async () => {
            await this.addListenerMany(eventNames, listener);
            const unsubscribe = () => {
                return this.createLayPromise(async () => {
                    await this.removeListenerMany(eventNames, listener);
                });
            };
            return unsubscribe;
        });
    }
}
