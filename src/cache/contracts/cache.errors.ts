/**
 * @module Cache
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ICache } from "@/cache/contracts/cache.contract.js";
import type {
    ISerderRegister,
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
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
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
 * The error is thrown when attempting to increment or decrement a key that is not of number type.
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
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
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
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
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Errors
 */
export const CACHE_ERRORS = {
    Base: CacheError,
    Type: TypeCacheError,
    KeyNotFound: KeyNotFoundCacheError,
} as const;

/**
 * The `registerCacheErrorsToSerde` function registers all {@link ICache | `ICache`} related errors with `ISerderRegister`, ensuring they will properly be serialized and deserialized.
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Errors
 */
export function registerCacheErrorsToSerde(
    serde: OneOrMore<ISerderRegister>,
): void {
    for (const serde_ of resolveOneOrMore(serde)) {
        serde_
            .registerClass(CacheError, CORE)
            .registerClass(TypeCacheError, CORE)
            .registerClass(KeyNotFoundCacheError, CORE);
    }
}
