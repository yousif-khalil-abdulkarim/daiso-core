/**
 * @module Serde
 */

/**
 * The <i>ISerializable</i> contract defines standard way to make a class instance serializable.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/serde/contracts"```
 * @group Contracts
 */
export type ISerializable<TSerializedValue> = {
    serialize(): TSerializedValue;
};
