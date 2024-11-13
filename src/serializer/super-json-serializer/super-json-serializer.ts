/**
 * @module Serializer
 */

import {
    DeserializationError,
    SerializationError,
    type ISerializer,
} from "@/contracts/serializer/_module";
import type { SuperJSON } from "superjson";
import type { JSONValue } from "superjson/dist/types";
/**
 * @group Adapters
 */
export type SuperJsonSerializerSettings = {
    dedupe?: boolean;
    registerClass?: (registerClass: SuperJSON["registerClass"]) => void;
    registerSymbol?: (registerClass: SuperJSON["registerSymbol"]) => void;
    registerCustom?: (registerClass: SuperJSON["registerCustom"]) => void;
};
/**
 * @group Adapters
 */
export class SuperJsonSerializer implements ISerializer<string> {
    private superJson: SuperJSON | null = null;
    private dedupe: boolean;
    private registerClass: (registerClass: SuperJSON["registerClass"]) => void;
    private registerSymbol: (
        registerClass: SuperJSON["registerSymbol"],
    ) => void;
    private registerCustom: (
        registerClass: SuperJSON["registerCustom"],
    ) => void;

    constructor({
        dedupe = false,
        registerClass = () => {},
        registerSymbol = () => {},
        registerCustom = () => {},
    }: SuperJsonSerializerSettings = {}) {
        this.registerClass = registerClass;
        this.registerSymbol = registerSymbol;
        this.registerCustom = registerCustom;
        this.dedupe = dedupe;
    }

    private static registerBuffer(superJson: SuperJSON): void {
        superJson.registerCustom<Buffer, JSONValue>(
            {
                isApplicable(value) {
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

    private static registerUint8Array(superJson: SuperJSON): void {
        superJson.registerCustom<Uint8Array, JSONValue>(
            {
                isApplicable(value) {
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

    private static registerInt8Array(superJson: SuperJSON): void {
        superJson.registerCustom<Int8Array, JSONValue>(
            {
                isApplicable(value) {
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

    private static registerUint16Array(superJson: SuperJSON): void {
        superJson.registerCustom<Uint16Array, JSONValue>(
            {
                isApplicable(value) {
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

    private static registerInt16Array(superJson: SuperJSON): void {
        superJson.registerCustom<Int16Array, JSONValue>(
            {
                isApplicable(value) {
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

    private static registerUint32Array(superJson: SuperJSON): void {
        superJson.registerCustom<Uint32Array, JSONValue>(
            {
                isApplicable(value) {
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

    private static registerInt32Array(superJson: SuperJSON): void {
        superJson.registerCustom<Int32Array, JSONValue>(
            {
                isApplicable(value) {
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

    private static registerFloat32Array(superJson: SuperJSON): void {
        superJson.registerCustom<Float32Array, JSONValue>(
            {
                isApplicable(value) {
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

    private static registerFloat64Array(superJson: SuperJSON): void {
        superJson.registerCustom<Float64Array, JSONValue>(
            {
                isApplicable(value) {
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

    private async init(): Promise<SuperJSON> {
        /**
         * The package is esm only so it must be imported dynamically inorder for it to work with both esm and cjs
         */
        const { SuperJSON } = await import("superjson");
        if (this.superJson === null) {
            this.superJson = new SuperJSON({ dedupe: this.dedupe });
            this.registerClass(
                this.superJson.registerClass.bind(this.superJson),
            );
            this.registerSymbol(
                this.superJson.registerSymbol.bind(this.superJson),
            );
            this.registerCustom(
                this.superJson.registerCustom.bind(this.superJson),
            );
            SuperJsonSerializer.registerBuffer(this.superJson);
            SuperJsonSerializer.registerUint8Array(this.superJson);
            SuperJsonSerializer.registerInt8Array(this.superJson);
            SuperJsonSerializer.registerUint16Array(this.superJson);
            SuperJsonSerializer.registerInt16Array(this.superJson);
            SuperJsonSerializer.registerUint32Array(this.superJson);
            SuperJsonSerializer.registerInt32Array(this.superJson);
            SuperJsonSerializer.registerFloat32Array(this.superJson);
            SuperJsonSerializer.registerFloat64Array(this.superJson);
        }
        return this.superJson;
    }

    async serialize<TValue>(value: TValue): Promise<string> {
        try {
            const superJson = await this.init();
            return superJson.stringify(value);
        } catch (error: unknown) {
            throw new SerializationError(
                `Serialization error "${String(error)}" occured`,
                error,
            );
        }
    }

    async deserialize<TValue>(value: string): Promise<TValue> {
        try {
            const superJson = await this.init();
            return (await superJson.parse(value)) as TValue;
        } catch (error: unknown) {
            throw new DeserializationError(
                `Deserialization error "${String(error)}" occured`,
                error,
            );
        }
    }
}
