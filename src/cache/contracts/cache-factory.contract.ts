/**
 * @module Cache
 */

import type { ICache } from "@/cache/contracts/cache.contract.js";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnregisteredAdapterError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    DefaultAdapterNotDefinedError,
} from "@/utilities/_module-exports.js";

/**
 * The <i>ICacheFactory</i> contract makes it easy to configure and switch between different <i>{@link ICache}</i> dynamically.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Contracts
 */
export type ICacheFactory<TAdapters extends string = string> = {
    /**
     * The <i>use</i> method will throw an error if you provide it unregisted adapter.
     * If no default adapter is defined an error will be thrown.
     * @throws {UnregisteredAdapterError} {@link UnregisteredAdapterError}
     * @throws {DefaultAdapterNotDefinedError} {@link DefaultAdapterNotDefinedError}
     */
    use<TType = unknown>(adapterName?: TAdapters): ICache<TType>;
};
