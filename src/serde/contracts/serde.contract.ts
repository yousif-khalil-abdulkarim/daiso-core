/**
 * @module Serde
 */

import { type IDeserializer } from "@/serde/contracts/deserializer.contract.js";
import { type ISerializer } from "@/serde/contracts/serializer.contract.js";

/**
 * The `ISerde` contract defines a standard way to serialize and deserialize plain data, excluding support for custom classes.
 *
 * IMPORT_PATH: `"@daiso-tech/core/serde/contracts"`
 * @group Contracts
 */
export type ISerde<TSerializedValue = unknown> = ISerializer<TSerializedValue> &
    IDeserializer<TSerializedValue>;
