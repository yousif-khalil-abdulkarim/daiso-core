/**
 * @module EventBus
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Validator, zodValidator } from "@/utilities/_module";
import { LazyPromise } from "@/utilities/_module";
import type { SelectEvent, Unsubscribe } from "@/event-bus/contracts/_module";
import {
    type IEventBus,
    type INamespacedEventBus,
    type IEventBusAdapter,
    type Listener,
    type IBaseEvent,
    DispatchEventBusError,
    RemoveListenerEventBusError,
    AddListenerEventBusError,
} from "@/event-bus/contracts/_module";
import { WithNamespaceEventBusAdapter } from "@/event-bus/implementations/event-bus/with-namespace-event-bus-adapter";
import { WithValidationEventBusAdapter } from "@/event-bus/implementations/event-bus/with-validation-event-bus-adapter";
import type { OneOrMore } from "@/_shared/types";
import { isArrayEmpty } from "@/_shared/utilities";

/**
 * @group Derivables
 */
export type EventBusSettings<TEvents extends IBaseEvent> = {
    /**
     * You can prefix all keys with a given <i>namespace</i>.
     * This useful if you want to add multitenancy but still use the same database.
     * @default {""}
     * @example
     * ```ts
     * import { EventBus, MemoryEventBusAdapter } from "@daiso-tech/core";
     *
     * const eventBusA = new EventBus(new MemoryEventBusAdapter(), {
     *   rootNamespace: "@a/"
     * });
     * const eventBusB = new EventBus(new MemoryEventBusAdapter(), {
     *   rootNamespace: "@b/"
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
    rootNamespace?: string;

    /**
     * You can pass a custom <i>{@link Validator}</i> to validate, transform and sanitize your data.
     * You could also use <i>{@link zodValidator}</i> which enables you to use zod for validating, transforming, and sanitizing.
     * @example
     * ```ts
     * import { EventBus, MemoryEventBusAdapter, zodValidator } from "@daiso-tech/core";
     * import { z } from "zod";
     *
     * const addEventSchema = z.object({
     *   type: z.literal("add"),
     *   a: z.number(),
     *   b: z.number(),
     * });
     *
     * const subEventSchema = z.object({
     *   type: z.literal("sub"),
     *   c: z.number(),
     *   d: z.number(),
     * });
     *
     * const eventBus = new EventBus(new MemoryEventBusAdapter(), {
     *   // Event type will be infered from validator
     *   validator: zodValidator(addEventSchema.or(subEventSchema))
     * });
     *
     * (async () => {
     *   // An Typescript error will be seen and ValidationError will be thrown during runtime.
     *   await eventBus.dispatch([
     *     {
     *       type: "none existing",
     *       noneExistingField: 20
     *     }
     *   ]);
     * })();
     * ```
     */
    validator?: Validator<TEvents>;
};

/**
 * <i>EventBus</i> class can be derived from any <i>{@link IEventBusAdapter}</i>.
 * @group Derivables
 */
export class EventBus<TEvents extends IBaseEvent = IBaseEvent>
    implements INamespacedEventBus<TEvents>
{
    private readonly eventBusAdapter: IEventBusAdapter;
    private readonly namespace_: string;
    private readonly validator: Validator<TEvents>;

    constructor(
        eventBusAdapter: IEventBusAdapter,
        settings: EventBusSettings<TEvents> = {},
    ) {
        const {
            rootNamespace: namespace = "",
            validator = (value) => value as TEvents,
        } = settings;
        this.namespace_ = namespace;
        this.validator = validator;
        this.eventBusAdapter = new WithNamespaceEventBusAdapter(
            new WithValidationEventBusAdapter(eventBusAdapter, this.validator),
            this.namespace_,
        );
    }

    withNamespace(namespace: string): IEventBus<TEvents> {
        return new EventBus(this.eventBusAdapter, {
            validator: this.validator,
            rootNamespace: `${this.namespace_}${namespace}`,
        });
    }

    getNamespace(): string {
        return this.namespace_;
    }

    addListener<TEventType extends TEvents["type"]>(
        event: TEventType,
        listener: Listener<SelectEvent<TEvents, TEventType>>,
    ): LazyPromise<void> {
        return new LazyPromise(async () => {
            try {
                await this.eventBusAdapter.addListener(
                    event,
                    listener as Listener<IBaseEvent>,
                );
            } catch (error: unknown) {
                throw new AddListenerEventBusError(
                    `A listener with name of "${listener.name}" could not added for "${event}" event`,
                    error,
                );
            }
        });
    }

    addListenerMany<TEventType extends TEvents["type"]>(
        events: TEventType[],
        listener: Listener<SelectEvent<TEvents, TEventType>>,
    ): LazyPromise<void> {
        return new LazyPromise(async () => {
            if (isArrayEmpty(events)) {
                return;
            }
            const promises: PromiseLike<void>[] = [];
            for (const event of events) {
                promises.push(this.addListener(event, listener));
            }
            await Promise.all(promises);
        });
    }

    removeListener<TEventType extends TEvents["type"]>(
        event: TEventType,
        listener: Listener<SelectEvent<TEvents, TEventType>>,
    ): LazyPromise<void> {
        return new LazyPromise(async () => {
            try {
                await this.eventBusAdapter.removeListener(
                    event,
                    listener as Listener<IBaseEvent>,
                );
            } catch (error: unknown) {
                throw new RemoveListenerEventBusError(
                    `A listener with name of "${listener.name}" could not removed of "${event}" event`,
                    error,
                );
            }
        });
    }

    removeListenerMany<TEventType extends TEvents["type"]>(
        events: TEventType[],
        listener: Listener<SelectEvent<TEvents, TEventType>>,
    ): LazyPromise<void> {
        return new LazyPromise(async () => {
            if (isArrayEmpty(events)) {
                return;
            }
            const promises: PromiseLike<void>[] = [];
            for (const event of events) {
                promises.push(this.removeListener(event, listener));
            }
            await Promise.all(promises);
        });
    }

    subscribe<TEventType extends TEvents["type"]>(
        event: TEventType,
        listener: Listener<SelectEvent<TEvents, TEventType>>,
    ): LazyPromise<Unsubscribe> {
        return this.subscribeMany([event], listener);
    }

    subscribeMany<TEventType extends TEvents["type"]>(
        events: TEventType[],
        listener: Listener<SelectEvent<TEvents, TEventType>>,
    ): LazyPromise<Unsubscribe> {
        return new LazyPromise(async () => {
            await this.addListenerMany(events, listener);
            const unsubscribe = () => {
                return new LazyPromise(async () => {
                    await this.removeListenerMany(events, listener);
                });
            };
            return unsubscribe;
        });
    }

    dispatch(events: OneOrMore<TEvents>): LazyPromise<void> {
        return new LazyPromise(async () => {
            if (!Array.isArray(events)) {
                events = [events];
            }
            if (isArrayEmpty(events)) {
                return;
            }
            try {
                await this.eventBusAdapter.dispatch(events);
            } catch (error: unknown) {
                throw new DispatchEventBusError(
                    `Events "${events.map((event) => event.type).join(", ")}" could not be dispatched`,
                    error,
                );
            }
        });
    }
}
