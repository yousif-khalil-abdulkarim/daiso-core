/**
 * @module EventBus
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { IEventBus } from "@/event-bus/contracts/event-bus.contract.js";
import type {
    ISerderRegister,
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
 * IMPORT_PATH: `"@daiso-tech/core/event-bus/contracts"`
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
 * IMPORT_PATH: `"@daiso-tech/core/event-bus/contracts"`
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
 * IMPORT_PATH: `"@daiso-tech/core/event-bus/contracts"`
 * @group Errors
 */
export const EVENT_BUS_ERRORS = {
    Base: EventBusError,
    Unexpected: UnexpectedEventBusError,
};

/**
 * The `registerEventBusErrorsToSerde` function registers all {@link IEventBus | `IEventBus`} related errors with `ISerderRegister`, ensuring they will properly be serialized and deserialized.
 *
 * IMPORT_PATH: `"@daiso-tech/core/event-bus/contracts"`
 * @group Errors
 */
export function registerEventBusErrorsToSerde(
    serde: OneOrMore<ISerderRegister>,
): void {
    for (const serde_ of resolveOneOrMore(serde)) {
        serde_
            .registerClass(EventBusError, CORE)
            .registerClass(UnexpectedEventBusError, CORE);
    }
}
