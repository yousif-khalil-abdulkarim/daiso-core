/**
 * @module EventBus
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Validator, zodValidator } from "@/utilities/_module";
import { LazyPromise } from "@/utilities/_module";
import type { SelectEvent } from "@/event-bus/contracts/_module";
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

import { WithNamespaceEventBusAdapter } from "@/event-bus/implementations/derivables/with-namespace-event-bus-adapter";
import { WithValidationEventBusAdapter } from "@/event-bus/implementations/derivables/with-validation-event-bus-adapter";
import type { OneOrMore } from "@/_shared/types";
import { simplifyNamespace, isArrayEmpty } from "@/_shared/utilities";
import { BaseEventBus } from "@/event-bus/implementations/derivables/base-event-bus";

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
    extends BaseEventBus<TEvents>
    implements INamespacedEventBus<TEvents>
{
    private readonly eventBusAdapter: IEventBusAdapter;
    private readonly namespace: string;
    private readonly validator: Validator<TEvents>;

    constructor(
        eventBusAdapter: IEventBusAdapter,
        settings: EventBusSettings<TEvents> = {},
    ) {
        super();
        const { validator = (value) => value as TEvents } = settings;
        let { rootNamespace: namespace = "" } = settings;
        namespace = simplifyNamespace(namespace);
        this.namespace = namespace;
        this.validator = validator;
        this.eventBusAdapter = new WithNamespaceEventBusAdapter(
            new WithValidationEventBusAdapter(eventBusAdapter, this.validator),
            this.namespace,
        );
    }

    withNamespace(namespace: OneOrMore<string>): IEventBus<TEvents> {
        namespace = simplifyNamespace(namespace);
        return new EventBus(this.eventBusAdapter, {
            validator: this.validator,
            rootNamespace: [this.namespace, namespace],
        });
    }

    getNamespace(): string {
        return this.namespace;
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
