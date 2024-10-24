/**
 * @module Serializer
 */

/**
 * @group Contracts
 */
export type ISerializer<TSerialized> = {
    serialize<TValue>(value: TValue): Promise<TSerialized>;
    deserialize<TValue>(value: TSerialized): Promise<TValue>;
};
