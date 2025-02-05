/**
 * @module Lock
 */

import type { IGroupableLockProvider } from "@/lock/contracts/lock-provider.contract";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnregisteredAdapterError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    DefaultAdapterNotDefinedError,
} from "@/utilities/errors";

/**
 * @group Contracts
 */
export type ILockProviderFactory<TAdapters extends string = string> = {
    use(adapterName?: TAdapters): IGroupableLockProvider;
};
