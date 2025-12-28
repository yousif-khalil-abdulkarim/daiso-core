/**
 * @module Cache
 */

import type { ITimeSpan } from "@/time-span/contracts/_module.js";
import { TimeSpan } from "@/time-span/implementations/_module.js";
import { withJitter } from "@/utilities/_module.js";

/**
 * @internal
 */
export function timeSpanWithJitter(
    ttl: ITimeSpan,
    jitter: number | null,
    randomValue: number,
): TimeSpan {
    return TimeSpan.fromMilliseconds(
        withJitter({
            jitter,
            value: TimeSpan.fromTimeSpan(ttl).toMilliseconds(),
            randomValue,
        }),
    );
}
