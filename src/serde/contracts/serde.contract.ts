/**
 * @module Serde
 */
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    SerializationError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    DeserializationError,
} from "@/serde/contracts/serde.errors";

/**
 * @group Contracts
 */
export type ISerializer<TSerializedValue = unknown> = {
    /**
     * @throws {SerializationError} {@link SerializationError}
     */
    serialize<TValue>(value: TValue): TSerializedValue;
};

/**
 * @group Contracts
 */
export type IDeserde<TSerializedValue = unknown> = {
    /**
     * @throws {DeserializationError} {@link DeserializationError}
     */
    deserialize<TValue>(serializedValue: TSerializedValue): TValue;
};

/**
 * @group Contracts
 */
export type ISerde<TSerializedValue = unknown> = ISerializer<TSerializedValue> &
    IDeserde<TSerializedValue>;

/**
 * @group Contracts
 */
export type ISerializable<TSerializedValue> = {
    serialize(): TSerializedValue;
};

/**
 * @group Contracts
 */
export type SerializableClass<TSerializedValue, TValue> = {
    new (...arguments_: any[]): ISerializable<TSerializedValue>;
    deserialize(serializedValue: TSerializedValue): TValue;
};

/**
 * @group Contracts
 */
export type IFlexibleSerde<TSerializedValue = unknown> =
    ISerde<TSerializedValue> & {
        registerClass<TValue>(
            class_: SerializableClass<TSerializedValue, TValue>,
        ): void;
    };
