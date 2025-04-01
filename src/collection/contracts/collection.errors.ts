/**
 * @module Collection
 */

import type {
    IFlexibleSerde,
    ISerializable,
} from "@/serde/contracts/_module-exports.js";
import {
    CORE,
    resolveOneOrMore,
    type ISerializedError,
    type OneOrMore,
} from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/collection/contracts"`
 * @group Errors
 */
export class CollectionError
    extends Error
    implements ISerializable<ISerializedError>
{
    static deserialize(deserializedValue: ISerializedError): CollectionError {
        return new CollectionError(
            deserializedValue.message,
            deserializedValue.cause,
        );
    }

    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = CollectionError.name;
    }

    serialize(): ISerializedError {
        return {
            name: this.name,
            message: this.message,
            cause: this.cause,
        };
    }
}

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/collection/contracts"`
 * @group Errors
 */
export class UnexpectedCollectionError extends CollectionError {
    static override deserialize(
        deserializedValue: ISerializedError,
    ): CollectionError {
        return new UnexpectedCollectionError(
            deserializedValue.message,
            deserializedValue.cause,
        );
    }

    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = UnexpectedCollectionError.name;
    }
}

/**
 * The error is thrown when the item is not found.
 *
 * IMPORT_PATH: `"@daiso-tech/core/collection/contracts"`
 * @group Errors
 */
export class ItemNotFoundCollectionError extends CollectionError {
    static override deserialize(
        deserializedValue: ISerializedError,
    ): CollectionError {
        return new ItemNotFoundCollectionError(
            deserializedValue.message,
            deserializedValue.cause,
        );
    }

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
export class MultipleItemsFoundCollectionError extends CollectionError {
    static override deserialize(
        deserializedValue: ISerializedError,
    ): CollectionError {
        return new MultipleItemsFoundCollectionError(
            deserializedValue.message,
            deserializedValue.cause,
        );
    }

    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = MultipleItemsFoundCollectionError.name;
    }
}

/**
 * The error is thrown when calling a method that needs all items to be of a specific type. For example, the `sum` method requires all items to be numbers.
 *
 * IMPORT_PATH: `"@daiso-tech/core/collection/contracts"`
 * @group Errors
 */
export class TypeCollectionError extends CollectionError {
    static override deserialize(
        deserializedValue: ISerializedError,
    ): CollectionError {
        return new TypeCollectionError(
            deserializedValue.message,
            deserializedValue.cause,
        );
    }

    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = TypeCollectionError.name;
    }
}

/**
 * The error is thrown when calling a method that needs the collection not to be empty. For example, the `average` method requires the collection not to be empty.
 *
 * IMPORT_PATH: `"@daiso-tech/core/collection/contracts"`
 * @group Errors
 */
export class EmptyCollectionError extends CollectionError {
    static override deserialize(
        deserializedValue: ISerializedError,
    ): CollectionError {
        return new EmptyCollectionError(
            deserializedValue.message,
            deserializedValue.cause,
        );
    }

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
    Base: CollectionError,
    Unexpected: UnexpectedCollectionError,
    ItemNotFound: ItemNotFoundCollectionError,
    MultipleItemsFound: MultipleItemsFoundCollectionError,
    Type: TypeCollectionError,
    Empty: EmptyCollectionError,
} as const;

/**
 * The `registerCollectionErrorsToSerde` function registers all `ICollection` related errors with `IFlexibleSerde`, ensuring they will properly be serialized and deserialized.
 *
 * IMPORT_PATH: `"@daiso-tech/core/collection/contracts"`
 * @group Errors
 */
export function registerCollectionErrorsToSerde(
    serde: OneOrMore<IFlexibleSerde>,
): void {
    for (const serde_ of resolveOneOrMore(serde)) {
        serde_
            .registerClass(CollectionError, CORE)
            .registerClass(UnexpectedCollectionError, CORE)
            .registerClass(ItemNotFoundCollectionError, CORE)
            .registerClass(MultipleItemsFoundCollectionError, CORE)
            .registerClass(TypeCollectionError, CORE)
            .registerClass(EmptyCollectionError, CORE);
    }
}
