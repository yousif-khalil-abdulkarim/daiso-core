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
