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
        typeof adapter_["update"] === "function" &&
        adapter_["update"].length === 3 &&
        typeof adapter_["remove"] === "function" &&
        adapter_["remove"].length === 2 &&
        typeof adapter_["refresh"] === "function" &&
        adapter_["refresh"].length === 3 &&
        typeof adapter_["find"] === "function" &&
        adapter_["find"].length === 1
    );
}
