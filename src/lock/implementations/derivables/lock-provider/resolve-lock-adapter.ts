/**
 * @module Lock
 */
import type { LockAdapterVariants } from "@/lock/contracts/_module.js";
import type { ILockAdapter } from "@/lock/contracts/_module.js";
import { isDatabaseLockAdapter } from "@/lock/implementations/derivables/lock-provider/is-database-lock-adapter.js";
import { DatabaseLockAdapter } from "@/lock/implementations/derivables/lock-provider/database-lock-adapter.js";

/**
 * @internal
 */
export function resolveLockAdapter(adapter: LockAdapterVariants): ILockAdapter {
    if (isDatabaseLockAdapter(adapter)) {
        return new DatabaseLockAdapter(adapter);
    }
    return adapter;
}
