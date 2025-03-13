/**
 * @module Utilities
 */

/**
 * @internal
 */
export function isNullable<TValue>(value: TValue): boolean {
    return value === null || value === undefined;
}
