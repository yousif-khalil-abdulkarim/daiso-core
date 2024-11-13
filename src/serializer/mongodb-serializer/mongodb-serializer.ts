/**
 * @module Serializer
 */

import {
    DeserializationError,
    SerializationError,
    type ISerializer,
} from "@/contracts/serializer/_module";

/**
 * @internal
 */
export class MongodbSerializer implements ISerializer<string | number> {
    constructor(private readonly serializer: ISerializer<string>) {}

    async serialize<TValue>(value: TValue): Promise<string | number> {
        try {
            if (
                typeof value === "number" &&
                !Number.isNaN(value) &&
                Number.isFinite(value)
            ) {
                return value;
            }
            return await this.serializer.serialize(value);
        } catch (error: unknown) {
            throw new SerializationError(
                `Serialization error "${String(error)}" occured`,
                error,
            );
        }
    }

    async deserialize<TValue>(value: string | number): Promise<TValue> {
        try {
            if (typeof value === "number") {
                return value as TValue;
            }
            return await this.serializer.deserialize(value);
        } catch (error: unknown) {
            throw new DeserializationError(
                `Serialization error "${String(error)}" occured`,
                error,
            );
        }
    }
}
