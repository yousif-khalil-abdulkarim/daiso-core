/**
 * @module Utilities
 */

/**
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function isIterable<TItem>(value: any): value is Iterable<TItem> {
    return (
        typeof value === "object" &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        typeof value[Symbol.iterator] === "function"
    );
}
