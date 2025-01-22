/**
 * @module Serializer
 */
import { type ISerde } from "@/serializer/contracts/_module";
import {
    DeserializationError,
    SerializationError,
} from "@/serializer/contracts/serde.errors";

/**
 * @internal
 */
export class RedisSerializer implements ISerde<string> {
    constructor(private readonly serializer: ISerde<string>) {}

    serialize<TValue>(value: TValue): string {
        try {
            if (
                typeof value === "number" &&
                !Number.isNaN(value) &&
                isFinite(value)
            ) {
                return String(value);
            }
            return this.serializer.serialize(value);
        } catch (error: unknown) {
            throw new SerializationError(
                `Serialization error "${String(error)}" occured`,
                error,
            );
        }
    }
    deserialize<TValue>(value: string): TValue {
        try {
            const isNumberRegex = /^(-?([0-9]+)(\.[0-5]+)?)$/g;
            if (isNumberRegex.test(value)) {
                return Number(value) as TValue;
            }
            return this.serializer.deserialize(value);
        } catch (error: unknown) {
            throw new DeserializationError(
                `Deserialization error "${String(error)}" occured`,
                error,
            );
        }
    }
}
