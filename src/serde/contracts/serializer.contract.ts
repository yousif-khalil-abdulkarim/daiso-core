/**
 * @module Serde
 */
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    SerializationError,
} from "@/serde/contracts/serde.errors.js";

/**
 * The <i>ISerializer</i> contract defines a standard way to serialize plain data, excluding support for custom classes.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/serde/contracts"```
 * @group Contracts
 */
export type ISerializer<TSerializedValue = unknown> = {
    /**
     * @throws {SerializationError} {@link SerializationError}
     */
    serialize<TValue>(value: TValue): TSerializedValue;
};
