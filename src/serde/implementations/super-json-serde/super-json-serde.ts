/**
 * @module Serde
 */

import type {
    ISerializable,
    SerializableClass,
} from "@/serde/contracts/_module";
import { type IFlexibleSerde } from "@/serde/contracts/_module";
import {
    DeserializationError,
    SerializationError,
} from "@/serde/contracts/serde.errors";
import { SuperJSON } from "superjson-cjs";
import type { SuperJSONResult } from "superjson-cjs/dist/index";

/**
 * @group Adapters
 */
export class SuperJsonSerde implements IFlexibleSerde<string> {
    private readonly superJson: SuperJSON = new SuperJSON();

    constructor() {
        this.registerAll();
    }

    private registerBuffer(): void {
        this.superJson.registerCustom<Buffer, any>(
            {
                isApplicable(value: any): value is Buffer {
                    return value instanceof Buffer;
                },
                deserialize(serializedValue) {
                    const isObject =
                        !Array.isArray(serializedValue) &&
                        typeof serializedValue === "object" &&
                        serializedValue !== null;
                    if (!isObject) {
                        throw new DeserializationError(
                            "Serialized value is not object",
                        );
                    }
                    const { buffer } = serializedValue as Record<
                        string,
                        unknown
                    >;
                    if (typeof buffer !== "string") {
                        throw new DeserializationError(
                            "Serialized value is not a string",
                        );
                    }
                    return Buffer.from(buffer, "base64");
                },
                serialize(deserializedValue) {
                    return {
                        buffer: deserializedValue.toString("base64"),
                    };
                },
            },
            Buffer.name,
        );
    }

    private registerUint8Array(): void {
        this.superJson.registerCustom<Uint8Array, any>(
            {
                isApplicable(value): value is Uint8Array {
                    return value instanceof Uint8Array;
                },
                deserialize(serializedValue) {
                    const isObject =
                        !Array.isArray(serializedValue) &&
                        typeof serializedValue === "object" &&
                        serializedValue !== null;
                    if (!isObject) {
                        throw new DeserializationError(
                            "Serialized value is not object",
                        );
                    }
                    const { buffer } = serializedValue as Record<
                        string,
                        unknown
                    >;
                    if (typeof buffer !== "string") {
                        throw new DeserializationError(
                            "Serialized value is not a string",
                        );
                    }
                    return new Uint8Array(Buffer.from(buffer, "base64"));
                },
                serialize(deserializedValue) {
                    return {
                        buffer: Buffer.from(deserializedValue).toString(
                            "base64",
                        ),
                    };
                },
            },
            Uint8Array.name,
        );
    }

    private registerInt8Array(): void {
        this.superJson.registerCustom<Int8Array, any>(
            {
                isApplicable(value): value is Int8Array {
                    return value instanceof Int8Array;
                },
                deserialize(serializedValue) {
                    const isObject =
                        !Array.isArray(serializedValue) &&
                        typeof serializedValue === "object" &&
                        serializedValue !== null;
                    if (!isObject) {
                        throw new DeserializationError(
                            "Serialized value is not object",
                        );
                    }
                    const { buffer } = serializedValue as Record<
                        string,
                        unknown
                    >;
                    if (typeof buffer !== "string") {
                        throw new DeserializationError(
                            "Serialized value is not a string",
                        );
                    }
                    return new Int8Array(Buffer.from(buffer, "base64"));
                },
                serialize(deserializedValue) {
                    return {
                        buffer: Buffer.from(deserializedValue).toString(
                            "base64",
                        ),
                    };
                },
            },
            Int8Array.name,
        );
    }

    private registerUint16Array(): void {
        this.superJson.registerCustom<Uint16Array, any>(
            {
                isApplicable(value): value is Uint16Array {
                    return value instanceof Uint16Array;
                },
                deserialize(serializedValue) {
                    const isObject =
                        !Array.isArray(serializedValue) &&
                        typeof serializedValue === "object" &&
                        serializedValue !== null;
                    if (!isObject) {
                        throw new DeserializationError(
                            "Serialized value is not object",
                        );
                    }
                    const { buffer } = serializedValue as Record<
                        string,
                        unknown
                    >;
                    if (typeof buffer !== "string") {
                        throw new DeserializationError(
                            "Serialized value is not a string",
                        );
                    }
                    return new Uint16Array(Buffer.from(buffer, "base64"));
                },
                serialize(deserializedValue) {
                    return {
                        buffer: Buffer.from(deserializedValue).toString(
                            "base64",
                        ),
                    };
                },
            },
            Uint16Array.name,
        );
    }

    private registerInt16Array(): void {
        this.superJson.registerCustom<Int16Array, any>(
            {
                isApplicable(value): value is Int16Array {
                    return value instanceof Int16Array;
                },
                deserialize(serializedValue) {
                    const isObject =
                        !Array.isArray(serializedValue) &&
                        typeof serializedValue === "object" &&
                        serializedValue !== null;
                    if (!isObject) {
                        throw new DeserializationError(
                            "Serialized value is not object",
                        );
                    }
                    const { buffer } = serializedValue as Record<
                        string,
                        unknown
                    >;
                    if (typeof buffer !== "string") {
                        throw new DeserializationError(
                            "Serialized value is not a string",
                        );
                    }
                    return new Int16Array(Buffer.from(buffer, "base64"));
                },
                serialize(deserializedValue) {
                    return {
                        buffer: Buffer.from(deserializedValue).toString(
                            "base64",
                        ),
                    };
                },
            },
            Int16Array.name,
        );
    }

    private registerUint32Array(): void {
        this.superJson.registerCustom<Uint32Array, any>(
            {
                isApplicable(value): value is Uint32Array {
                    return value instanceof Uint32Array;
                },
                deserialize(serializedValue) {
                    const isObject =
                        !Array.isArray(serializedValue) &&
                        typeof serializedValue === "object" &&
                        serializedValue !== null;
                    if (!isObject) {
                        throw new DeserializationError(
                            "Serialized value is not object",
                        );
                    }
                    const { buffer } = serializedValue as Record<
                        string,
                        unknown
                    >;
                    if (typeof buffer !== "string") {
                        throw new DeserializationError(
                            "Serialized value is not a string",
                        );
                    }
                    return new Uint32Array(Buffer.from(buffer, "base64"));
                },
                serialize(deserializedValue) {
                    return {
                        buffer: Buffer.from(deserializedValue).toString(
                            "base64",
                        ),
                    };
                },
            },
            Uint32Array.name,
        );
    }

    private registerInt32Array(): void {
        this.superJson.registerCustom<Int32Array, any>(
            {
                isApplicable(value): value is Int32Array {
                    return value instanceof Int32Array;
                },
                deserialize(serializedValue) {
                    const isObject =
                        !Array.isArray(serializedValue) &&
                        typeof serializedValue === "object" &&
                        serializedValue !== null;
                    if (!isObject) {
                        throw new DeserializationError(
                            "Serialized value is not object",
                        );
                    }
                    const { buffer } = serializedValue as Record<
                        string,
                        unknown
                    >;
                    if (typeof buffer !== "string") {
                        throw new DeserializationError(
                            "Serialized value is not a string",
                        );
                    }
                    return new Int32Array(Buffer.from(buffer, "base64"));
                },
                serialize(deserializedValue) {
                    return {
                        buffer: Buffer.from(deserializedValue).toString(
                            "base64",
                        ),
                    };
                },
            },
            Int32Array.name,
        );
    }

    private registerFloat32Array(): void {
        this.superJson.registerCustom<Float32Array, any>(
            {
                isApplicable(value): value is Float32Array {
                    return value instanceof Float32Array;
                },
                deserialize(serializedValue) {
                    const isObject =
                        !Array.isArray(serializedValue) &&
                        typeof serializedValue === "object" &&
                        serializedValue !== null;
                    if (!isObject) {
                        throw new DeserializationError(
                            "Serialized value is not object",
                        );
                    }
                    const { buffer } = serializedValue as Record<
                        string,
                        unknown
                    >;
                    if (typeof buffer !== "string") {
                        throw new DeserializationError(
                            "Serialized value is not a string",
                        );
                    }
                    return new Float32Array(Buffer.from(buffer, "base64"));
                },
                serialize(deserializedValue) {
                    return {
                        buffer: Buffer.from(deserializedValue).toString(
                            "base64",
                        ),
                    };
                },
            },
            Float32Array.name,
        );
    }

    private registerFloat64Array(): void {
        this.superJson.registerCustom<Float64Array, any>(
            {
                isApplicable(value): value is Float64Array {
                    return value instanceof Float64Array;
                },
                deserialize(serializedValue) {
                    const isObject =
                        !Array.isArray(serializedValue) &&
                        typeof serializedValue === "object" &&
                        serializedValue !== null;
                    if (!isObject) {
                        throw new DeserializationError(
                            "Serialized value is not object",
                        );
                    }
                    const { buffer } = serializedValue as Record<
                        string,
                        unknown
                    >;
                    if (typeof buffer !== "string") {
                        throw new DeserializationError(
                            "Serialized value is not a string",
                        );
                    }
                    return new Float64Array(Buffer.from(buffer, "base64"));
                },
                serialize(deserializedValue) {
                    return {
                        buffer: Buffer.from(deserializedValue).toString(
                            "base64",
                        ),
                    };
                },
            },
            Float64Array.name,
        );
    }

    private registerAll(): void {
        this.registerBuffer();
        this.registerUint8Array();
        this.registerInt8Array();
        this.registerUint16Array();
        this.registerInt16Array();
        this.registerUint32Array();
        this.registerInt32Array();
        this.registerFloat32Array();
        this.registerFloat64Array();
    }

    registerClass<TSerializedValue>(
        class_: SerializableClass<TSerializedValue>,
    ): void {
        this.superJson.registerCustom<
            ISerializable<TSerializedValue>,
            SuperJSONResult["json"]
        >(
            {
                isApplicable(value) {
                    return value instanceof class_;
                },
                deserialize(serializedValue) {
                    return class_.deserialize(
                        serializedValue as TSerializedValue,
                    );
                },
                serialize(value) {
                    return value.serialize() as SuperJSONResult["json"];
                },
            },
            Float64Array.name,
        );
    }

    serialize<TValue>(value: TValue): string {
        try {
            return this.superJson.stringify(value);
        } catch (error: unknown) {
            throw new SerializationError(
                `Serialization error "${String(error)}" occured`,
                error,
            );
        }
    }

    deserialize<TValue>(value: string): TValue {
        try {
            return this.superJson.parse(value);
        } catch (error: unknown) {
            throw new DeserializationError(
                `Deserialization error "${String(error)}" occured`,
                error,
            );
        }
    }
}
