/**
 * @module Collection
 */

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 * @group Errors
 */
export class CollectionError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = CollectionError.name;
    }
}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 * @group Errors
 */
export class UnexpectedCollectionError extends CollectionError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = UnexpectedCollectionError.name;
    }
}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 * @group Errors
 */
export class ItemNotFoundCollectionError extends CollectionError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = ItemNotFoundCollectionError.name;
    }
}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 * @group Errors
 */
export class MultipleItemsFoundCollectionError extends CollectionError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = MultipleItemsFoundCollectionError.name;
    }
}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 * @group Errors
 */
export class TypeCollectionError extends CollectionError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = TypeCollectionError.name;
    }
}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 * @group Errors
 */
export class EmptyCollectionError extends CollectionError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = EmptyCollectionError.name;
    }
}
