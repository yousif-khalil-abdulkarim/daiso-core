/**
 * @module Serializer
 */

/**
 * @group Errors
 */
export class SerializerError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = SerializerError.name;
    }
}

/**
 * @group Errors
 */
export class SerializationError extends SerializerError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = SerializationError.name;
    }
}

/**
 * @group Errors
 */
export class DeserializationError extends SerializerError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = DeserializationError.name;
    }
}

/**
 * @group Contracts
 * @throws {SerializerError} {@link SerializerError}
 * @throws {SerializationError} {@link SerializationError}
 * @throws {DeserializationError} {@link DeserializationError}
 */
export type ISerializer<TSerialized = unknown> = {
    /**
     * @throws {SerializationError} {@link SerializationError}
     */
    serialize<TValue>(value: TValue): Promise<TSerialized>;

    /**
     * @throws {DeserializationError} {@link DeserializationError}
     */
    deserialize<TValue>(value: TSerialized): Promise<TValue>;
};
