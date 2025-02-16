/**
 * @module Serde
 */
import { type ISerde } from "@/serde/contracts/_module-exports.js";
import {
    DeserializationError,
    SerializationError,
} from "@/serde/contracts/serde.errors.js";

/**
 * @internal
 */
export class SqlSerde implements ISerde<string> {
    constructor(private readonly serde: ISerde<string>) {}

    serialize<TValue>(value: TValue): string {
        try {
            if (
                typeof value === "number" &&
                !Number.isNaN(value) &&
                isFinite(value)
            ) {
                return String(value);
            }
            return this.serde.serialize(value);
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
            return this.serde.deserialize(value);
        } catch (error: unknown) {
            throw new DeserializationError(
                `Deserialization error "${String(error)}" occured`,
                error,
            );
        }
    }
}
