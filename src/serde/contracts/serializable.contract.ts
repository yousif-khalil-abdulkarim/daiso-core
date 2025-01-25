/**
 * @module Serde
 */

/**
 * The <i>ISerializable</i> contract defines standard way to make a class instance serializable.
 * @group Contracts
 */
export type ISerializable<TSerializedValue> = {
    serialize(): TSerializedValue;
};
