/**
 * @module Serde
 */

import type { ISerializable } from "@/serde/contracts/serializable.contract.js";
import type { ISerde } from "@/serde/contracts/serde.contract.js";
import type { OneOrMore } from "@/utilities/_module-exports.js";
import type { MessageBase } from "@/event-bus/contracts/_module-exports.js";

/**
 * The <i>SerializableClass</i> contract defines standard way to make a class instance serializable and deserializable.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/serde/contracts"```
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
 * IMPORT_PATH: ```"@daiso-tech/core/serde/contracts"```
 * @group Contracts
 */
export type SerializableEventClass<TFields extends Record<string, unknown>> =
    new (fields: any) => MessageBase<TFields>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/serde/contracts"```
 * @group Contracts
 */
export type ISerdeTransformer<TDeserializedValue, TSerializedValue> = {
    name: OneOrMore<string>;

    isApplicable(value: unknown): value is TDeserializedValue;

    deserialize(serializedValue: TSerializedValue): TDeserializedValue;

    serialize(deserializedValue: TDeserializedValue): TSerializedValue;
};

/**
 * The <i>IFlexibleSerde</i> contract defines a standard way to serialize and deserialize both plain data and custom classes.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/serde/contracts"```
 * @group Contracts
 */
export interface IFlexibleSerde<TSerializedValue = unknown>
    extends ISerde<TSerializedValue> {
    /**
     * The <i>registerEvent</i> method is used for registering custom <i>{@link MessageBase}</i> for serialization and deserialization.
     */
    registerEvent<TFields extends Record<string, unknown>>(
        eventClass: SerializableEventClass<TFields>,
        prefix?: OneOrMore<string>,
    ): this;

    /**
     * The <i>registerClass</i> method is used for registering custom class for serialization and deserialization.
     * The <i>class_</i> parameter must be of type <i>{@link SerializableClass}</i>.
     */
    registerClass<TSerializedClassInstance>(
        class_: SerializableClass<TSerializedClassInstance>,
        prefix?: OneOrMore<string>,
    ): this;

    /**
     * The <i>registerCustom</i> method is used for registering custom values for serialization and deserialization.
     */
    registerCustom<TCustomSerialized, TCustomDeserialized>(
        transformer: ISerdeTransformer<TCustomSerialized, TCustomDeserialized>,
        prefix?: OneOrMore<string>,
    ): this;
}
