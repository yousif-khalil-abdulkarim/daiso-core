/**
 * @module Utilities
 */

/**
 * @internal
 */
export function getConstructorName(instance: object): string {
    return instance.constructor.name;
}
