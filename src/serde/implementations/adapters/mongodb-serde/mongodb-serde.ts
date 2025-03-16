/**
 * @module Serde
 */

import {
    type ISerde,
    DeserializationSerdeError,
    SerializationSerdeError,
} from "@/serde/contracts/_module-exports.js";

/**
 * @internal
 */
export class MongodbSerde implements ISerde<string | number> {
    constructor(private readonly serde: ISerde<string>) {}

    serialize<TValue>(value: TValue): string | number {
        try {
            if (
                typeof value === "number" &&
                !Number.isNaN(value) &&
                Number.isFinite(value)
            ) {
                return value;
            }
            return this.serde.serialize(value);
        } catch (error: unknown) {
            throw new SerializationSerdeError(
                `Serialization error "${String(error)}" occured`,
                error,
            );
        }
    }

    deserialize<TValue>(value: string | number): TValue {
        try {
            if (typeof value === "number") {
                return value as TValue;
            }
            return this.serde.deserialize(value);
        } catch (error: unknown) {
            throw new DeserializationSerdeError(
                `Serialization error "${String(error)}" occured`,
                error,
            );
        }
    }
}
