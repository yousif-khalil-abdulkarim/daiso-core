/**
 * @module Serde
 */

import type { ISerializer } from "@/serde/contracts/serializer.contract";
import type { IDeserializer } from "@/serde/contracts/deserializer.contract";

/**
 * The <i>ISerde</i> contract defines a standard way to serialize and deserialize plain data, excluding support for custom classes.
 * @group Contracts
 */
export type ISerde<TSerializedValue = unknown> = ISerializer<TSerializedValue> &
    IDeserializer<TSerializedValue>;
