/**
 * @module Utilities
 */

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 * @group Errors
 */
export class FactoryError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = FactoryError.name;
    }
}

/**
 * The error occurs when attempting to access the default adapter of the `Factory` class instance, which has not been defined.
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 * @group Errors
 */
export class DefaultAdapterNotDefinedError extends FactoryError {
    constructor(factoryName: string) {
        super(`Default adapter not set for factory "${factoryName}"`);
        this.name = DefaultAdapterNotDefinedError.name;
    }
}

/**
 * The error occurs when attempting to access the an adapter of the `Factory` class instance, which has not been registered.
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 * @group Errors
 */
export class UnregisteredAdapterError extends FactoryError {
    constructor(adapterName: string) {
        super(`Unregistered adapter "${adapterName}"`);
        this.name = UnregisteredAdapterError.name;
    }
}

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 * @group Errors
 */
export class UnexpectedError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = UnexpectedError.name;
    }
}
