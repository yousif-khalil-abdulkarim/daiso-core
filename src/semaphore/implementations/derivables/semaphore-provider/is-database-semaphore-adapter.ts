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
        typeof adapter_["findLimit"] === "function" &&
        adapter_["findLimit"].length === 1 &&
        typeof adapter_["insertSemaphore"] === "function" &&
        adapter_["insertSemaphore"].length === 2 &&
        typeof adapter_["removeSemaphore"] === "function" &&
        adapter_["removeSemaphore"].length === 1 &&
        typeof adapter_["insertSlotIfLimitNotReached"] === "function" &&
        adapter_["insertSlotIfLimitNotReached"].length === 1 &&
        typeof adapter_["removeSlot"] === "function" &&
        adapter_["removeSlot"].length === 2 &&
        typeof adapter_["updateSlotIfUnexpired"] === "function" &&
        adapter_["updateSlotIfUnexpired"].length === 3
    );
}
