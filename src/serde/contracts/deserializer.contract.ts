/**
 * @module Serde
 */

import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    DeserializationError,
} from "@/serde/contracts/serde.errors";

/**
 * The <i>IDeserializer</i> contract defines a standard way to deserialize plain data, excluding support for custom classes.
 * @group Contracts
 */
export type IDeserializer<TSerializedValue = unknown> = {
    /**
     * @throws {DeserializationError} {@link DeserializationError}
     */
    deserialize<TValue>(serializedValue: TSerializedValue): TValue;
};
