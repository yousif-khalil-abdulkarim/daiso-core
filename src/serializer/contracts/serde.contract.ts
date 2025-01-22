/**
 * @module Serializer
 */
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    SerializationError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    DeserializationError,
} from "@/serializer/contracts/serde.errors";

/**
 * @group Contracts
 */
export type ISerializer<TSerialized = unknown> = {
    /**
     * @throws {SerializationError} {@link SerializationError}
     */
    serialize<TValue>(value: TValue): TSerialized;
};

/**
 * @group Contracts
 */
export type IDeserializer<TSerialized = unknown> = {
    /**
     * @throws {DeserializationError} {@link DeserializationError}
     */
    deserialize<TValue>(value: TSerialized): TValue;
};

/**
 * @group Contracts
 */
export type ISerde<TSerialized = unknown> = ISerializer<TSerialized> &
    IDeserializer<TSerialized>;
