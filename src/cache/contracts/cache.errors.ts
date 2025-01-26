/**
 * @module Cache
 */

import type { ISerializable } from "@/serde/contracts/_module";
import type { ISerializedError } from "@/utilities/_module";

/**
 * @group Errors
 */
export class CacheError
    extends Error
    implements ISerializable<ISerializedError>
{
    static deserialize(deserializedValue: ISerializedError): CacheError {
        return new CacheError(
            deserializedValue.message,
            deserializedValue.cause,
        );
    }

    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = CacheError.name;
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
 * @group Errors
 */
export class UnexpectedCacheError
    extends CacheError
    implements ISerializable<ISerializedError>
{
    static override deserialize(
        deserializedValue: ISerializedError,
    ): CacheError {
        return new UnexpectedCacheError(
            deserializedValue.message,
            deserializedValue.cause,
        );
    }

    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = UnexpectedCacheError.name;
    }
}

/**
 * @group Errors
 */
export class TypeCacheError
    extends CacheError
    implements ISerializable<ISerializedError>
{
    static override deserialize(
        deserializedValue: ISerializedError,
    ): CacheError {
        return new TypeCacheError(
            deserializedValue.message,
            deserializedValue.cause,
        );
    }

    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = TypeCacheError.name;
    }
}

/**
 * @group Errors
 */
export class KeyNotFoundCacheError
    extends CacheError
    implements ISerializable<ISerializedError>
{
    static override deserialize(
        deserializedValue: ISerializedError,
    ): CacheError {
        return new KeyNotFoundCacheError(
            deserializedValue.message,
            deserializedValue.cause,
        );
    }

    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = KeyNotFoundCacheError.name;
    }
}
