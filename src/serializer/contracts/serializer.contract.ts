/**
 * @module Serializer
 */

/**
 * @group Contracts
 */
export type ISerializer<TSerialized = unknown> = {
    /**
     * @throws {SerializationError} {@link SerializationError}
     */
    serialize<TValue>(value: TValue): PromiseLike<TSerialized>;

    /**
     * @throws {DeserializationError} {@link DeserializationError}
     */
    deserialize<TValue>(value: TSerialized): PromiseLike<TValue>;
};
