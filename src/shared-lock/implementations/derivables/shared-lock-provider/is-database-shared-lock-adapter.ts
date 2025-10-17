/**
 * @module SharedLock
 */

import type {
    IDatabaseSharedLockAdapter,
    SharedLockAdapterVariants,
} from "@/shared-lock/contracts/_module-exports.js";

/**
 * @internal
 */
export function isDatabaseSharedLockAdapter(
    adapter: SharedLockAdapterVariants,
): adapter is IDatabaseSharedLockAdapter {
    const adapter_ = adapter as Partial<
        Record<string, (...args_: unknown[]) => unknown>
    >;

    return (
        typeof adapter_["transaction"] === "function" &&
        adapter_["transaction"].length === 1
    );
}
