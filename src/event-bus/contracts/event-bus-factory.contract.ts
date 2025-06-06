/**
 * @module EventBus
 */

import type {
    BaseEventMap,
    IEventBus,
} from "@/event-bus/contracts/event-bus.contract.js";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnregisteredAdapterError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    DefaultAdapterNotDefinedError,
} from "@/utilities/_module-exports.js";

/**
 * The `IEventBusFactory` contract makes it easy to configure and switch between different {@link IEventBus | `IEventBus`} dynamically.
 *
 * IMPORT_PATH: `"@daiso-tech/core/event-bus/contracts"`
 * @group Contracts
 */
export type IEventBusFactory<
    TAdapters extends string = string,
    TEventMap extends BaseEventMap = BaseEventMap,
> = {
    /**
     * The `use` method will throw an error if you provide it unregisted adapter.
     * If no default adapter is defined an error will be thrown by `use` method.
     * @throws {UnregisteredAdapterError} {@link UnregisteredAdapterError}
     * @throws {DefaultAdapterNotDefinedError} {@link DefaultAdapterNotDefinedError}
     */
    use(adapterName?: TAdapters): IEventBus<TEventMap>;
};
