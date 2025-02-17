/**
 * @module Serde
 */

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/serde/contracts"```
 * @group Errors
 */
export class SerdeError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = SerdeError.name;
    }
}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/serde/contracts"```
 * @group Errors
 */
export class SerializationError extends SerdeError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = SerializationError.name;
    }
}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/serde/contracts"```
 * @group Errors
 */
export class DeserializationError extends SerdeError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = DeserializationError.name;
    }
}
