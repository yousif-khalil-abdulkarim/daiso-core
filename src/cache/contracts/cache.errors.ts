/**
 * @module Cache
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { IGroupableCache } from "@/cache/contracts/cache.contract.js";
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
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
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
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
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
 * The error is thrown when attempting to increment or decrement a key that is not of number type.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
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
 * The error is thrown when a key is not found
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
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

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Errors
 */
export const CACHE_ERRORS = {
    Base: CacheError,
    Unexpected: UnexpectedCacheError,
    Type: TypeCacheError,
    KeyNotFound: KeyNotFoundCacheError,
} as const;

/**
 * The <i>registerCacheErrorsToSerde</i> function registers all <i>{@link IGroupableCache}</i> related errors with <i>IFlexibleSerde</i>, ensuring they will properly be serialized and deserialized.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Errors
 */
export function registerCacheErrorsToSerde(
    serde: OneOrMore<IFlexibleSerde>,
): void {
    for (const serde_ of resolveOneOrMore(serde)) {
        serde_
            .registerClass(CacheError, CORE)
            .registerClass(UnexpectedCacheError, CORE)
            .registerClass(TypeCacheError, CORE)
            .registerClass(KeyNotFoundCacheError, CORE);
    }
}
