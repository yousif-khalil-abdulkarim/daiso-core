/**
 * @module Serde
 */
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    SerializationError,
} from "@/serde/contracts/serde.errors.js";

/**
 * The <i>ISerializer</i> contract defines a standard way to serialize plain data, excluding support for custom classes.
 * @group Contracts
 */
export type ISerializer<TSerializedValue = unknown> = {
    /**
     * @throws {SerializationError} {@link SerializationError}
     */
    serialize<TValue>(value: TValue): TSerializedValue;
};
