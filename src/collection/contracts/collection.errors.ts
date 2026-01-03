/**
 * @module Collection
 */

/**
 * The error is thrown when the item is not found.
 *
 * IMPORT_PATH: `"@daiso-tech/core/collection/contracts"`
 * @group Errors
 */
export class ItemNotFoundCollectionError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = ItemNotFoundCollectionError.name;
    }
}

/**
 * The error is thrown when multiple items are found.
 *
 * IMPORT_PATH: `"@daiso-tech/core/collection/contracts"`
 * @group Errors
 */
export class MultipleItemsFoundCollectionError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = MultipleItemsFoundCollectionError.name;
    }
}

/**
 * The error is thrown when calling a method that needs the collection not to be empty. For example, the `average` method requires the collection not to be empty.
 *
 * IMPORT_PATH: `"@daiso-tech/core/collection/contracts"`
 * @group Errors
 */
export class EmptyCollectionError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = EmptyCollectionError.name;
    }
}

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/collection/contracts"`
 * @group Errors
 */
export const COLLECTION_ERRORS = {
    ItemNotFound: ItemNotFoundCollectionError,
    MultipleItemsFound: MultipleItemsFoundCollectionError,
    Empty: EmptyCollectionError,
} as const;
