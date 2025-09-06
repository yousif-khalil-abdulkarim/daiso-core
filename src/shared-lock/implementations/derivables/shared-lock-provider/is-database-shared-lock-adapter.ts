/**
 * @moudle SharedLock
 */

import type {
    IDatabaseSharedLockAdapter,
    SharedLockAdapterVariants,
} from "@/shared-lock/contracts/_module-exports.js";

/**
 * @internal
 */
export function isDatabaseSharedlockAdapter(
    adapter: SharedLockAdapterVariants,
): adapter is IDatabaseSharedLockAdapter {
    throw new Error("Method not implemented.");
}
