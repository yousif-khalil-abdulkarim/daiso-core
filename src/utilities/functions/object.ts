/**
 * @module Utilities
 */

/**
 * @internal
 */
export function objectSize(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    object: Record<string | number | symbol, any>,
): number {
    let size = 0;
    for (const key in object) {
        if (object[key] === undefined) {
            continue;
        }
        size++;
    }
    return size;
}

/**
 * @internal
 */
export function isObjectEmpty(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    object: Record<string | number | symbol, any>,
): boolean {
    return objectSize(object) === 0;
}

/**
 * @internal
 */
export function removeUndefinedProperties<
    TObject extends Partial<Record<string, unknown>>,
>(object: TObject): TObject {
    return Object.fromEntries(
        Object.entries(object).filter(([_key, value]) => value !== undefined),
    ) as TObject;
}
