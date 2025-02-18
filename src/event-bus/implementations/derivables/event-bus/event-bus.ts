/**
 * @module EventBus
 */

import type { BackoffPolicy, RetryPolicy } from "@/async/_module-exports.js";
import { LazyPromise } from "@/async/_module-exports.js";
import type {
    EventClass,
    EventInstance,
    EventListenerFn,
    IEventListenerObject,
    Unsubscribe,
} from "@/event-bus/contracts/_module-exports.js";
import {
    type IEventBus,
    type IGroupableEventBus,
    type IEventBusAdapter,
    type EventListener,
    type BaseEvent,
    UnableToDispatchEventBusError,
    UnableToRemoveListenerEventBusError,
    UnableToAddListenerEventBusError,
} from "@/event-bus/contracts/_module-exports.js";

import type { OneOrMore, TimeSpan } from "@/utilities/_module-exports.js";
import {
    getConstructorName,
    resolveOneOrMoreStr,
} from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/implementations/derivables"```
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
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/implementations/derivables"```
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
    private readonly listenerObjectMap = new Map<
        IEventListenerObject<any>,
        EventListenerFn<any>
    >();

    /**
     * @example
     * ```ts
     * import type { IGroupableEventBus } from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     *
     * const eventBus: IGroupableEventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
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

    /**
     * @example
     * ```ts
     * import type { IGroupableEventBus, IEventBus } from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { BaseEvent } from "@daiso-tech/core/event-bus/contracts";
     *
     * const eventBus: IGroupableEventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     *
     * // Will print "@global"
     * console.log(eventBus.getGroup());
     *
     * const groupedEventBus: IEventBus = eventBus.withGroup("company-1");
     *
     * // Will print "@global/company-1"
     * console.log(groupedEventBus.getGroup());
     * ```
     */
    withGroup(group: OneOrMore<string>): IEventBus<TEvents> {
        return new EventBus({
            adapter: this.adapter.withGroup(resolveOneOrMoreStr(group)),
            retryAttempts: this.retryAttempts,
            backoffPolicy: this.backoffPolicy,
            retryPolicy: this.retryPolicy,
            timeout: this.timeout,
        });
    }

    /**
     * @example
     * ```ts
     * import type { IGroupableEventBus } from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { BaseEvent } from "@daiso-tech/core/event-bus/contracts";
     *
     * const eventBus: IGroupableEventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     *
     * // Will print "@global"
     * console.log(eventBus.getGroup());
     * ```
     */
    getGroup(): string {
        return this.adapter.getGroup();
    }

    private ensureListenerObject<TEvent>(
        listener: IEventListenerObject<TEvent>,
    ): EventListenerFn<TEvent> {
        let listenerFn = this.listenerObjectMap.get(listener);
        if (listenerFn !== undefined) {
            return listenerFn;
        }
        listenerFn = listener.handler.bind(listener);
        this.listenerObjectMap.set(listener, listenerFn);
        return listenerFn;
    }

    private resolveListener<TEvent>(
        listener: EventListener<TEvent>,
    ): EventListenerFn<TEvent> {
        if (typeof listener === "function") {
            return listener;
        }
        return this.ensureListenerObject(listener);
    }

    private deleteListener<TEvent>(listener: EventListener<TEvent>): void {
        if (typeof listener === "function") {
            return;
        }
        this.listenerObjectMap.delete(listener);
    }

    /**
     * @example
     * ```ts
     * import type { IGroupableEventBus } from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { BaseEvent, type Listener } from "@daiso-tech/core/event-bus/contracts";
     *
     * const eventBus: IGroupableEventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     *
     * class AddEvent extends BaseEvent<{ a: number, b: number }> {}
     *
     * const listener: EventListener<AddEvent> = event => {
     *   console.log(event);
     * }
     * await eventBus.addListener(AddEvent, listener);
     * await eventBus.dispatch(new AddEvent({ a: 1, b: 2,}));
     * ```
     */
    addListener<TEventClass extends EventClass<TEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.createLayPromise(async () => {
            const resolvedListener = this.resolveListener(
                listener,
            ) as EventListenerFn<BaseEvent>;
            try {
                await this.adapter.addListener(event.name, resolvedListener);
            } catch (error: unknown) {
                throw new UnableToAddListenerEventBusError(
                    `A listener with name of "${resolvedListener.name}" could not added for "${String(event)}" event`,
                    error,
                );
            }
        });
    }

    /**
     * @example
     * ```ts
     * import type { IGroupableEventBus } from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { BaseEvent, type Listener } from "@daiso-tech/core/event-bus/contracts";
     *
     * const eventBus: IGroupableEventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     *
     * class AddEvent extends BaseEvent<{ a: number, b: number }> {}
     *
     * const listener: EventListener<AddEvent> = event => {
     *   console.log(event);
     * }
     * await eventBus.addListener(AddEvent, listener);
     * await eventBus.dispatch(new AddEvent({ a: 1, b: 2,}));
     * await eventBus.removeListener(AddEvent, listener);
     * ```
     */
    removeListener<TEventClass extends EventClass<TEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.createLayPromise(async () => {
            const resolvedListener = this.resolveListener(
                listener,
            ) as EventListenerFn<BaseEvent>;
            try {
                await this.adapter.removeListener(event.name, resolvedListener);
                this.deleteListener(listener);
            } catch (error: unknown) {
                throw new UnableToRemoveListenerEventBusError(
                    `A listener with name of "${resolvedListener.name}" could not removed of "${String(event)}" event`,
                    error,
                );
            }
        });
    }

    /**
     * @example
     * ```ts
     * import type { IGroupableEventBus } from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { BaseEvent, type Listener } from "@daiso-tech/core/event-bus/contracts";
     *
     * const eventBus: IGroupableEventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     *
     * class AddEvent extends BaseEvent<{ a: number, b: number }> {}
     * class SubEvent extends BaseEvent<{ c: number, d: number }> {}
     *
     * const listener: EventListener<AddEvent | SubEvent> = event => {
     *   console.log(event)
     * }
     * await eventBus.addListenerMany([AddEvent, SubEvent], listener);
     * await eventBus.dispatchMany([
     *   new AddEvent({ a: 1, b: 2 }),
     *   new SubEvent({ c: 1, d: 2 }),
     * ]);
     * ```
     */
    addListenerMany<TEventClass extends EventClass<TEvents>>(
        events: TEventClass[],
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.createLayPromise(async () => {
            if (events.length === 0) {
                return;
            }
            const promises: PromiseLike<void>[] = [];
            for (const event of events) {
                promises.push(this.addListener(event, listener));
            }
            await Promise.all(promises);
        });
    }

    /**
     * @example
     * ```ts
     * import type { IGroupableEventBus } from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { BaseEvent, type Listener } from "@daiso-tech/core/event-bus/contracts";
     *
     * const eventBus: IGroupableEventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     *
     * class AddEvent extends BaseEvent<{ a: number, b: number }> {}
     * class SubEvent extends BaseEvent<{ c: number, d: number }> {}
     *
     * const listener: EventListener<AddEvent | SubEvent> = event => {
     *   console.log(event);
     * }
     * await eventBus.addListenerMany([AddEvent, SubEvent], listener);
     * await eventBus.dispatchMany([
     *   new AddEvent({ a: 1, b: 2 }),
     *   new SubEvent({ c: 1, d: 2 }),
     * ]);
     * await eventBus.removeListenerMany([AddEvent, SubEvent], listener);
     * ```
     */
    removeListenerMany<TEventClass extends EventClass<TEvents>>(
        events: TEventClass[],
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.createLayPromise(async () => {
            if (events.length === 0) {
                return;
            }
            const promises: PromiseLike<void>[] = [];
            for (const event of events) {
                promises.push(this.removeListener(event, listener));
            }
            await Promise.all(promises);
        });
    }

    /**
     * @example
     * ```ts
     * import type { IGroupableEventBus } from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { BaseEvent, type Listener } from "@daiso-tech/core/event-bus/contracts";
     *
     * const eventBus: IGroupableEventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     *
     * class AddEvent extends BaseEvent<{ a: number, b: number }> {}
     *
     * await eventBus.listenOnce(AddEvent, event => {
     *   console.log(event);
     * });
     *
     * await eventBus.dispatch(new AddEvent({ a: 1, b: 2,}));
     * ```
     */
    listenOnce<TEventClass extends EventClass<TEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.createLayPromise(async () => {
            const wrappedListener = async (
                event_: EventInstance<TEventClass>,
            ) => {
                try {
                    const resolvedListener = this.resolveListener(listener);
                    await resolvedListener(event_);
                } finally {
                    await this.removeListener(event, wrappedListener);
                }
            };
            await this.addListener(event, wrappedListener);
        });
    }

    /**
     * @example
     * ```ts
     * import type { IGroupableEventBus } from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { BaseEvent, type Listener } from "@daiso-tech/core/event-bus/contracts";
     *
     * const eventBus: IGroupableEventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     *
     * class AddEvent extends BaseEvent<{ a: number, b: number }> {}
     *
     * eventBus.asPromise(AddEvent).then(event => {
     *   console.log(event);
     * });
     *
     * await eventBus.dispatch(new AddEvent({ a: 1, b: 2,}));
     * ```
     */
    asPromise<TEventClass extends EventClass<TEvents>>(
        event: TEventClass,
    ): LazyPromise<EventInstance<TEventClass>> {
        return new LazyPromise(
            () =>
                new Promise<EventInstance<TEventClass>>((resolve, reject) => {
                    this.listenOnce(event, resolve).then(
                        (event) => event,
                        // eslint-disable-next-line @typescript-eslint/use-unknown-in-catch-callback-variable
                        reject,
                    );
                }),
        );
    }

    /**
     * @example
     * ```ts
     * import type { IGroupableEventBus } from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { BaseEvent } from "@daiso-tech/core/event-bus/contracts";
     *
     * const eventBus: IGroupableEventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     *
     * class AddEvent extends BaseEvent<{ a: number, b: number }> {}
     *
     * const unsubscribe = await eventBus.subscribe(AddEvent, event => {
     *   console.log(event);
     * });
     * await eventBus.dispatch(new AddEvent({ a: 1, b: 2,}));
     * await unsubscribe();
     * ```
     */
    subscribe<TEventClass extends EventClass<TEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<Unsubscribe> {
        return this.subscribeMany([event], listener);
    }

    /**
     * @example
     * ```ts
     * import type { IGroupableEventBus } from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { BaseEvent } from "@daiso-tech/core/event-bus/contracts";
     *
     * const eventBus: IGroupableEventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     *
     * class AddEvent extends BaseEvent<{ a: number, b: number }> {}
     * class SubEvent extends BaseEvent<{ c: number, d: number }> {}
     *
     * const unsubscribe = await eventBus.subscribeMany([AddEvent, SubEvent], event => {
     *   console.log(event);
     * });
     * await eventBus.dispatchMany([
     *   new AddEvent({ a: 1, b: 2 }),
     *   new SubEvent({ c: 1, d: 2 }),
     * ]);
     * await unsubscribe();
     * ```
     */
    subscribeMany<TEventClass extends EventClass<TEvents>>(
        events: TEventClass[],
        listener: EventListener<EventInstance<TEventClass>>,
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

    /**
     * @example
     * ```ts
     * import type { IGroupableEventBus } from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { BaseEvent } from "@daiso-tech/core/event-bus/contracts";
     *
     * const eventBus: IGroupableEventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     *
     * class AddEvent extends BaseEvent<{ a: number, b: number }> {}
     * class SubEvent extends BaseEvent<{ c: number, d: number }> {}
     *
     * await eventBus.dispatchMany([
     *   new AddEvent({ a: 1, b: 2 }),
     *   new SubEvent({ c: 1, d: 2 }),
     * ]);
     * ```
     */
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

    /**
     * @example
     * ```ts
     * import type { IGroupableEventBus } from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { BaseEvent } from "@daiso-tech/core/event-bus/contracts";
     *
     * const eventBus: IGroupableEventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     *
     * class AddEvent extends BaseEvent<{ a: number, b: number }> {}
     *
     * await eventBus.dispatch(new AddEvent({ a: 1, b: 2,}));
     * ```
     */
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
