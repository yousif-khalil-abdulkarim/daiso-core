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
    type IEventBusAdapter,
    type BaseEvent,
    UnableToDispatchEventBusError,
    UnableToRemoveListenerEventBusError,
    UnableToAddListenerEventBusError,
} from "@/event-bus/contracts/_module-exports.js";

import type {
    KeyPrefixer,
    Factory,
    AsyncLazy,
    FactoryFn,
} from "@/utilities/_module-exports.js";
import {
    getConstructorName,
    resolveFactory,
    resolveInvokable,
} from "@/utilities/_module-exports.js";
import { ListenerStore } from "@/event-bus/implementations/derivables/event-bus/listener-store.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/event-bus"`
 * @group Derivables
 */
export type EventBusSettingsBase = {
    keyPrefixer: KeyPrefixer;

    /**
     * You can pass a {@link Factory | `Factory`} of {@link LazyPromise| `LazyPromise`} to configure default settings for all {@link LazyPromise| `LazyPromise`} instances used in the `EventBus` class.
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
 * IMPORT_PATH: `"@daiso-tech/core/event-bus"`
 * @group Derivables
 */
export type EventBusSettings = EventBusSettingsBase & {
    adapter: IEventBusAdapter;
};

/**
 * `EventBus` class can be derived from any {@link IEventBusAdapter | `IEventBusAdapter`}.
 *
 * IMPORT_PATH: `"@daiso-tech/core/event-bus"`
 * @group Derivables
 */
export class EventBus<TEvents extends BaseEvent = BaseEvent>
    implements IEventBus<TEvents>
{
    private readonly store = new ListenerStore();
    private readonly adapter: IEventBusAdapter;
    private readonly lazyPromiseFactory: FactoryFn<
        AsyncLazy<any>,
        LazyPromise<any>
    >;
    private keyPrefixer: KeyPrefixer;

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
     */
    constructor(settings: EventBusSettings) {
        const {
            keyPrefixer,
            adapter,
            lazyPromiseFactory = (invokable) => new LazyPromise(invokable),
        } = settings;
        this.lazyPromiseFactory = resolveFactory(lazyPromiseFactory);
        this.adapter = adapter;
        this.keyPrefixer = keyPrefixer;
    }

    private createLazyPromise<TValue = void>(
        asyncFn: () => PromiseLike<TValue>,
    ): LazyPromise<TValue> {
        return this.lazyPromiseFactory(asyncFn);
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
                await this.adapter.addListener(
                    eventName.prefixed,
                    resolvedListener as EventListenerFn<BaseEvent>,
                );
            } catch (error: unknown) {
                this.store.getAndRemove([eventName.prefixed, listener]);
                throw new UnableToAddListenerEventBusError(
                    `A listener with name of "${event.name}" could not added for "${String(event)}" event`,
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
                await this.adapter.removeListener(
                    eventName.prefixed,
                    resolvedListener as EventListenerFn<BaseEvent>,
                );
            } catch (error: unknown) {
                throw new UnableToRemoveListenerEventBusError(
                    `A listener with name of "${event.name}" could not removed of "${String(event)}" event`,
                    error,
                );
            }
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
                await this.adapter.addListener(
                    eventName.prefixed,
                    resolvedListener as EventListenerFn<BaseEvent>,
                );
            } catch (error: unknown) {
                this.store.getAndRemove([eventName.prefixed, listener]);
                throw new UnableToAddListenerEventBusError(
                    `A listener with name of "${event.name}" could not added for "${String(event)}" event`,
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
        return this.createLazyPromise(async () => {
            await this.addListener(event, listener);
            const unsubscribe = () => {
                return this.createLazyPromise(async () => {
                    await this.removeListener(event, listener);
                });
            };
            return unsubscribe;
        });
    }

    dispatch(event: TEvents): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            try {
                await this.adapter.dispatch(
                    this.keyPrefixer.create(getConstructorName(event)).prefixed,
                    event,
                );
            } catch (error: unknown) {
                throw new UnableToDispatchEventBusError(
                    `Events of type "${getConstructorName(event)}" could not be dispatched`,
                    error,
                );
            }
        });
    }
}
