/* eslint-disable @typescript-eslint/require-await */
import {
    SerializeError,
    DeserializeError,
    type ISerializer,
} from "@/contracts/serializer/_module";

export class StringSerializer implements ISerializer<string> {
    async serialize<TValue>(deserializedValue: TValue): Promise<string> {
        try {
            if (
                Array.isArray(deserializedValue) ||
                typeof deserializedValue === "object"
            ) {
                return JSON.stringify(deserializedValue);
            }
            if (typeof deserializedValue === "number") {
                return String(deserializedValue);
            }
            return `str:${String(deserializedValue)}`;
        } catch (error: unknown) {
            throw new SerializeError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async deserialize<TValue>(serializedValue: string): Promise<TValue> {
        try {
            if (serializedValue === "false") {
                return false as TValue;
            }
            if (serializedValue === "true") {
                return true as TValue;
            }
            const isNumberRegex = /^([0-9]+)(\.[0-9]+)?$/;
            if (isNumberRegex.test(serializedValue)) {
                return Number(serializedValue) as TValue;
            }
            try {
                return JSON.parse(serializedValue) as TValue;
            } catch {
                /* Empty */
            }
            return serializedValue.slice(4) as TValue;
        } catch (error: unknown) {
            throw new DeserializeError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }
}
