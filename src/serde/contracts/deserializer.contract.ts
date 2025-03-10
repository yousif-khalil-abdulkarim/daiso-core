/**
 * @module Serde
 */

import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    DeserializationError,
} from "@/serde/contracts/serde.errors.js";

/**
 * The <i>IDeserializer</i> contract defines a standard way to deserialize plain data, excluding support for custom classes.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/serde/contracts"```
 * @group Contracts
 */
export type IDeserializer<TSerializedValue = unknown> = {
    /**
     * @throws {DeserializationError} {@link DeserializationError}
     */
    deserialize<TValue>(serializedValue: TSerializedValue): TValue;
};
