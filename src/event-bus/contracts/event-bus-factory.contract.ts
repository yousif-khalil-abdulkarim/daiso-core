/**
 * @module EventBus
 */

import type { IGroupableEventBus } from "@/event-bus/contracts/event-bus.contract";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnregisteredDriverError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    DefaultDriverNotDefinedError,
} from "@/utilities/_module";
import type { BaseEvent } from "@/event-bus/contracts/_shared";

/**
 * The <i>IEventBusFactory</i> contract makes it easy to configure and switch between different <i>{@link IGroupableEventBus}</i> dynamically.
 * @group Contracts
 */
export type IEventBusFactory<
    TDrivers extends string = string,
    TEvents extends BaseEvent = BaseEvent,
> = {
    /**
     * The <i>use</i> method will throw an error if you provide it unregisted driver.
     * If no default driver is defined an error will be thrown by <i>use</i> method.
     * @throws {UnregisteredDriverError} {@link UnregisteredDriverError}
     * @throws {DefaultDriverNotDefinedError} {@link DefaultDriverNotDefinedError}
     * @example
     * ```ts
     * import { type IEventBusFactory } from "@daiso-tech/core";
     *
     * type SerializedAddEvent = {
     *   a: number;
     *   b: number;
     * };
     *
     * class AddEvent extends BaseEvent<SerializedAddEvent> {
     *   // This needed for adapters that need to deserialize like the redis dapter.
     *   static override deserialize({ a, b }: SerializedAddEvent): AddEvent {
     *     return new AddEvent(a, b);
     *   }
     *
     *   constructor(public readonly a: number, public readonly b: number) {
     *     super();
     *   }
     *
     *   // This needed for adapters that need to serialize like the redis adapter.
     *   override serialize(): SerializedAddEvent {
     *     return {
     *       a: this.a,
     *       b: this.b
     *     };
     *   }
     * }
     *
     * // Asume the inputed eventFactory has registered both a memory and Redis IEventBusAdapter.
     * // The memory IEventBusAdapter adapter is the default.
     * async function main(eventFactory: IEventBusFactory): Promise<void> {
     *   // Will dispatch envent using the default driver
     *   await eventBusFactory
     *     .use()
     *     .dispatch(new AddEvent(1, 2));
     *   // Will dispatch envent using the redis addapter
     *   await eventBusFactory
     *     .use("redis")
     *     .dispatch(new AddEvent(1, 2));
     * }
     * ```
     */
    use(driverName?: TDrivers): IGroupableEventBus<TEvents>;

    /**
     * The <i>withTypes</i> method is used to set the event types of the <i>{@link IEventBus}</i>.
     * @example
     * ```ts
     * import { type IEventBusFactory } from "@daiso-tech/core";
     *
     * type SerializedAddEvent = {
     *   a: number;
     *   b: number;
     * };
     *
     * class AddEvent extends BaseEvent<SerializedAddEvent> {
     *   // This needed for adapters that need to deserialize like the redis dapter.
     *   static override deserialize({ a, b }: SerializedAddEvent): AddEvent {
     *     return new AddEvent(a, b);
     *   }
     *
     *   constructor(public readonly a: number, public readonly b: number) {
     *     super();
     *   }
     *
     *   // This needed for adapters that need to serialize like the redis adapter.
     *   override serialize(): SerializedAddEvent {
     *     return {
     *       a: this.a,
     *       b: this.b
     *     };
     *   }
     * }
     *
     * type SerializedSubEvent = {
     *   c: number;
     *   d: number;
     * };
     *
     * class SubEvent extends BaseEvent<SerializedSubEvent> {
     *   // This needed for adapters that need to deserialize like the redis dapter.
     *   static override deserialize({ c, d }: SerializedSubEvent): SubEvent {
     *     return new SubEvent(c, d);
     *   }
     *
     *   constructor(public readonly a: number, public readonly b: number) {
     *     super();
     *   }
     *
     *   // This needed for adapters that need to serialize like the redis adapter.
     *   override serialize(): SerializedSubEvent {
     *     return {
     *       c: this.c,
     *       d: this.d
     *     };
     *   }
     * }
     *
     * // Asume the inputed eventFactory has registered both a memory and Redis IEventBusAdapter.
     * // The memory IEventBusAdapter adapter is the default.
     * async function main(eventBusFactory: IEventBusFactory): Promise<void> {
     *   await eventBusFactory
     *     .withTypes<AddEvent>()
     *     .use()
     *     // You will se an typescript error
     *     .dispatch(new SubEvent(1, 2));
     * }
     * ```
     */
    withType<TOutput extends TEvents = TEvents>(): IEventBusFactory<
        TDrivers,
        TOutput
    >;
};
