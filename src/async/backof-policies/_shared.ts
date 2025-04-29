/**
 * @module Async
 */

import type { Invokable, TimeSpan } from "@/utilities/_module-exports.js";

/**
 * @returns Amount milliseconds to wait
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group BackoffPolicies
 */
export type BackoffPolicy = Invokable<
    [attempt: number, error: unknown],
    TimeSpan
>;
