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
export class DefaultDriverNotDefinedError extends FactoryError {
    constructor(factoryName: string) {
        super(`Default driver not set for factory "${factoryName}"`);
        this.name = DefaultDriverNotDefinedError.name;
    }
}

/**
 * @group Errors
 */
export class UnregisteredDriverError extends FactoryError {
    constructor(driverName: string) {
        super(`Unregistered driver "${driverName}"`);
        this.name = UnregisteredDriverError.name;
    }
}
