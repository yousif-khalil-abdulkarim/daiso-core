/**
 * @module EventBus
 */

import type { IEventBus } from "@/event-bus/contracts/event-bus.contract.js";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnregisteredAdapterError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    DefaultAdapterNotDefinedError,
} from "@/utilities/_module-exports.js";
import type { BaseEvent } from "@/event-bus/contracts/_shared.js";

/**
 * The <i>IEventBusFactory</i> contract makes it easy to configure and switch between different <i>{@link IEventBus}</i> dynamically.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/contracts"```
 * @group Contracts
 */
export type IEventBusFactory<TAdapters extends string = string> = {
    /**
     * The <i>use</i> method will throw an error if you provide it unregisted adapter.
     * If no default adapter is defined an error will be thrown by <i>use</i> method.
     * @throws {UnregisteredAdapterError} {@link UnregisteredAdapterError}
     * @throws {DefaultAdapterNotDefinedError} {@link DefaultAdapterNotDefinedError}
     */
    use<TEvents extends BaseEvent = BaseEvent>(
        adapterName?: TAdapters,
    ): IEventBus<TEvents>;
};
