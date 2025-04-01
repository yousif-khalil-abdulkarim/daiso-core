/**
 * @module Serde
 */

import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    DeserializationSerdeError,
} from "@/serde/contracts/serde.errors.js";

/**
 * The `IDeserializer` contract defines a standard way to deserialize plain data, excluding support for custom classes.
 *
 * IMPORT_PATH: `"@daiso-tech/core/serde/contracts"`
 * @group Contracts
 */
export type IDeserializer<TSerializedValue = unknown> = {
    /**
     * @throws {DeserializationSerdeError} {@link DeserializationSerdeError}
     */
    deserialize<TValue>(serializedValue: TSerializedValue): TValue;
};
