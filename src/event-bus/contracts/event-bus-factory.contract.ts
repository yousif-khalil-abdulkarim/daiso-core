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
     * async function main(eventFactory: IEventBusFactory): Promise<void> {
     *   // Will dispatch envent using the default driver
     *   await eventBusFactory
     *     .use()
     *     .dispatch({ type: "add", a: 1, b: 2 });
     *   // Will dispatch envent using the redis addapter
     *   await eventBusFactory
     *     .use("redis")
     *     .dispatch({ type: "add", a: 1, b: 2 });
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
     * async function main(eventBusFactory: IEventBusFactory): Promise<void> {
     *   type AddEvent = {
     *     type: "add";
     *     a: number;
     *     b: number;
     *   };
     *   await eventBusFactory
     *     .withTypes<AddEvent>()
     *     .use()
     *     // You will se an typescript error
     *     .dispatch({ type: "add" });
     * }
     * ```
     */
    withType<TOutput extends TEvents = TEvents>(): IEventBusFactory<
        TDrivers,
        TOutput
    >;
};
