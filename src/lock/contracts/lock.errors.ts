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
    ISerderRegister,
    ISerializable,
} from "@/serde/contracts/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
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
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
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
 * The error is thrown when trying to acquire a lock that is owned by a different owner.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
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
 * The error is thrown when trying to release a lock that is owned by a different owner.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
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
 * The error is thrown when trying to referesh a lock that is owned by a different owner.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
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
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Errors
 */
export const LOCK_ERRORS = {
    Base: LockError,
    Unexpected: UnexpectedLockError,
    KeyAlreadyAcquired: KeyAlreadyAcquiredLockError,
    UnownedRelease: UnownedReleaseLockError,
} as const;

/**
 * The `registerLockErrorsToSerde` function registers all {@link ILock | `ILock`} related errors with `IFlexibleSerde`, ensuring they will properly be serialized and deserialized.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Errors
 */
export function registerLockErrorsToSerde(
    serde: OneOrMore<ISerderRegister>,
): void {
    for (const serde_ of resolveOneOrMore(serde)) {
        serde_
            .registerClass(LockError, CORE)
            .registerClass(UnexpectedLockError, CORE)
            .registerClass(KeyAlreadyAcquiredLockError, CORE)
            .registerClass(UnownedReleaseLockError, CORE);
    }
}
