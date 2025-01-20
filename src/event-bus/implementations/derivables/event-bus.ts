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
import { simplifyGroupName, isArrayEmpty } from "@/utilities/_module";

/**
 * @group Derivables
 */
export type EventBusSettings = {
    /**
     * You can prefix all keys with a given <i>group</i>.
     * This useful if you want to add multitenancy but still use the same database.
     * @default {""}
     * @example
     * ```ts
     * import { EventBus, MemoryEventBusAdapter } from "@daiso-tech/core";
     *
     * const memoryEventBusAdapter = new MemoryEventBusAdapter();
     * const eventBusA = new EventBus(memoryEventBusAdapter, {
     *   rootGroup: "@a"
     * });
     * const eventBusB = new EventBus(memoryEventBusAdapter, {
     *   rootGroup: "@b"
     * });
     *
     * (async () => {
     *   eventBusB.addListener("add", event => {
     *     // This will never be logged because eventBusB has different group
     *     console.log("eventBusB:", event);
     *   });
     *
     *   eventBusB.addListener("add", event => {
     *     // This will be logged
     *     console.log("eventBusB:", event);
     *   });
     *
     *   await eventBusA.dispatch([
     *     { type: "add", a: 1, b: 2 }
     *   ]);
     * })();
     * ```
     */
    rootGroup?: OneOrMore<string>;

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
    private readonly group: string;
    private readonly lazyPromiseSettings?: LazyPromiseSettings;
    private readonly listenerMap = new Map<
        Listener<IBaseEvent>,
        Listener<IBaseEvent>
    >();

    constructor(
        eventBusAdapter: IEventBusAdapter,
        settings: EventBusSettings = {},
    ) {
        const { rootGroup: group = "", lazyPromiseSettings } = settings;
        this.lazyPromiseSettings = lazyPromiseSettings;
        this.group = simplifyGroupName(group);
        this.eventBusAdapter = eventBusAdapter;
    }

    private createLayPromise<TValue = void>(
        asyncFn: () => PromiseLike<TValue>,
    ): LazyPromise<TValue> {
        return new LazyPromise(asyncFn, this.lazyPromiseSettings);
    }

    private keyWithGroup(key: string): string {
        return simplifyGroupName([this.group, key]);
    }

    withGroup(group: OneOrMore<string>): IEventBus<TEvents> {
        group = simplifyGroupName(group);
        return new EventBus(this.eventBusAdapter, {
            rootGroup: [this.group, group],
        });
    }

    getGroup(): string {
        return this.group;
    }

    private _getListener(
        listener: Listener<IBaseEvent>,
    ): Listener<IBaseEvent> | null {
        return this.listenerMap.get(listener) ?? null;
    }

    private _getOrAddListener(
        listener: Listener<IBaseEvent>,
    ): Listener<IBaseEvent> {
        let wrappedListener = this._getListener(listener);
        if (wrappedListener === null) {
            wrappedListener = async (eventObj: IBaseEvent) => {
                await listener({
                    ...eventObj,
                    type: eventObj.type.slice(this.group.length + 1),
                });
            };
            this.listenerMap.set(listener, wrappedListener);
        }
        return wrappedListener;
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
                    this.keyWithGroup(eventName),
                    this._getOrAddListener(listener as Listener<IBaseEvent>),
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
                const wrappedListener = this._getListener(
                    listener as Listener<IBaseEvent>,
                );
                if (wrappedListener === null) {
                    return;
                }
                await this.eventBusAdapter.removeListener(
                    this.keyWithGroup(eventName),
                    wrappedListener,
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
                await this.eventBusAdapter.dispatch(
                    events.map((event) => {
                        if (typeof event.type !== "string") {
                            throw new UnexpectedEventBusError(
                                `The event name "${String(event.type)}" must be of string name`,
                            );
                        }
                        return {
                            ...event,
                            type: this.keyWithGroup(event.type),
                        };
                    }),
                );
            } catch (error: unknown) {
                throw new DispatchEventBusError(
                    `Events "${events.map((event) => event.type).join(", ")}" could not be dispatched`,
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
