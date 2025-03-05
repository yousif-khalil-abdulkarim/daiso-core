/**
 * @module Lock
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ILock } from "@/lock/contracts/lock.contract.js";
import {
    CORE,
    resolveOneOrMore,
    type ISerializedError,
    type OneOrMore,
} from "@/utilities/_module-exports.js";
import type {
    IFlexibleSerde,
    ISerializable,
} from "@/serde/contracts/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/contracts"```
 * @group Errors
 */
export class LockError
    extends Error
    implements ISerializable<ISerializedError>
{
    static deserialize(serializedError: ISerializedError): LockError {
        return new LockError(serializedError.message, serializedError.cause);
    }

    constructor(message: string, cause?: unknown) {
        super(message, { cause });
    }

    serialize(): ISerializedError {
        return {
            cause: this.cause,
            message: this.message,
            name: this.name,
        };
    }
}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/contracts"```
 * @group Errors
 */
export class UnexpectedLockError
    extends LockError
    implements ISerializable<ISerializedError>
{
    static override deserialize(
        serializedError: ISerializedError,
    ): UnexpectedLockError {
        return new UnexpectedLockError(
            serializedError.message,
            serializedError.cause,
        );
    }

    constructor(message: string, cause?: unknown) {
        super(message, { cause });
    }

    override serialize(): ISerializedError {
        return {
            cause: this.cause,
            message: this.message,
            name: this.name,
        };
    }
}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/contracts"```
 * @group Errors
 */
export class UnableToAquireLockError
    extends UnexpectedLockError
    implements ISerializable<ISerializedError>
{
    static override deserialize(
        serializedError: ISerializedError,
    ): UnableToAquireLockError {
        return new UnableToAquireLockError(
            serializedError.message,
            serializedError.cause,
        );
    }

    constructor(message: string, cause?: unknown) {
        super(message, { cause });
    }

    override serialize(): ISerializedError {
        return {
            cause: this.cause,
            message: this.message,
            name: this.name,
        };
    }
}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/contracts"```
 * @group Errors
 */
export class UnableToReleaseLockError
    extends UnexpectedLockError
    implements ISerializable<ISerializedError>
{
    static override deserialize(
        serializedError: ISerializedError,
    ): UnableToReleaseLockError {
        return new UnableToReleaseLockError(
            serializedError.message,
            serializedError.cause,
        );
    }

    constructor(message: string, cause?: unknown) {
        super(message, { cause });
    }

    override serialize(): ISerializedError {
        return {
            cause: this.cause,
            message: this.message,
            name: this.name,
        };
    }
}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/contracts"```
 * @group Errors
 */
export class KeyAlreadyAcquiredLockError
    extends LockError
    implements ISerializable<ISerializedError>
{
    static override deserialize(
        serializedError: ISerializedError,
    ): KeyAlreadyAcquiredLockError {
        return new KeyAlreadyAcquiredLockError(
            serializedError.message,
            serializedError.cause,
        );
    }

    constructor(message: string, cause?: unknown) {
        super(message, { cause });
    }

    override serialize(): ISerializedError {
        return {
            cause: this.cause,
            message: this.message,
            name: this.name,
        };
    }
}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/contracts"```
 * @group Errors
 */
export class UnownedReleaseLockError
    extends LockError
    implements ISerializable<ISerializedError>
{
    static override deserialize(
        serializedError: ISerializedError,
    ): UnownedReleaseLockError {
        return new UnownedReleaseLockError(
            serializedError.message,
            serializedError.cause,
        );
    }

    constructor(message: string, cause?: unknown) {
        super(message, { cause });
    }

    override serialize(): ISerializedError {
        return {
            cause: this.cause,
            message: this.message,
            name: this.name,
        };
    }
}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/contracts"```
 * @group Errors
 */
export class UnownedRefreshLockError
    extends LockError
    implements ISerializable<ISerializedError>
{
    static override deserialize(
        serializedError: ISerializedError,
    ): UnownedRefreshLockError {
        return new UnownedRefreshLockError(
            serializedError.message,
            serializedError.cause,
        );
    }

    constructor(message: string, cause?: unknown) {
        super(message, { cause });
    }

    override serialize(): ISerializedError {
        return {
            cause: this.cause,
            message: this.message,
            name: this.name,
        };
    }
}

/**
 * The <i>registerLockErrorsToSerde</i> function registers all <i>{@link ILock}</i> related errors with <i>IFlexibleSerde</i>, ensuring they will properly be serialized and deserialized.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/contracts"```
 * @group Errors
 */
export function registerLockErrorsToSerde(
    serde: OneOrMore<IFlexibleSerde>,
): void {
    for (const serde_ of resolveOneOrMore(serde)) {
        serde_
            .registerClass(LockError, CORE)
            .registerClass(UnexpectedLockError, CORE)
            .registerClass(UnableToAquireLockError, CORE)
            .registerClass(UnableToReleaseLockError, CORE)
            .registerClass(KeyAlreadyAcquiredLockError, CORE)
            .registerClass(UnownedReleaseLockError, CORE);
    }
}
