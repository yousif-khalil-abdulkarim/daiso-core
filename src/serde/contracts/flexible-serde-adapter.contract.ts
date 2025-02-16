/**
 * @module Serde
 */

import type { ISerde } from "@/serde/contracts/serde.contract.js";

/**
 * @group Contracts
 */
export type ISerdeTransformerAdapter<TDeserializedValue, TSerializedValue> = {
    name: string;

    isApplicable(value: unknown): value is TDeserializedValue;

    deserialize(serializedValue: TSerializedValue): TDeserializedValue;

    serialize(deserializedValue: TDeserializedValue): TSerializedValue;
};

/**
 * The <i>IFlexibleSerdeAdapter</i> contract defines a standard way to serialize and deserialize both plain data and custom classes.
 * @group Contracts
 */
export type IFlexibleSerdeAdapter<TSerializedValue = unknown> =
    ISerde<TSerializedValue> & {
        /**
         * The <i>registerCustom</i> method is used for registering custom values for serialization and deserialization.
         */
        registerCustom<TCustomSerialized, TCustomDeserialized>(
            transformer: ISerdeTransformerAdapter<
                TCustomSerialized,
                TCustomDeserialized
            >,
        ): void;
    };
