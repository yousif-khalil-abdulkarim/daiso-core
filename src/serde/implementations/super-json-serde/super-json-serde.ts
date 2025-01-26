/**
 * @module Serde
 */

import { getConstructorName } from "@/utilities/_module";
import type {
    ISerdeTransformer,
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
 * @internal
 * @group Adapters
 */
type JSONBuffer = {
    buffer: string;
};

/**
 * The <i>SuperJsonSerde</i> class has direct support for the following values
 * - String
 * - Number
 * - Boolean
 * - Null,
 * - Arrays
 * - Object literals
 * - Date
 * - Map
 * - Set
 * - BigInt
 * - Buffer
 * - Uint8Array
 * - Int8Array
 * - Uint16Array
 * - Int16Array
 * - Uint32Array
 * - Int32Array
 * - Float32Array
 * - Float64Array
 * @group Adapters
 */
export class SuperJsonSerde implements IFlexibleSerde<string> {
    private readonly superJson: SuperJSON = new SuperJSON();

    constructor() {
        this.registerAll();
    }

    registerCustom<TCustomSerialized, TCustomDeserialized>(
        transformer: ISerdeTransformer<TCustomSerialized, TCustomDeserialized>,
    ): IFlexibleSerde<string> {
        this.superJson.registerCustom<TCustomSerialized, any>(
            {
                isApplicable(value) {
                    return transformer.isApplicable(value);
                },
                serialize(deserializedValue) {
                    return transformer.serialize(deserializedValue);
                },
                deserialize(serializedValue) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    return transformer.deserialize(serializedValue);
                },
            },
            transformer.name,
        );
        return this;
    }

    private registerBuffer(): void {
        this.registerCustom<Buffer, any>({
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
                const { buffer } = serializedValue as Record<string, unknown>;
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
            name: Buffer.name,
        });
    }

    private registerUint8Array(): void {
        this.registerCustom<Uint8Array, JSONBuffer>({
            isApplicable(value): value is Uint8Array {
                return value instanceof Uint8Array;
            },
            deserialize(serializedValue) {
                return new Uint8Array(
                    Buffer.from(serializedValue.buffer, "base64"),
                );
            },
            serialize(deserializedValue) {
                return {
                    buffer: Buffer.from(deserializedValue).toString("base64"),
                };
            },
            name: Uint8Array.name,
        });
    }

    private registerInt8Array(): void {
        this.registerCustom<Int8Array, JSONBuffer>({
            isApplicable(value): value is Int8Array {
                return value instanceof Int8Array;
            },
            deserialize(serializedValue) {
                return new Int8Array(
                    Buffer.from(serializedValue.buffer, "base64"),
                );
            },
            serialize(deserializedValue) {
                return {
                    buffer: Buffer.from(deserializedValue).toString("base64"),
                };
            },
            name: Int8Array.name,
        });
    }

    private registerUint16Array(): void {
        this.registerCustom<Uint16Array, JSONBuffer>({
            isApplicable(value): value is Uint16Array {
                return value instanceof Uint16Array;
            },
            deserialize(serializedValue) {
                return new Uint16Array(
                    Buffer.from(serializedValue.buffer, "base64"),
                );
            },
            serialize(deserializedValue) {
                return {
                    buffer: Buffer.from(deserializedValue).toString("base64"),
                };
            },
            name: Uint16Array.name,
        });
    }

    private registerInt16Array(): void {
        this.registerCustom<Int16Array, JSONBuffer>({
            isApplicable(value): value is Int16Array {
                return value instanceof Int16Array;
            },
            deserialize(serializedValue) {
                return new Int16Array(
                    Buffer.from(serializedValue.buffer, "base64"),
                );
            },
            serialize(deserializedValue) {
                return {
                    buffer: Buffer.from(deserializedValue).toString("base64"),
                };
            },
            name: Int16Array.name,
        });
    }

    private registerUint32Array(): void {
        this.registerCustom<Uint32Array, JSONBuffer>({
            isApplicable(value): value is Uint32Array {
                return value instanceof Uint32Array;
            },
            deserialize(serializedValue) {
                return new Uint32Array(
                    Buffer.from(serializedValue.buffer, "base64"),
                );
            },
            serialize(deserializedValue) {
                return {
                    buffer: Buffer.from(deserializedValue).toString("base64"),
                };
            },
            name: Uint32Array.name,
        });
    }

    private registerInt32Array(): void {
        this.registerCustom<Int32Array, JSONBuffer>({
            isApplicable(value): value is Int32Array {
                return value instanceof Int32Array;
            },
            deserialize(serializedValue) {
                return new Int32Array(
                    Buffer.from(serializedValue.buffer, "base64"),
                );
            },
            serialize(deserializedValue) {
                return {
                    buffer: Buffer.from(deserializedValue).toString("base64"),
                };
            },
            name: Int32Array.name,
        });
    }

    private registerFloat32Array(): void {
        this.registerCustom<Float32Array, JSONBuffer>({
            isApplicable(value): value is Float32Array {
                return value instanceof Float32Array;
            },
            deserialize(serializedValue) {
                return new Float32Array(
                    Buffer.from(serializedValue.buffer, "base64"),
                );
            },
            serialize(deserializedValue) {
                return {
                    buffer: Buffer.from(deserializedValue).toString("base64"),
                };
            },
            name: Float32Array.name,
        });
    }

    private registerFloat64Array(): void {
        this.registerCustom<Float64Array, JSONBuffer>({
            isApplicable(value): value is Float64Array {
                return value instanceof Float64Array;
            },
            deserialize(serializedValue) {
                return new Float64Array(
                    Buffer.from(serializedValue.buffer, "base64"),
                );
            },
            serialize(deserializedValue) {
                return {
                    buffer: Buffer.from(deserializedValue).toString("base64"),
                };
            },
            name: Float64Array.name,
        });
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

    registerClass<TSerializedClassInstance>(
        class_: SerializableClass<TSerializedClassInstance>,
    ): IFlexibleSerde<string> {
        return this.registerCustom<
            ISerializable<TSerializedClassInstance>,
            SuperJSONResult["json"]
        >({
            isApplicable(
                value,
            ): value is ISerializable<TSerializedClassInstance> {
                return (
                    value instanceof class_ &&
                    getConstructorName(value) === class_.name
                );
            },
            deserialize(serializedValue) {
                return class_.deserialize(
                    serializedValue as TSerializedClassInstance,
                );
            },
            serialize(deserializedValue) {
                return deserializedValue.serialize() as SuperJSONResult["json"];
            },
            name: class_.name,
        });
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
