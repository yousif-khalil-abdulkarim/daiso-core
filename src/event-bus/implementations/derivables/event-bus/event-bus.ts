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
} from "@/event-bus/contracts/_module-exports.js";
import {
    type IEventBus,
    type IEventBusAdapter,
    UnableToDispatchEventBusError,
    UnableToRemoveListenerEventBusError,
    UnableToAddListenerEventBusError,
} from "@/event-bus/contracts/_module-exports.js";

import { Namespace } from "@/utilities/_module-exports.js";
import {
    type Factory,
    type AsyncLazy,
    type FactoryFn,
} from "@/utilities/_module-exports.js";
import { resolveInvokable } from "@/utilities/_module-exports.js";
import { ListenerStore } from "@/event-bus/implementations/derivables/event-bus/listener-store.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/event-bus"`
 * @group Derivables
 */
export type EventBusSettingsBase = {
    /**
     * @default
     * ```ts
     * import { Namespace } from "@daiso-tech/core/utilities";
     *
     * new Namespace(["@", "event-bus"])
     * ```
     */
    namespace?: Namespace;

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
export class EventBus<TEventMap extends BaseEventMap = BaseEventMap>
    implements IEventBus<TEventMap>
{
    private readonly store = new ListenerStore();
    private readonly adapter: IEventBusAdapter;
    private readonly lazyPromiseFactory: FactoryFn<
        AsyncLazy<any>,
        LazyPromise<any>
    >;
    private namespace: Namespace;

    /**
     * @example
     * ```ts
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
     * import { EventBus } from "@daiso-tech/core/event-bus";
     *
     * const eventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter()
     * });
     * ```
     */
    constructor(settings: EventBusSettings) {
        const {
            namespace = new Namespace(["@", "event-bus"]),
            adapter,
            lazyPromiseFactory = (invokable) => new LazyPromise(invokable),
        } = settings;
        this.lazyPromiseFactory = resolveInvokable(lazyPromiseFactory);
        this.adapter = adapter;
        this.namespace = namespace;
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
            const key = this.namespace._getInternal().create(String(eventName));
            const resolvedListener = this.store.getOrAdd(
                [key.namespaced, listener],
                resolveInvokable(listener),
            );
            try {
                await this.adapter.addListener(
                    key.namespaced,
                    resolvedListener as EventListenerFn<BaseEvent>,
                );
            } catch (error: unknown) {
                this.store.getAndRemove([key.namespaced, listener]);
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
            const key = this.namespace._getInternal().create(String(eventName));
            const resolvedListener = this.store.getAndRemove([
                key.namespaced,
                listener,
            ]);
            if (resolvedListener === null) {
                return;
            }
            try {
                await this.adapter.removeListener(
                    key.namespaced,
                    resolvedListener as EventListenerFn<BaseEvent>,
                );
            } catch (error: unknown) {
                this.store.getOrAdd(
                    [key.namespaced, listener],
                    resolvedListener,
                );
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

            const key = this.namespace._getInternal().create(String(eventName));
            const resolvedListener = this.store.getOrAdd(
                [key.namespaced, listener],
                wrappedListener,
            );
            try {
                await this.adapter.addListener(
                    key.namespaced,
                    resolvedListener as EventListenerFn<BaseEvent>,
                );
            } catch (error: unknown) {
                this.store.getAndRemove([key.namespaced, listener]);
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
                    this.namespace._getInternal().create(String(eventName))
                        .namespaced,
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
