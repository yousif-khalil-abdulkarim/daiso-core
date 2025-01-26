/**
 * @module EventBus
 */

import type { ISerializable } from "@/serde/contracts/_module";
import type { ISerializedError } from "@/utilities/_module";

/**
 * @group Errors
 */
export class EventBusError
    extends Error
    implements ISerializable<ISerializedError>
{
    static deserialize(deserializedValue: ISerializedError): EventBusError {
        return new EventBusError(
            deserializedValue.message,
            deserializedValue.cause,
        );
    }

    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = EventBusError.name;
    }

    serialize(): ISerializedError {
        return {
            name: this.name,
            message: this.message,
            cause: this.cause,
        };
    }
}

/**
 * @group Errors
 */
export class UnexpectedEventBusError extends EventBusError {
    static override deserialize(
        deserializedValue: ISerializedError,
    ): EventBusError {
        return new UnexpectedEventBusError(
            deserializedValue.message,
            deserializedValue.cause,
        );
    }

    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = UnexpectedEventBusError.name;
    }
}

/**
 * @group Errors
 */
export class RemoveListenerEventBusError extends UnexpectedEventBusError {
    static override deserialize(
        deserializedValue: ISerializedError,
    ): EventBusError {
        return new RemoveListenerEventBusError(
            deserializedValue.message,
            deserializedValue.cause,
        );
    }

    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = RemoveListenerEventBusError.name;
    }
}

/**
 * @group Errors
 */
export class AddListenerEventBusError extends UnexpectedEventBusError {
    static override deserialize(
        deserializedValue: ISerializedError,
    ): EventBusError {
        return new AddListenerEventBusError(
            deserializedValue.message,
            deserializedValue.cause,
        );
    }

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
