/**
 * @module Semaphore
 */

import type {
    ISemaphoreAdapter,
    SemaphoreAdapterVariants,
} from "@/semaphore/contracts/_module-exports.js";
import { isDatabaseSemaphoreAdapter } from "@/semaphore/implementations/derivables/semaphore-provider/is-database-semaphore-adapter.js";
import { DatabaseSemaphoreAdapter } from "@/semaphore/implementations/derivables/semaphore-provider/database-semaphore-adapter.js";

/**
 * @internal
 */
export function resolveDatabaseSemaphoreAdapter(
    adapter: SemaphoreAdapterVariants,
): ISemaphoreAdapter {
    if (isDatabaseSemaphoreAdapter(adapter)) {
        return new DatabaseSemaphoreAdapter(adapter);
    }
    return adapter;
}
