/**
 * @module Lock
 */
import type { IDatabaseLockAdapter } from "@/lock/contracts/_module-exports.js";
import type { ILockAdapter } from "@/lock/contracts/_module-exports.js";

/**
 * @internal
 */
export function isDatabaseLockAdapter(
    adapter: ILockAdapter | IDatabaseLockAdapter,
): adapter is IDatabaseLockAdapter {
    const adapter_ = adapter as Partial<
        Record<string, (...args_: unknown[]) => unknown>
    >;

    return (
        typeof adapter_["insert"] === "function" &&
        adapter_["insert"].length === 3 &&
        typeof adapter_["updateIfExpired"] === "function" &&
        adapter_["updateIfExpired"].length === 3 &&
        typeof adapter_["remove"] === "function" &&
        adapter_["remove"].length === 1 &&
        typeof adapter_["removeIfOwner"] === "function" &&
        adapter_["removeIfOwner"].length === 2 &&
        typeof adapter_["updateExpirationIfOwner"] === "function" &&
        adapter_["updateExpirationIfOwner"].length === 3 &&
        typeof adapter_["find"] === "function" &&
        adapter_["find"].length === 1
    );
}
