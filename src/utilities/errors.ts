/**
 * @module Utilities
 */

/**
 * @group Errors
 */
export class FactoryError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = FactoryError.name;
    }
}

/**
 * @group Errors
 */
export class DefaultAdapterNotDefinedError extends FactoryError {
    constructor(factoryName: string) {
        super(`Default adapter not set for factory "${factoryName}"`);
        this.name = DefaultAdapterNotDefinedError.name;
    }
}

/**
 * @group Errors
 */
export class UnregisteredAdapterError extends FactoryError {
    constructor(adapterName: string) {
        super(`Unregistered adapter "${adapterName}"`);
        this.name = UnregisteredAdapterError.name;
    }
}
