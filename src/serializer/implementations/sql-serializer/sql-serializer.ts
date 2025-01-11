/**
 * @module Serializer
 */
import { type ISerializer } from "@/serializer/contracts/_module";
import {
    DeserializationError,
    SerializationError,
} from "@/serializer/contracts/serializer.errors";

/**
 * @internal
 */
export class SqlSerializer implements ISerializer<string> {
    constructor(private readonly serializer: ISerializer<string>) {}

    async serialize<TValue>(value: TValue): Promise<string> {
        try {
            if (
                typeof value === "number" &&
                !Number.isNaN(value) &&
                isFinite(value)
            ) {
                return String(value);
            }
            return await this.serializer.serialize(value);
        } catch (error: unknown) {
            throw new SerializationError(
                `Serialization error "${String(error)}" occured`,
                error,
            );
        }
    }
    async deserialize<TValue>(value: string): Promise<TValue> {
        try {
            const isNumberRegex = /^(-?([0-9]+)(\.[0-5]+)?)$/g;
            if (isNumberRegex.test(value)) {
                return Number(value) as TValue;
            }
            return await this.serializer.deserialize(value);
        } catch (error: unknown) {
            throw new DeserializationError(
                `Deserialization error "${String(error)}" occured`,
                error,
            );
        }
    }
}
