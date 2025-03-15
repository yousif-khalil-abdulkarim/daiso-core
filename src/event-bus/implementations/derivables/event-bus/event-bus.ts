/**
 * @module EventBus
 */

import { LazyPromise } from "@/async/_module-exports.js";
import type {
    EventClass,
    EventInstance,
    EventListener,
    EventListenerFn,
    Unsubscribe,
} from "@/event-bus/contracts/_module-exports.js";
import {
    type IEventBus,
    type IGroupableEventBus,
    type IEventBusAdapter,
    type BaseEvent,
    UnableToDispatchEventBusError,
    UnableToRemoveListenerEventBusError,
    UnableToAddListenerEventBusError,
} from "@/event-bus/contracts/_module-exports.js";

import type {
    AsyncFactoryable,
    IKeyPrefixer,
    OneOrMore,
    Items,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    IFactoryObject,
    Factory,
    AsyncLazy,
    FactoryFn,
} from "@/utilities/_module-exports.js";
import {
    getConstructorName,
    resolveAsyncFactoryable,
    resolveFactory,
    resolveInvokable,
} from "@/utilities/_module-exports.js";
import { ListenerStore } from "@/event-bus/implementations/derivables/event-bus/listener-store.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus"```
 * @group Derivables
 */
export type EventBusSettingsBase = {
    keyPrefixer: IKeyPrefixer;

    /**
     * You can pass a <i>{@link Factory}</i> of <i>{@link LazyPromise}</i> to configure default settings for all <i>{@link LazyPromise}</i> instances used in the <i>EventBus</i> class.
     * @default
     * ```ts
     * import { LazyPromise } from "@daiso-tech/core/async";
     *
     * (invokable) => new LazyPromise(invokable)
     * ```
     */
    lazyPromiseFactory?: Factory<AsyncLazy<any>, LazyPromise<any>>;
};

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus"```
 * @group Derivables
 */
export type EventBusAdapterFactoryable = AsyncFactoryable<
    string,
    IEventBusAdapter
>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus"```
 * @group Derivables
 */
export type EventBusSettings = EventBusSettingsBase & {
    adapter: EventBusAdapterFactoryable;
};

/**
 * <i>EventBus</i> class can be derived from any <i>{@link IEventBusAdapter}</i>.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus"```
 * @group Derivables
 */
export class EventBus<TEvents extends BaseEvent = BaseEvent>
    implements IGroupableEventBus<TEvents>
{
    private readonly adapterFactoryable: EventBusAdapterFactoryable;
    private readonly store = new ListenerStore();
    private readonly adapterPromise: PromiseLike<IEventBusAdapter>;
    private readonly lazyPromiseFactory: FactoryFn<
        AsyncLazy<any>,
        LazyPromise<any>
    >;
    private keyPrefixer: IKeyPrefixer;

    /**
     * @example
     * ```ts
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
     * import { EventBus } from "@daiso-tech/core/event-bus";
     * import { KeyPrefixer } from "@daiso-tech/core/utilities";
     *
     * const eventBus = new EventBus({
     *   keyPrefixer: new KeyPrefixer("event-bus"),
     *   adapter: new MemoryEventBusAdapter()
     * });
     * ```
     *
     * You can pass factory function that will create an adapter for every group.
     * @example
     * ```ts
     * import type { IEventBusAdapter } from "@daiso-tech/core/event-bus/contracts";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
     * import { EventBus } from "@daiso-tech/core/event-bus";
     * import { KeyPrefixer, type FactoryFn } from "@daiso-tech/core/utilities";
     *
     * type Store = Partial<Record<string, IEventBusAdapter>>;
     *
     * function cahceAdapterFactory(store: Store): FactoryFn<string, IEventBusAdapter> {
     *   return (prefix) => {
     *     let adapter = store[prefix];
     *     if (adapter === undefined) {
     *       adapter = new MemoryEventBusAdapter();
     *       store[prefix] = adapter;
     *     }
     *     return adapter;
     *   }
     * }
     *
     * const store: Store = {}
     * const eventBus = new EventBus({
     *   keyPrefixer: new KeyPrefixer("event-bus"),
     *   adapter: cahceAdapterFactory(store)
     * });
     * ```
     *
     * You can also pass factory object that implements <i>{@link IFactoryObject}</i> contract. This useful for depedency injection libraries.
     * @example
     * ```ts
     * import type { IEventBusAdapter } from "@daiso-tech/core/event-bus/contracts";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
     * import { EventBus } from "@daiso-tech/core/event-bus";
     * import { KeyPrefixer, type IFactoryObject, type Promiseable } from "@daiso-tech/core/utilities";
     *
     * type Store = Partial<Record<string, IEventBusAdapter>>;
     *
     * class EventBusAdapterFactory implements IFactoryObject<string, IEventBusAdapter> {
     *   constructor(private readonly store: Store) {}
     *
     *   async use(prefix: string): Promiseable<IEventBusAdapter> {
     *     let adapter = this.store[prefix];
     *     if (adapter === undefined) {
     *       adapter = new MemoryEventBusAdapter();
     *       store[prefix] = adapter;
     *     }
     *     return adapter;
     *   }
     * }
     *
     * const store: Store = {}
     * const eventBus = new EventBus({
     *   keyPrefixer: new KeyPrefixer("event-bus"),
     *   adapter: new EventBusAdapterFactory(store)
     * });
     * ```
     */
    constructor(settings: EventBusSettings) {
        const {
            keyPrefixer,
            adapter,
            lazyPromiseFactory = (invokable) => new LazyPromise(invokable),
        } = settings;
        this.lazyPromiseFactory = resolveFactory(lazyPromiseFactory);
        this.adapterFactoryable = adapter;
        this.keyPrefixer = keyPrefixer;
        this.adapterPromise = new LazyPromise(() =>
            resolveAsyncFactoryable(
                this.adapterFactoryable,
                this.keyPrefixer.keyPrefix,
            ),
        );
    }

    private createLazyPromise<TValue = void>(
        asyncFn: () => PromiseLike<TValue>,
    ): LazyPromise<TValue> {
        return this.lazyPromiseFactory(asyncFn);
    }

    withGroup(group: OneOrMore<string>): IEventBus<TEvents> {
        return new EventBus({
            keyPrefixer: this.keyPrefixer.withGroup(group),
            adapter: this.adapterFactoryable,
            lazyPromiseFactory: this.lazyPromiseFactory,
        });
    }

    getGroup(): string | null {
        return this.keyPrefixer.resolvedGroup;
    }

    addListener<TEventClass extends EventClass<TEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            const eventName = this.keyPrefixer.create(event.name);
            const resolvedListener = this.store.getOrAdd(
                [eventName.prefixed, listener],
                resolveInvokable(listener),
            );
            try {
                const adapter = await this.adapterPromise;
                await adapter.addListener(
                    eventName.prefixed,
                    resolvedListener as EventListenerFn<BaseEvent>,
                );
            } catch (error: unknown) {
                this.store.getAndRemove([eventName.prefixed, listener]);
                throw new UnableToAddListenerEventBusError(
                    `A listener with name of "${resolvedListener.name}" could not added for "${String(event)}" event`,
                    error,
                );
            }
        });
    }

    removeListener<TEventClass extends EventClass<TEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            const eventName = this.keyPrefixer.create(event.name);
            const resolvedListener = this.store.getAndRemove([
                eventName.prefixed,
                listener,
            ]);
            if (resolvedListener === null) {
                return;
            }
            try {
                const adapter = await this.adapterPromise;
                await adapter.removeListener(
                    eventName.prefixed,
                    resolvedListener as EventListenerFn<BaseEvent>,
                );
            } catch (error: unknown) {
                throw new UnableToRemoveListenerEventBusError(
                    `A listener with name of "${resolvedListener.name}" could not removed of "${String(event)}" event`,
                    error,
                );
            }
        });
    }

    addListenerMany<TEventClassArr extends EventClass<TEvents>[]>(
        events: [...TEventClassArr],
        listener: EventListener<EventInstance<Items<TEventClassArr>>>,
    ): LazyPromise<void> {
        return this.createLazyPromise(async () => {
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

    removeListenerMany<TEventClassArr extends EventClass<TEvents>[]>(
        events: [...TEventClassArr],
        listener: EventListener<EventInstance<Items<TEventClassArr>>>,
    ): LazyPromise<void> {
        return this.createLazyPromise(async () => {
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

    listenOnce<TEventClass extends EventClass<TEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            const wrappedListener = async (
                event_: EventInstance<TEventClass>,
            ) => {
                try {
                    const resolvedListener = resolveInvokable(listener);
                    await resolvedListener(event_);
                } finally {
                    await this.removeListener(event, listener);
                }
            };

            const eventName = this.keyPrefixer.create(event.name);
            const resolvedListener = this.store.getOrAdd(
                [eventName.prefixed, listener],
                wrappedListener,
            );
            try {
                const adapter = await this.adapterPromise;
                await adapter.addListener(
                    eventName.prefixed,
                    resolvedListener as EventListenerFn<BaseEvent>,
                );
            } catch (error: unknown) {
                this.store.getAndRemove([eventName.prefixed, listener]);
                throw new UnableToAddListenerEventBusError(
                    `A listener with name of "${resolvedListener.name}" could not added for "${String(event)}" event`,
                    error,
                );
            }
        });
    }

    asPromise<TEventClass extends EventClass<TEvents>>(
        event: TEventClass,
    ): LazyPromise<EventInstance<TEventClass>> {
        return LazyPromise.fromCallback((resolve, reject) => {
            this.listenOnce(event, resolve).then(() => {}, reject);
        });
    }

    subscribeOnce<TEventClass extends EventClass<TEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<Unsubscribe> {
        return this.createLazyPromise(async () => {
            await this.listenOnce(event, listener);
            const unsubscribe = () => {
                return this.createLazyPromise(async () => {
                    await this.removeListener(event, listener);
                });
            };
            return unsubscribe;
        });
    }

    subscribe<TEventClass extends EventClass<TEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<Unsubscribe> {
        return this.subscribeMany([event], listener);
    }

    subscribeMany<TEventClassArr extends EventClass<TEvents>[]>(
        events: [...TEventClassArr],
        listener: EventListener<EventInstance<Items<TEventClassArr>>>,
    ): LazyPromise<Unsubscribe> {
        return this.createLazyPromise(async () => {
            await this.addListenerMany(events, listener);
            const unsubscribe = () => {
                return this.createLazyPromise(async () => {
                    await this.removeListenerMany(events, listener);
                });
            };
            return unsubscribe;
        });
    }

    dispatchMany(events: TEvents[]): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            try {
                const adapter = await this.adapterPromise;
                const promises = events
                    .map((event) => ({
                        eventName: getConstructorName(event),
                        event,
                    }))
                    .map(({ event, eventName }) => ({
                        eventName: this.keyPrefixer.create(eventName),
                        event,
                    }))
                    .map(({ event, eventName }) => ({
                        eventName: eventName.prefixed,
                        event,
                    }))
                    .map(({ eventName, event }) =>
                        adapter.dispatch(eventName, event),
                    );
                await Promise.all(promises);
            } catch (error: unknown) {
                throw new UnableToDispatchEventBusError(
                    `Events of type${events.length === 0 ? "" : "s"} "${events.map((event) => getConstructorName(event)).join(", ")}" could not be dispatched`,
                    error,
                );
            }
        });
    }

    dispatch(event: TEvents): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            await this.dispatchMany([event]);
        });
    }
}
