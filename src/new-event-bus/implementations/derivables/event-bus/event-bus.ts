/**
 * @module EventBus
 */

import { LazyPromise } from "@/async/_module-exports.js";
import type {
    BaseEvent,
    BaseEventMap,
    EventListener,
    EventListenerFn,
    Unsubscribe,
} from "@/new-event-bus/contracts/_module-exports.js";
import {
    type IEventBus,
    type IEventBusAdapter,
    UnableToDispatchEventBusError,
    UnableToRemoveListenerEventBusError,
    UnableToAddListenerEventBusError,
} from "@/new-event-bus/contracts/_module-exports.js";

import type {
    KeyPrefixer,
    Factory,
    AsyncLazy,
    FactoryFn,
} from "@/utilities/_module-exports.js";
import {
    resolveFactory,
    resolveInvokable,
} from "@/utilities/_module-exports.js";
import { ListenerStore } from "@/new-event-bus/implementations/derivables/event-bus/listener-store.js";

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
export class EventBus<TEventMap extends BaseEventMap>
    implements IEventBus<TEventMap>
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

    addListener<TEventName extends keyof TEventMap>(
        eventName: TEventName,
        listener: EventListener<TEventMap[TEventName]>,
    ): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            const key = this.keyPrefixer.create(String(eventName));
            const resolvedListener = this.store.getOrAdd(
                [key.prefixed, listener],
                resolveInvokable(listener),
            );
            try {
                await this.adapter.addListener(
                    key.prefixed,
                    resolvedListener as EventListenerFn<BaseEvent>,
                );
            } catch (error: unknown) {
                this.store.getAndRemove([key.prefixed, listener]);
                throw new UnableToAddListenerEventBusError(
                    `A listener with name of "${String(eventName)}" could not added for "${String(eventName)}" event`,
                    error,
                );
            }
        });
    }

    removeListener<TEventName extends keyof TEventMap>(
        eventName: TEventName,
        listener: EventListener<TEventMap[TEventName]>,
    ): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            const key = this.keyPrefixer.create(String(eventName));
            const resolvedListener = this.store.getAndRemove([
                key.prefixed,
                listener,
            ]);
            if (resolvedListener === null) {
                return;
            }
            try {
                await this.adapter.removeListener(
                    key.prefixed,
                    resolvedListener as EventListenerFn<BaseEvent>,
                );
            } catch (error: unknown) {
                throw new UnableToRemoveListenerEventBusError(
                    `A listener with name of "${String(eventName)}" could not removed of "${String(eventName)}" event`,
                    error,
                );
            }
        });
    }

    listenOnce<TEventName extends keyof TEventMap>(
        eventName: TEventName,
        listener: EventListener<TEventMap[TEventName]>,
    ): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            const wrappedListener = async (event_: TEventMap[TEventName]) => {
                try {
                    const resolvedListener = resolveInvokable(listener);
                    await resolvedListener(event_);
                } finally {
                    await this.removeListener(eventName, listener);
                }
            };

            const key = this.keyPrefixer.create(String(eventName));
            const resolvedListener = this.store.getOrAdd(
                [key.prefixed, listener],
                wrappedListener,
            );
            try {
                await this.adapter.addListener(
                    key.prefixed,
                    resolvedListener as EventListenerFn<BaseEvent>,
                );
            } catch (error: unknown) {
                this.store.getAndRemove([key.prefixed, listener]);
                throw new UnableToAddListenerEventBusError(
                    `A listener with name of "${String(eventName)}" could not added for "${String(eventName)}" event`,
                    error,
                );
            }
        });
    }

    asPromise<TEventName extends keyof TEventMap>(
        eventName: TEventName,
    ): LazyPromise<TEventMap[TEventName]> {
        return LazyPromise.fromCallback((resolve, reject) => {
            this.listenOnce(eventName, resolve).then(() => {}, reject);
        });
    }

    subscribeOnce<TEventName extends keyof TEventMap>(
        eventName: TEventName,
        listener: EventListener<TEventMap[TEventName]>,
    ): LazyPromise<Unsubscribe> {
        return this.createLazyPromise(async () => {
            await this.listenOnce(eventName, listener);
            const unsubscribe = () => {
                return this.createLazyPromise(async () => {
                    await this.removeListener(eventName, listener);
                });
            };
            return unsubscribe;
        });
    }

    subscribe<TEventName extends keyof TEventMap>(
        eventName: TEventName,
        listener: EventListener<TEventMap[TEventName]>,
    ): LazyPromise<Unsubscribe> {
        return this.createLazyPromise(async () => {
            await this.addListener(eventName, listener);
            const unsubscribe = () => {
                return this.createLazyPromise(async () => {
                    await this.removeListener(eventName, listener);
                });
            };
            return unsubscribe;
        });
    }

    dispatch<TEventName extends keyof TEventMap>(
        eventName: TEventName,
        event: TEventMap[TEventName],
    ): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            try {
                await this.adapter.dispatch(
                    this.keyPrefixer.create(String(eventName)).prefixed,
                    event,
                );
            } catch (error: unknown) {
                throw new UnableToDispatchEventBusError(
                    `Events of type "${String(eventName)}" could not be dispatched`,
                    error,
                );
            }
        });
    }
}
