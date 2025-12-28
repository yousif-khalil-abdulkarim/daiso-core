/**
 * @module Cache
 */

import type {
    GetOrPutDynamic,
    GetOrPutInvokable,
} from "@/new-cache/contracts/_module.js";
import { Task } from "@/task/implementations/_module.js";

/**
 * @internal
 */
export function resolveGetOrPutDynamic<TType>(
    dynamicValue: GetOrPutDynamic<TType>,
): GetOrPutInvokable<TType> {
    if (Task.isTask<TType>(dynamicValue)) {
        return async () => {
            return {
                value: await dynamicValue,
            };
        };
    }
    return dynamicValue;
}
