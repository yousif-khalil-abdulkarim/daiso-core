/**
 * @module Serde
 */

import type { ISerializable } from "@/serde/contracts/serializable.contract.js";
import type { ISerde } from "@/serde/contracts/serde.contract.js";
import type { OneOrMore } from "@/utilities/_module-exports.js";

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
export type ISerdeTransformer<TDeserializedValue, TSerializedValue> = {
    name: OneOrMore<string>;

    isApplicable(value: unknown): value is TDeserializedValue;

    deserialize(serializedValue: TSerializedValue): TDeserializedValue;

    serialize(deserializedValue: TDeserializedValue): TSerializedValue;
};

/**
 * The `ISerderRegister` contract defines a standard way to register custom serialization and deserialization logic.
 *
 * IMPORT_PATH: `"@daiso-tech/core/serde/contracts"`
 * @group Contracts
 */
export interface ISerderRegister {
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

/**
 * The `IFlexibleSerde` contract defines a standard way to serialize and deserialize both plain data and custom classes.
 *
 * IMPORT_PATH: `"@daiso-tech/core/serde/contracts"`
 * @group Contracts
 */
export type IFlexibleSerde<TSerializedValue = unknown> =
    ISerde<TSerializedValue> & ISerderRegister;
