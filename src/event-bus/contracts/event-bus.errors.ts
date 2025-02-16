/**
 * @module EventBus
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { IGroupableEventBus } from "@/event-bus/contracts/event-bus.contract";
import type { IFlexibleSerde, ISerializable } from "@/serde/contracts/_module-exports";
import type { ISerializedError, OneOrMore } from "@/utilities/_module-exports";

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
export class UnableToRemoveListenerEventBusError extends UnexpectedEventBusError {
    static override deserialize(
        deserializedValue: ISerializedError,
    ): EventBusError {
        return new UnableToRemoveListenerEventBusError(
            deserializedValue.message,
            deserializedValue.cause,
        );
    }

    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = UnableToRemoveListenerEventBusError.name;
    }
}

/**
 * @group Errors
 */
export class UnableToAddListenerEventBusError extends UnexpectedEventBusError {
    static override deserialize(
        deserializedValue: ISerializedError,
    ): EventBusError {
        return new UnableToAddListenerEventBusError(
            deserializedValue.message,
            deserializedValue.cause,
        );
    }

    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = UnableToAddListenerEventBusError.name;
    }
}

/**
 * @group Errors
 */
export class UnableToDispatchEventBusError extends UnexpectedEventBusError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = UnableToDispatchEventBusError.name;
    }
}

/**
 * The <i>registerEventBusErrors</i> function registers all <i>{@link IGroupableEventBus}</i> related errors with <i>IFlexibleSerde</i>, ensuring they will properly be serialized and deserialized.
 * @group Errors
 */
export function registerEventBusErrors(serde: OneOrMore<IFlexibleSerde>): void {
    if (!Array.isArray(serde)) {
        serde = [serde];
    }
    for (const serde_ of serde) {
        serde_
            .registerClass(EventBusError)
            .registerClass(UnexpectedEventBusError)
            .registerClass(UnableToRemoveListenerEventBusError)
            .registerClass(UnableToAddListenerEventBusError)
            .registerClass(UnableToDispatchEventBusError);
    }
}
