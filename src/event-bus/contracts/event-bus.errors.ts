/**
 * @module EventBus
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { IGroupableEventBus } from "@/event-bus/contracts/event-bus.contract.js";
import type {
    IFlexibleSerde,
    ISerializable,
} from "@/serde/contracts/_module-exports.js";
import {
    CORE,
    resolveOneOrMore,
    type ISerializedError,
    type OneOrMore,
} from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/contracts"```
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
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/contracts"```
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
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/contracts"```
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
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/contracts"```
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
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/contracts"```
 * @group Errors
 */
export class UnableToDispatchEventBusError extends UnexpectedEventBusError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = UnableToDispatchEventBusError.name;
    }
}

/**
 * The <i>registerEventBusErrorsToSerde</i> function registers all <i>{@link IGroupableEventBus}</i> related errors with <i>IFlexibleSerde</i>, ensuring they will properly be serialized and deserialized.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/contracts"```
 * @group Errors
 */
export function registerEventBusErrorsToSerde(
    serde: OneOrMore<IFlexibleSerde>,
): void {
    for (const serde_ of resolveOneOrMore(serde)) {
        serde_
            .registerClass(EventBusError, CORE)
            .registerClass(UnexpectedEventBusError, CORE)
            .registerClass(UnableToRemoveListenerEventBusError, CORE)
            .registerClass(UnableToAddListenerEventBusError, CORE)
            .registerClass(UnableToDispatchEventBusError, CORE);
    }
}
