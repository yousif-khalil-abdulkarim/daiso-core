/**
 * @module EventBus
 */

import type { IInvokableObject } from "@/utilities/_module-exports.js";
import type { LazyPromise } from "@/async/_module-exports.js";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnableToDispatchEventBusError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnableToAddListenerEventBusError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnableToRemoveListenerEventBusError,
} from "@/event-bus/contracts/event-bus.errors.js";
import type { BaseEvent } from "@/event-bus/contracts/_shared.js";
import type { EventListenerFn } from "@/event-bus/contracts/event-bus-adapter.contract.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/contracts"```
 * @group Contracts
 */
export type EventClass<TEvents extends BaseEvent> = {
    new (...arguments_: any[]): TEvents;
};

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/contracts"```
 * @group Contracts
 */
export type EventInstance<TEventClass extends EventClass<BaseEvent>> =
    TEventClass extends {
        new (...arguments_: any[]): infer TInstance;
    }
        ? TInstance
        : never;
/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/contracts"```
 * @group Contracts
 */
export type Unsubscribe = () => LazyPromise<void>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/contracts"```
 * @group Contracts
 */
export type IEventListenerObject<TEvent> = IInvokableObject<[event: TEvent]>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/contracts"```
 * @group Contracts
 */
export type EventListener<TEvent> =
    | IEventListenerObject<TEvent>
    | EventListenerFn<TEvent>;

/**
 * The <i>IEventListenable</i> contract defines a way listening to events independent of underlying technology
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/contracts"```
 * @group Contracts
 */
export type IEventListenable<TEvents extends BaseEvent = BaseEvent> = {
    /**
     * The <i>addListener</i> method is used for listening to a <i>{@link BaseEvent}</i>.
     * The same listener can only be added once for a specific event. Adding the same listener multiple times will have no effect and nothing will occur.
     * @throws {UnableToAddListenerEventBusError} {@link UnableToAddListenerEventBusError}
     */
    addListener<TEventClass extends EventClass<TEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<void>;

    /**
     * The <i>removeListener</i> method is used for stop listening to a <i>{@link BaseEvent}</i>.
     * Removing unadded listener will have no effect and nothing will occur.
     * @throws {UnableToRemoveListenerEventBusError} {@link UnableToRemoveListenerEventBusError}
     */
    removeListener<TEventClass extends EventClass<TEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<void>;

    /**
     * The <i>listenOnce</i> method is used for listening to a <i>{@link BaseEvent}</i> once.
     * @throws {UnableToAddListenerEventBusError} {@link UnableToAddListenerEventBusError}
     */
    listenOnce<TEventClass extends EventClass<TEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<void>;

    /**
     * The <i>asPromise</i> method returns <i>{@link LazyPromise}</i> objecet that resolves once the <i>{@link BaseEvent}</i> is dispatched.
     * @throws {UnableToAddListenerEventBusError} {@link UnableToAddListenerEventBusError}
     */
    asPromise<TEventClass extends EventClass<TEvents>>(
        event: TEventClass,
    ): LazyPromise<EventInstance<TEventClass>>;

    /**
     * The <i>subscribeOnce</i> method is used for listening to a <i>{@link BaseEvent}</i> once and it returns a cleanup function that removes listener when called.
     * The same listener can only be added once for a specific event. Adding the same listener multiple times will have no effect and nothing will occur.
     */
    subscribeOnce<TEventClass extends EventClass<TEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<Unsubscribe>;

    /**
     * The <i>subscribe</i> method is used for listening to a <i>{@link BaseEvent}</i> and it returns a cleanup function that removes listener when called.
     * The same listener can only be added once for a specific event. Adding the same listener multiple times will have no effect and nothing will occur.
     */
    subscribe<TEventClass extends EventClass<TEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<Unsubscribe>;
};

/**
 * The <i>IEventDispatcher</i> contract defines a way for dispatching to events independent of underlying technology.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/contracts"```
 * @group Contracts
 */
export type IEventDispatcher<TEvents extends BaseEvent = BaseEvent> = {
    /**
     * The <i>dispatch</i> method is used for dispatching a <i>{@link BaseEvent}</i>.

     * @throws {UnableToDispatchEventBusError} {@link UnableToDispatchEventBusError}
     */
    dispatch(event: TEvents): LazyPromise<void>;
};

/**
 * The <i>IEventBus</i> contract defines a way for dispatching and listening to events independent of underlying technology.
 * It commes with more convient methods compared to <i>IEventBusAdapter</i>.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/contracts"```
 * @group Contracts
 */
export type IEventBus<TEvents extends BaseEvent = BaseEvent> =
    IEventListenable<TEvents> & IEventDispatcher<TEvents>;
