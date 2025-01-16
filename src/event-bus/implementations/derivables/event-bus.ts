/**
 * @module EventBus
 */

import { LazyPromise } from "@/utilities/_module";
import type {
    SelectEvent,
    AllEvents,
    BaseEvents,
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

import { WithNamespaceEventBusAdapter } from "@/event-bus/implementations/derivables/with-namespace-event-bus-adapter";
import type { OneOrMore } from "@/_shared/types";
import { simplifyNamespace, isArrayEmpty } from "@/_shared/utilities";
import { BaseEventBus } from "@/event-bus/implementations/derivables/base-event-bus";

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
};

/**
 * <i>EventBus</i> class can be derived from any <i>{@link IEventBusAdapter}</i>.
 * @group Derivables
 */
export class EventBus<TEvents extends BaseEvents = BaseEvents>
    extends BaseEventBus<TEvents>
    implements INamespacedEventBus<TEvents>
{
    private readonly eventBusAdapter: IEventBusAdapter;
    private readonly namespace: string;

    constructor(
        eventBusAdapter: IEventBusAdapter,
        settings: EventBusSettings = {},
    ) {
        super();
        let { rootNamespace: namespace = "" } = settings;
        namespace = simplifyNamespace(namespace);
        this.namespace = namespace;
        this.eventBusAdapter = new WithNamespaceEventBusAdapter(
            eventBusAdapter,
            this.namespace,
        );
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

    addListener<TEventName extends keyof TEvents>(
        eventName: TEventName,
        listener: Listener<SelectEvent<TEvents, TEventName>>,
    ): LazyPromise<void> {
        return new LazyPromise(async () => {
            try {
                if (typeof eventName !== "string") {
                    throw new UnexpectedEventBusError("!!__message__!!");
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
        return new LazyPromise(async () => {
            if (typeof eventName !== "string") {
                throw new UnexpectedEventBusError("!!__message__!!");
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
        return new LazyPromise(async () => {
            if (!Array.isArray(events)) {
                events = [events];
            }
            if (isArrayEmpty(events)) {
                return;
            }
            try {
                await this.eventBusAdapter.dispatch(events as IBaseEvent[]);
            } catch (error: unknown) {
                throw new DispatchEventBusError(
                    `Events "${events.map((event) => event.type).join(", ")}" could not be dispatched`,
                    error,
                );
            }
        });
    }
}
