/**
 * @module Serde
 */

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/serde/contracts"`
 * @group Errors
 */
export class SerdeError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = SerdeError.name;
    }
}

/**
 * The error occurs when a value is unable to be serialized.
 *
 * IMPORT_PATH: `"@daiso-tech/core/serde/contracts"`
 * @group Errors
 */
export class SerializationSerdeError extends SerdeError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = SerializationSerdeError.name;
    }
}

/**
 * The error occurs when a value is unable to be deserialized.
 *
 * IMPORT_PATH: `"@daiso-tech/core/serde/contracts"`
 * @group Errors
 */
export class DeserializationSerdeError extends SerdeError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = DeserializationSerdeError.name;
    }
}

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/serde/contracts"`
 * @group Errors
 */
export const SERDE_ERRORS = {
    Base: SerdeError,
    Serialization: SerializationSerdeError,
    Deserialization: DeserializationSerdeError,
} as const;
