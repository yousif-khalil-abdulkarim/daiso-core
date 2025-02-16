/**
 * @module EventBus
 */

import type { IGroupableEventBus } from "@/event-bus/contracts/event-bus.contract.js";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnregisteredAdapterError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    DefaultAdapterNotDefinedError,
} from "@/utilities/_module-exports.js";
import type { BaseEvent } from "@/event-bus/contracts/_shared.js";

/**
 * The <i>IEventBusFactory</i> contract makes it easy to configure and switch between different <i>{@link IGroupableEventBus}</i> dynamically.
 * @group Contracts
 */
export type IEventBusFactory<TAdapters extends string = string> = {
    /**
     * The <i>use</i> method will throw an error if you provide it unregisted adapter.
     * If no default adapter is defined an error will be thrown by <i>use</i> method.
     * @throws {UnregisteredAdapterError} {@link UnregisteredAdapterError}
     * @throws {DefaultAdapterNotDefinedError} {@link DefaultAdapterNotDefinedError}
     * @example
     * ```ts
     * import { type IEventBusFactory, BaseEvent } from "@daiso-tech/core";
     *
     * class AddEvent extends BaseEvent<{
     *   a: number;
     *   b: number;
     * }> {}
     *
     * // Asume the inputed eventFactory has registered both a memory and Redis IEventBusAdapter.
     * // The memory IEventBusAdapter adapter is the default.
     * async function main(eventFactory: IEventBusFactory): Promise<void> {
     *   // Will dispatch envent using the default adapter
     *   await eventBusFactory
     *     .use()
     *     .dispatch(new AddEvent({ a: 1, b: 2 }));
     *   // Will dispatch envent using the redis addapter
     *   await eventBusFactory
     *     .use("redis")
     *     .dispatch(new AddEvent({ a: 1, b: 2 }));
     * }
     * ```
     */
    use<TEvents extends BaseEvent = BaseEvent>(
        adapterName?: TAdapters,
    ): IGroupableEventBus<TEvents>;
};
