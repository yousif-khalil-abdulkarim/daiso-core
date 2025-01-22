/**
 * @module Serializer
 */

import { type ISerializer } from "@/serializer/contracts/_module";
import {
    DeserializationError,
    SerializationError,
} from "@/serializer/contracts/serde.errors";

/**
 * @internal
 */
export class MongodbSerializer implements ISerializer<string | number> {
    constructor(private readonly serializer: ISerializer<string>) {}

    serialize<TValue>(value: TValue): string | number {
        try {
            if (
                typeof value === "number" &&
                !Number.isNaN(value) &&
                Number.isFinite(value)
            ) {
                return value;
            }
            return this.serializer.serialize(value);
        } catch (error: unknown) {
            throw new SerializationError(
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
            return this.serializer.deserialize(value);
        } catch (error: unknown) {
            throw new DeserializationError(
                `Serialization error "${String(error)}" occured`,
                error,
            );
        }
    }
}
