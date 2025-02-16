import type { ISerdeTransformer } from "@/serde/contracts/_module";
import { getConstructorName, type OneOrMore } from "@/utilities/_module";

/**
 * @internal
 */
type JSONBuffer = {
    buffer: string;
};

/**
 * @internal
 */
export class ArrayBufferSerdeTransformer
    implements ISerdeTransformer<ArrayBuffer, JSONBuffer>
{
    get name(): OneOrMore<string> {
        return ArrayBuffer.name;
    }

    isApplicable(value: unknown): value is ArrayBuffer {
        return (
            value instanceof ArrayBuffer &&
            getConstructorName(value) === ArrayBuffer.name
        );
    }

    deserialize(serializedValue: JSONBuffer): ArrayBuffer {
        return Buffer.from(serializedValue.buffer, "base64").buffer;
    }

    serialize(deserializedValue: ArrayBuffer): JSONBuffer {
        return {
            buffer: Buffer.from(deserializedValue).toString("base64"),
        };
    }
}

/**
 * @internal
 */
export class BufferSerdeTransformer
    implements ISerdeTransformer<Buffer, JSONBuffer>
{
    get name(): OneOrMore<string> {
        return Buffer.name;
    }

    isApplicable(value: unknown): value is Buffer {
        return (
            value instanceof Buffer && getConstructorName(value) === Buffer.name
        );
    }

    deserialize(serializedValue: JSONBuffer): Buffer {
        return Buffer.from(serializedValue.buffer, "base64");
    }

    serialize(deserializedValue: Buffer): JSONBuffer {
        return {
            buffer: deserializedValue.toString("base64"),
        };
    }
}

/**
 * @internal
 */
export class Uint8ArraySerdeTransformer
    implements ISerdeTransformer<Uint8Array, JSONBuffer>
{
    get name(): OneOrMore<string> {
        return Uint8Array.name;
    }

    isApplicable(value: unknown): value is Uint8Array {
        return (
            value instanceof Uint8Array &&
            getConstructorName(value) === Uint8Array.name
        );
    }

    deserialize(serializedValue: JSONBuffer): Uint8Array {
        return new Uint8Array(Buffer.from(serializedValue.buffer, "base64"));
    }

    serialize(deserializedValue: Uint8Array): JSONBuffer {
        return {
            buffer: Buffer.from(deserializedValue).toString("base64"),
        };
    }
}

/**
 * @internal
 */
export class Int8ArraySerdeTransformer
    implements ISerdeTransformer<Int8Array, JSONBuffer>
{
    get name(): OneOrMore<string> {
        return Int8Array.name;
    }

    isApplicable(value: unknown): value is Int8Array {
        return (
            value instanceof Int8Array &&
            getConstructorName(value) === Int8Array.name
        );
    }

    deserialize(serializedValue: JSONBuffer): Int8Array {
        return new Int8Array(Buffer.from(serializedValue.buffer, "base64"));
    }

    serialize(deserializedValue: Int8Array): JSONBuffer {
        return {
            buffer: Buffer.from(deserializedValue).toString("base64"),
        };
    }
}

/**
 * @internal
 */
export class Uint16ArraySerdeTransformer
    implements ISerdeTransformer<Uint16Array, JSONBuffer>
{
    get name(): OneOrMore<string> {
        return Uint16Array.name;
    }

    isApplicable(value: unknown): value is Uint16Array {
        return (
            value instanceof Uint16Array &&
            getConstructorName(value) === Uint16Array.name
        );
    }

    deserialize(serializedValue: JSONBuffer): Uint16Array {
        return new Uint16Array(Buffer.from(serializedValue.buffer, "base64"));
    }

    serialize(deserializedValue: Uint16Array): JSONBuffer {
        return {
            buffer: Buffer.from(deserializedValue).toString("base64"),
        };
    }
}

/**
 * @internal
 */
export class Int16ArraySerdeTransformer
    implements ISerdeTransformer<Int16Array, JSONBuffer>
{
    get name(): OneOrMore<string> {
        return Int16Array.name;
    }

    isApplicable(value: unknown): value is Int16Array {
        return (
            value instanceof Int16Array &&
            getConstructorName(value) === Int16Array.name
        );
    }

    deserialize(serializedValue: JSONBuffer): Int16Array {
        return new Int16Array(Buffer.from(serializedValue.buffer, "base64"));
    }

    serialize(deserializedValue: Int16Array): JSONBuffer {
        return {
            buffer: Buffer.from(deserializedValue).toString("base64"),
        };
    }
}

/**
 * @internal
 */
export class Uint32ArraySerdeTransformer
    implements ISerdeTransformer<Uint32Array, JSONBuffer>
{
    get name(): OneOrMore<string> {
        return Uint32Array.name;
    }

    isApplicable(value: unknown): value is Uint32Array {
        return (
            value instanceof Uint32Array &&
            getConstructorName(value) === Uint32Array.name
        );
    }

    deserialize(serializedValue: JSONBuffer): Uint32Array {
        return new Uint32Array(Buffer.from(serializedValue.buffer, "base64"));
    }

    serialize(deserializedValue: Uint32Array): JSONBuffer {
        return {
            buffer: Buffer.from(deserializedValue).toString("base64"),
        };
    }
}

/**
 * @internal
 */
export class Int32ArraySerdeTransformer
    implements ISerdeTransformer<Int32Array, JSONBuffer>
{
    get name(): OneOrMore<string> {
        return Int32Array.name;
    }

    isApplicable(value: unknown): value is Int32Array {
        return (
            value instanceof Int32Array &&
            getConstructorName(value) === Int32Array.name
        );
    }

    deserialize(serializedValue: JSONBuffer): Int32Array {
        return new Int32Array(Buffer.from(serializedValue.buffer, "base64"));
    }

    serialize(deserializedValue: Int32Array): JSONBuffer {
        return {
            buffer: Buffer.from(deserializedValue).toString("base64"),
        };
    }
}

/**
 * @internal
 */
export class BigUint64ArraySerdeTransformer
    implements ISerdeTransformer<BigUint64Array, JSONBuffer>
{
    get name(): OneOrMore<string> {
        return BigUint64Array.name;
    }

    isApplicable(value: unknown): value is BigUint64Array {
        return (
            value instanceof BigUint64Array &&
            getConstructorName(value) === BigUint64Array.name
        );
    }

    deserialize(serializedValue: JSONBuffer): BigUint64Array {
        return new BigUint64Array(
            Buffer.from(serializedValue.buffer, "base64").buffer,
        );
    }

    serialize(deserializedValue: BigUint64Array): JSONBuffer {
        return {
            buffer: Buffer.from(deserializedValue.buffer).toString("base64"),
        };
    }
}

/**
 * @internal
 */
export class BigInt64ArraySerdeTransformer
    implements ISerdeTransformer<BigInt64Array, JSONBuffer>
{
    get name(): OneOrMore<string> {
        return BigInt64Array.name;
    }

    isApplicable(value: unknown): value is BigInt64Array {
        return (
            value instanceof BigInt64Array &&
            getConstructorName(value) === BigInt64Array.name
        );
    }

    deserialize(serializedValue: JSONBuffer): BigInt64Array {
        return new BigInt64Array(
            Buffer.from(serializedValue.buffer, "base64").buffer,
        );
    }

    serialize(deserializedValue: BigInt64Array): JSONBuffer {
        return {
            buffer: Buffer.from(deserializedValue.buffer).toString("base64"),
        };
    }
}

/**
 * @internal
 */
export class Float32ArraySerdeTransformer
    implements ISerdeTransformer<Float32Array, JSONBuffer>
{
    get name(): OneOrMore<string> {
        return Float32Array.name;
    }

    isApplicable(value: unknown): value is Float32Array {
        return (
            value instanceof Float32Array &&
            getConstructorName(value) === Float32Array.name
        );
    }

    deserialize(serializedValue: JSONBuffer): Float32Array {
        return new Float32Array(Buffer.from(serializedValue.buffer, "base64"));
    }

    serialize(deserializedValue: Float32Array): JSONBuffer {
        return {
            buffer: Buffer.from(deserializedValue).toString("base64"),
        };
    }
}

/**
 * @internal
 */
export class Float64ArraySerdeTransformer
    implements ISerdeTransformer<Float64Array, JSONBuffer>
{
    get name(): OneOrMore<string> {
        return Float64Array.name;
    }

    isApplicable(value: unknown): value is Float64Array {
        return (
            value instanceof Float64Array &&
            getConstructorName(value) === Float64Array.name
        );
    }

    deserialize(serializedValue: JSONBuffer): Float64Array {
        return new Float64Array(Buffer.from(serializedValue.buffer, "base64"));
    }

    serialize(deserializedValue: Float64Array): JSONBuffer {
        return {
            buffer: Buffer.from(deserializedValue).toString("base64"),
        };
    }
}

/**
 * @internal
 */
export class MapSerdeTransformer
    implements
        ISerdeTransformer<Map<unknown, unknown>, Array<[unknown, unknown]>>
{
    get name(): OneOrMore<string> {
        return Map.name;
    }

    isApplicable(value: unknown): value is Map<unknown, unknown> {
        return value instanceof Map && getConstructorName(value) === Map.name;
    }

    deserialize(
        serializedValue: Array<[unknown, unknown]>,
    ): Map<unknown, unknown> {
        return new Map(serializedValue);
    }

    serialize(
        deserializedValue: Map<unknown, unknown>,
    ): Array<[unknown, unknown]> {
        return [...deserializedValue.entries()];
    }
}

/**
 * @internal
 */
export class SetSerdeTransformer
    implements ISerdeTransformer<Set<unknown>, Array<unknown>>
{
    get name(): OneOrMore<string> {
        return Set.name;
    }

    isApplicable(value: unknown): value is Set<unknown> {
        return value instanceof Set && getConstructorName(value) === Set.name;
    }

    deserialize(serializedValue: Array<unknown>): Set<unknown> {
        return new Set(serializedValue);
    }

    serialize(deserializedValue: Set<unknown>): Array<unknown> {
        return [...deserializedValue.values()];
    }
}

/**
 * @internal
 */
export class BigIntSerdeTransformer
    implements ISerdeTransformer<bigint, string>
{
    get name(): OneOrMore<string> {
        return BigInt.name;
    }

    isApplicable(value: unknown): value is bigint {
        return typeof value === "bigint";
    }

    deserialize(serializedValue: string): bigint {
        return BigInt(serializedValue);
    }

    serialize(deserializedValue: bigint): string {
        return deserializedValue.toString();
    }
}

/**
 * @internal
 */
export class NaNSerdeTransformer implements ISerdeTransformer<number, string> {
    get name(): OneOrMore<string> {
        return NaN.toString();
    }

    isApplicable(value: unknown): value is number {
        return typeof value === "number" && Number.isNaN(value);
    }

    deserialize(serializedValue: string): number {
        return Number(serializedValue);
    }

    serialize(deserializedValue: number): string {
        return deserializedValue.toString();
    }
}

/**
 * @internal
 */
export class InfinitySerdeTransformer
    implements ISerdeTransformer<number, string>
{
    get name(): OneOrMore<string> {
        return Infinity.toString();
    }

    isApplicable(value: unknown): value is number {
        return typeof value === "number" && !Number.isFinite(value);
    }

    deserialize(serializedValue: string): number {
        return Number(serializedValue);
    }

    serialize(deserializedValue: number): string {
        return deserializedValue.toString();
    }
}

/**
 * @internal
 */
export class UndefinedSerdeTransformer
    implements ISerdeTransformer<undefined, string>
{
    get name(): OneOrMore<string> {
        return "undefined";
    }

    isApplicable(value: unknown): value is undefined {
        return value === undefined;
    }

    deserialize(_serializedValue: string): undefined {
        return undefined;
    }

    serialize(deserializedValue: undefined): string {
        return String(deserializedValue);
    }
}

/**
 * @internal
 */
export class RegExpSerdeTransformer
    implements ISerdeTransformer<RegExp, string>
{
    get name(): OneOrMore<string> {
        return RegExp.name;
    }

    isApplicable(value: unknown): value is RegExp {
        return (
            value instanceof RegExp && getConstructorName(value) === RegExp.name
        );
    }

    deserialize(serializedValue: string): RegExp {
        const body = serializedValue.slice(1, serializedValue.lastIndexOf("/"));
        const flags = serializedValue.slice(
            serializedValue.lastIndexOf("/") + 1,
        );
        return new RegExp(body, flags);
    }

    serialize(deserializedValue: RegExp): string {
        return deserializedValue.toString();
    }
}

/**
 * @internal
 */
export class DateSerdeTransformer implements ISerdeTransformer<Date, number> {
    get name(): OneOrMore<string> {
        return Date.name;
    }

    isApplicable(value: unknown): value is Date {
        return value instanceof Date && getConstructorName(value) === Date.name;
    }

    deserialize(serializedValue: number): Date {
        return new Date(serializedValue);
    }

    serialize(deserializedValue: Date): number {
        return deserializedValue.getTime();
    }
}

/**
 * @internal
 */
export class URLSerdeTransformer implements ISerdeTransformer<URL, string> {
    get name(): OneOrMore<string> {
        return URL.name;
    }

    isApplicable(value: unknown): value is URL {
        return value instanceof URL && getConstructorName(value) === URL.name;
    }

    deserialize(serializedValue: string): URL {
        return new URL(serializedValue);
    }

    serialize(deserializedValue: URL): string {
        return deserializedValue.toString();
    }
}

/**
 * @internal
 */
export class URLSearchParamsSerdeTransformer
    implements ISerdeTransformer<URLSearchParams, Array<[string, string]>>
{
    get name(): OneOrMore<string> {
        return URLSearchParams.name;
    }

    isApplicable(value: unknown): value is URLSearchParams {
        return (
            value instanceof URLSearchParams &&
            getConstructorName(value) === URLSearchParams.name
        );
    }

    deserialize(serializedValue: Array<[string, string]>): URLSearchParams {
        return new URLSearchParams(serializedValue);
    }

    serialize(deserializedValue: URLSearchParams): Array<[string, string]> {
        return [...deserializedValue.entries()];
    }
}
