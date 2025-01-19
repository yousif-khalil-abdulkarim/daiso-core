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
    type INamespacedEventBus,
    type IEventBusAdapter,
    type Listener,
    type IBaseEvent,
    DispatchEventBusError,
    RemoveListenerEventBusError,
    AddListenerEventBusError,
    UnexpectedEventBusError,
} from "@/event-bus/contracts/_module";

import type { OneOrMore } from "@/utilities/_module";
import { simplifyNamespace, isArrayEmpty } from "@/utilities/_module";

/**
 * @group Derivables
 */
export type EventBusSettings = {
    /**
     * You can prefix all keys with a given <i>namespace</i>.
     * This useful if you want to add multitenancy but still use the same database.
     * @default {""}
     * @example
     * ```ts
     * import { EventBus, MemoryEventBusAdapter } from "@daiso-tech/core";
     *
     * const memoryEventBusAdapter = new MemoryEventBusAdapter();
     * const eventBusA = new EventBus(memoryEventBusAdapter, {
     *   rootNamespace: "@a"
     * });
     * const eventBusB = new EventBus(memoryEventBusAdapter, {
     *   rootNamespace: "@b"
     * });
     *
     * (async () => {
     *   eventBusB.addListener("add", event => {
     *     // This will never be logged because eventBusB has different namespace
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
    rootNamespace?: OneOrMore<string>;

    lazyPromiseSettings?: LazyPromiseSettings;
};

/**
 * <i>EventBus</i> class can be derived from any <i>{@link IEventBusAdapter}</i>.
 * @group Derivables
 */
export class EventBus<TEvents extends BaseEvents = BaseEvents>
    implements INamespacedEventBus<TEvents>
{
    private readonly eventBusAdapter: IEventBusAdapter;
    private readonly namespace: string;
    private readonly lazyPromiseSettings?: LazyPromiseSettings;
    private readonly listenerMap = new Map<
        Listener<IBaseEvent>,
        Listener<IBaseEvent>
    >();

    constructor(
        eventBusAdapter: IEventBusAdapter,
        settings: EventBusSettings = {},
    ) {
        const { rootNamespace: namespace = "", lazyPromiseSettings } = settings;
        this.lazyPromiseSettings = lazyPromiseSettings;
        this.namespace = simplifyNamespace(namespace);
        this.eventBusAdapter = eventBusAdapter;
    }

    private createLayPromise<TValue = void>(
        asyncFn: () => PromiseLike<TValue>,
    ): LazyPromise<TValue> {
        return new LazyPromise(asyncFn, this.lazyPromiseSettings);
    }

    private keyWithNamespace(key: string): string {
        return simplifyNamespace([this.namespace, key]);
    }

    withNamespace(namespace: OneOrMore<string>): IEventBus<TEvents> {
        namespace = simplifyNamespace(namespace);
        return new EventBus(this.eventBusAdapter, {
            rootNamespace: [this.namespace, namespace],
        });
    }

    getNamespace(): string {
        return this.namespace;
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
                    type: eventObj.type.slice(this.namespace.length + 1),
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
                    this.keyWithNamespace(eventName),
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
                    this.keyWithNamespace(eventName),
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
                            type: this.keyWithNamespace(event.type),
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
