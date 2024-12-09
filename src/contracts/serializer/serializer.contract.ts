import type {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    SerializationError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    SerializerError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    DeserializationError,
} from "@/contracts/serializer/_shared";

/**
 * @group Contracts
 * @throws {SerializerError} {@link SerializerError}
 * @throws {SerializationError} {@link SerializationError}
 * @throws {DeserializationError} {@link DeserializationError}
 */
export type ISerializer<TSerialized = unknown> = {
    /**
     * @throws {SerializationError} {@link SerializationError}
     */
    serialize<TValue>(value: TValue): Promise<TSerialized>;

    /**
     * @throws {DeserializationError} {@link DeserializationError}
     */
    deserialize<TValue>(value: TSerialized): Promise<TValue>;
};
