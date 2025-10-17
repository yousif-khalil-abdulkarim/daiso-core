/**
 * @module SharedLock
 */

import type {
    ISharedLockAdapter,
    SharedLockAdapterVariants,
} from "@/shared-lock/contracts/_module-exports.js";
import { isDatabaseSharedLockAdapter } from "@/shared-lock/implementations/derivables/shared-lock-provider/is-database-shared-lock-adapter.js";
import { DatabaseSharedLockAdapter } from "@/shared-lock/implementations/derivables/shared-lock-provider/database-shared-lock-adapter.js";

/**
 * @internal
 */
export function resolveDatabaseSharedLockAdapter(
    adapter: SharedLockAdapterVariants,
): ISharedLockAdapter {
    if (isDatabaseSharedLockAdapter(adapter)) {
        return new DatabaseSharedLockAdapter(adapter);
    }
    return adapter;
}
