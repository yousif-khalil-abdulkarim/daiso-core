/**
 * @module Serializer
 */

/**
 * @group Errors
 */
export class SerdeError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = SerdeError.name;
    }
}

/**
 * @group Errors
 */
export class SerializationError extends SerdeError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = SerializationError.name;
    }
}

/**
 * @group Errors
 */
export class DeserializationError extends SerdeError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = DeserializationError.name;
    }
}
