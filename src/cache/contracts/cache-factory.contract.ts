/**
 * @module Cache
 */

import type { IGroupableCache } from "@/cache/contracts/cache.contract.js";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnregisteredAdapterError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    DefaultAdapterNotDefinedError,
} from "@/utilities/errors.js";

/**
 * The <i>ICacheFactory</i> contract makes it easy to configure and switch between different <i>{@link IGroupableCache}</i> dynamically.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Contracts
 */
export type ICacheFactory<TAdapters extends string = string> = {
    /**
     * The <i>use</i> method will throw an error if you provide it unregisted adapter.
     * If no default adapter is defined an error will be thrown by <i>use</i> method.
     * @throws {UnregisteredAdapterError} {@link UnregisteredAdapterError}
     * @throws {DefaultAdapterNotDefinedError} {@link DefaultAdapterNotDefinedError}
     */
    use<TType = unknown>(adapterName?: TAdapters): IGroupableCache<TType>;
};
