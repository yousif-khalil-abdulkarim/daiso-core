/**
 * @module EventBus
 */

/**
 * @group Errors
 */
export class EventBusError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = EventBusError.name;
    }
}

/**
 * @group Errors
 */
export class UnexpectedEventBusError extends EventBusError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = UnexpectedEventBusError.name;
    }
}

/**
 * @group Errors
 */
export class RemoveListenerEventBusError extends UnexpectedEventBusError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = RemoveListenerEventBusError.name;
    }
}

/**
 * @group Errors
 */
export class AddListenerEventBusError extends UnexpectedEventBusError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = AddListenerEventBusError.name;
    }
}

/**
 * @group Errors
 */
export class DispatchEventBusError extends UnexpectedEventBusError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = DispatchEventBusError.name;
    }
}
