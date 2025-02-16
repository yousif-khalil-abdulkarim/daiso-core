/**
 * @module Cache
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { IGroupableCache } from "@/cache/contracts/cache.contract.js";
import type {
    IFlexibleSerde,
    ISerializable,
} from "@/serde/contracts/_module-exports.js";
import type {
    ISerializedError,
    OneOrMore,
} from "@/utilities/_module-exports.js";

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

/**
 * The <i>registerCacheErrors</i> function registers all <i>{@link IGroupableCache}</i> related errors with <i>IFlexibleSerde</i>, ensuring they will properly be serialized and deserialized.
 * @group Errors
 */
export function registerCacheErrors(serde: OneOrMore<IFlexibleSerde>): void {
    if (!Array.isArray(serde)) {
        serde = [serde];
    }
    for (const serde_ of serde) {
        serde_
            .registerClass(CacheError)
            .registerClass(UnexpectedCacheError)
            .registerClass(TypeCacheError)
            .registerClass(KeyNotFoundCacheError);
    }
}
