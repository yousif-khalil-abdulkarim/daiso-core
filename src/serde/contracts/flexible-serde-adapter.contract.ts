/**
 * @module Serde
 */

import type { ISerde } from "@/serde/contracts/serde.contract.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/serde/contracts"```
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
 *
 * IMPORT_PATH: ```"@daiso-tech/core/serde/contracts"```
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
