/**
 * @module Semaphore
 */
import type { IDatabaseSemaphoreAdapter } from "@/semaphore/contracts/_module-exports.js";
import type { ISemaphoreAdapter } from "@/semaphore/contracts/_module-exports.js";

/**
 * @internal
 */
export function isDatabaseSemaphoreAdapter(
    adapter: ISemaphoreAdapter | IDatabaseSemaphoreAdapter,
): adapter is IDatabaseSemaphoreAdapter {
    const adapter_ = adapter as Partial<
        Record<string, (...args_: unknown[]) => unknown>
    >;
    return (
        typeof adapter_["transaction"] === "function" &&
        adapter_["transaction"].length === 1 &&
        typeof adapter_["removeSlot"] === "function" &&
        adapter_["removeSlot"].length === 2 &&
        typeof adapter_["removeAllSlots"] === "function" &&
        adapter_["removeAllSlots"].length === 1 &&
        typeof adapter_["updateExpiration"] === "function" &&
        adapter_["updateExpiration"].length === 3
    );
}
