/**
 * @module Shared
 */

import { ReplyError } from "ioredis";

/**
 * @internal
 */
export function isRedisTypeError(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    value: any,
): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (
        value instanceof ReplyError &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        value.message.includes("ERR value is not a valid float")
    );
}
