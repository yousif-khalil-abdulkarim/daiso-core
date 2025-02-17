/**
 * @module Collection
 */

import type {
    IFlexibleSerde,
    ISerializable,
} from "@/serde/contracts/_module-exports.js";
import {
    CORE,
    type ISerializedError,
    type OneOrMore,
} from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
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
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
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
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
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
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
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
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
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
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
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
 * The <i>registerCollectionErrorsToSerde</i> function registers all <i>{@link IGroupableCollection}</i> related errors with <i>IFlexibleSerde</i>, ensuring they will properly be serialized and deserialized.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 * @group Errors
 */
export function registerCollectionErrorsToSerde(
    serde: OneOrMore<IFlexibleSerde>,
): void {
    if (!Array.isArray(serde)) {
        serde = [serde];
    }
    for (const serde_ of serde) {
        serde_
            .registerClass(CollectionError, CORE)
            .registerClass(UnexpectedCollectionError, CORE)
            .registerClass(ItemNotFoundCollectionError, CORE)
            .registerClass(MultipleItemsFoundCollectionError, CORE)
            .registerClass(TypeCollectionError, CORE)
            .registerClass(EmptyCollectionError, CORE);
    }
}
