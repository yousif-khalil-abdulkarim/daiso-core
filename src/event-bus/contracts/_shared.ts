/**
 * @module EventBus
 */

import type { Promisable } from "@/_shared/types";

export type IBaseEvent = {
    type: string;
};
export type Listener<TEvent extends IBaseEvent> = (
    event: TEvent,
) => Promisable<void>;

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
export class RemoveListenerEventBusError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = RemoveListenerEventBusError.name;
    }
}

/**
 * @group Errors
 */
export class AddListenerEventBusError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = AddListenerEventBusError.name;
    }
}

/**
 * @group Errors
 */
export class DispatchEventBusError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = DispatchEventBusError.name;
    }
}
