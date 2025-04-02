/**
 * @module Serde
 */

import type { ISerializable } from "@/serde/contracts/serializable.contract.js";
import type { ISerde } from "@/serde/contracts/serde.contract.js";
import type { OneOrMore } from "@/utilities/_module-exports.js";
import type { BaseEvent } from "@/event-bus/contracts/_module-exports.js";

/**
 * The `SerializableClass` contract defines standard way to make a class instance serializable and deserializable.
 *
 * IMPORT_PATH: `"@daiso-tech/core/serde/contracts"`
 * @group Contracts
 */
export type SerializableClass<TSerializedValue> = {
    new (...arguments_: any[]): ISerializable<TSerializedValue>;
    deserialize(
        serializedValue: TSerializedValue,
    ): ISerializable<TSerializedValue>;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/serde/contracts"`
 * @group Contracts
 */
export type SerializableEventClass<TFields extends Record<string, unknown>> =
    new (fields: any) => BaseEvent<TFields>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/serde/contracts"`
 * @group Contracts
 */
export type ISerdeTransformer<TDeserializedValue, TSerializedValue> = {
    name: OneOrMore<string>;

    isApplicable(value: unknown): value is TDeserializedValue;

    deserialize(serializedValue: TSerializedValue): TDeserializedValue;

    serialize(deserializedValue: TDeserializedValue): TSerializedValue;
};

/**
 * The `IFlexibleSerde` contract defines a standard way to serialize and deserialize both plain data and custom classes.
 *
 * IMPORT_PATH: `"@daiso-tech/core/serde/contracts"`
 * @group Contracts
 */
export interface IFlexibleSerde<TSerializedValue = unknown>
    extends ISerde<TSerializedValue> {
    /**
     * The `registerEvent` method is used for registering custom {@link BaseEvent | `BaseEvent`} for serialization and deserialization.
     */
    registerEvent<TFields extends Record<string, unknown>>(
        eventClass: SerializableEventClass<TFields>,
        prefix?: OneOrMore<string>,
    ): this;

    /**
     * The `registerClass` method is used for registering custom class for serialization and deserialization.
     * The `class_` parameter must be of type {@link SerializableClass | `SerializableClass`}.
     */
    registerClass<TSerializedClassInstance>(
        class_: SerializableClass<TSerializedClassInstance>,
        prefix?: OneOrMore<string>,
    ): this;

    /**
     * The `registerCustom` method is used for registering custom values for serialization and deserialization.
     */
    registerCustom<TCustomDeserialized, TCustomSerialized>(
        transformer: ISerdeTransformer<TCustomDeserialized, TCustomSerialized>,
        prefix?: OneOrMore<string>,
    ): this;
}
