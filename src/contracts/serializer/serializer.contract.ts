export class SerializerError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = SerializerError.name;
    }
}
export class SerializeError extends SerializerError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = SerializeError.name;
    }
}
export class DeserializeError extends SerializerError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = DeserializeError.name;
    }
}
export type ISerializer<TSerializedType> = {
    /**
     * @throws {SerializerError}
     * @throws {SerializeError}
     */
    serialize<TValue>(deserializedValue: TValue): Promise<TSerializedType>;
    /**
     * @throws {SerializerError}
     * @throws {DeserializeError}
     */
    deserialize<TValue>(serializedValue: TSerializedType): Promise<TValue>;
};
