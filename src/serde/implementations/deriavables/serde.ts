/**
 * @module Serde
 */

import type { OneOrMore } from "@/utilities/_module-exports";
import { getConstructorName, simplifyOneOrMoreStr } from "@/utilities/_module-exports";
import type {
    IFlexibleSerde,
    IFlexibleSerdeAdapter,
    ISerdeTransformer,
    ISerializable,
    SerializableClass,
    SerializableEventClass,
} from "@/serde/contracts/_module-exports";
import { BaseEvent } from "@/event-bus/contracts/_module-exports";
import {
    ArrayBufferSerdeTransformer,
    BufferSerdeTransformer,
    Uint8ArraySerdeTransformer,
    Int8ArraySerdeTransformer,
    Uint16ArraySerdeTransformer,
    Int16ArraySerdeTransformer,
    Uint32ArraySerdeTransformer,
    Int32ArraySerdeTransformer,
    BigUint64ArraySerdeTransformer,
    BigInt64ArraySerdeTransformer,
    Float32ArraySerdeTransformer,
    Float64ArraySerdeTransformer,
    MapSerdeTransformer,
    SetSerdeTransformer,
    BigIntSerdeTransformer,
    NaNSerdeTransformer,
    InfinitySerdeTransformer,
    UndefinedSerdeTransformer,
    RegExpSerdeTransformer,
    DateSerdeTransformer,
    URLSerdeTransformer,
    URLSearchParamsSerdeTransformer,
} from "@/serde/implementations/deriavables/serde-transformers";

/**
 * @group Derivables
 */
export type SerdeSettings = {
    /**
     * @default {true}
     */
    shouldHandleArrayBuffer?: boolean;

    /**
     * @default {true}
     */
    shouldHandleBuffer?: boolean;

    /**
     * @default {true}
     */
    shouldHandleUint8Array?: boolean;

    /**
     * @default {true}
     */
    shouldHandleInt8Array?: boolean;

    /**
     * @default {true}
     */
    shouldHandleUint16Array?: boolean;

    /**
     * @default {true}
     */
    shouldHandleInt16Array?: boolean;

    /**
     * @default {true}
     */
    shouldHandleUint32Array?: boolean;

    /**
     * @default {true}
     */
    shouldHandleInt32Array?: boolean;

    /**
     * @default {true}
     */
    shouldHandleBigUint64Array?: boolean;

    /**
     * @default {true}
     */
    shouldHandleBigInt64Array?: boolean;

    /**
     * @default {true}
     */
    shouldHandleFloat32Array?: boolean;

    /**
     * @default {true}
     */
    shouldHandleFloat64Array?: boolean;

    /**
     * @default {true}
     */
    shouldHandleMap?: boolean;

    /**
     * @default {true}
     */
    shouldHandleSet?: boolean;

    /**
     * @default {true}
     */
    shouldHandleBigInt?: boolean;

    /**
     * @default {true}
     */
    shouldHandleNaN?: boolean;

    /**
     * @default {true}
     */
    shouldHandleInfinity?: boolean;

    /**
     * @default {true}
     */
    shouldHandleUndefined?: boolean;

    /**
     * @default {true}
     */
    shouldHandleRegExp?: boolean;

    /**
     * @default {true}
     */
    shouldHandleDate?: boolean;

    /**
     * @default {true}
     */
    shouldHandleURL?: boolean;

    /**
     * @default {true}
     */
    shouldHandleURLSearchParams?: boolean;
};

/**
 * @group Derivables
 */
export class Serde<TSerializedValue>
    implements IFlexibleSerde<TSerializedValue>
{
    constructor(
        private readonly serdeAdapter: IFlexibleSerdeAdapter<TSerializedValue>,
        settings: SerdeSettings = {},
    ) {
        const {
            shouldHandleArrayBuffer = true,
            shouldHandleBuffer = true,
            shouldHandleUint8Array = true,
            shouldHandleInt8Array = true,
            shouldHandleUint16Array = true,
            shouldHandleInt16Array = true,
            shouldHandleUint32Array = true,
            shouldHandleInt32Array = true,
            shouldHandleBigUint64Array = true,
            shouldHandleBigInt64Array = true,
            shouldHandleFloat32Array = true,
            shouldHandleFloat64Array = true,
            shouldHandleMap = true,
            shouldHandleSet = true,
            shouldHandleBigInt = true,
            shouldHandleNaN = true,
            shouldHandleInfinity = true,
            shouldHandleRegExp = true,
            shouldHandleDate = true,
            shouldHandleUndefined = true,
            shouldHandleURL = true,
            shouldHandleURLSearchParams = true,
        } = settings;
        if (shouldHandleArrayBuffer) {
            this.registerCustom(new ArrayBufferSerdeTransformer());
        }
        if (shouldHandleBuffer) {
            this.registerCustom(new BufferSerdeTransformer());
        }
        if (shouldHandleUint8Array) {
            this.registerCustom(new Uint8ArraySerdeTransformer());
        }
        if (shouldHandleInt8Array) {
            this.registerCustom(new Int8ArraySerdeTransformer());
        }
        if (shouldHandleUint16Array) {
            this.registerCustom(new Uint16ArraySerdeTransformer());
        }
        if (shouldHandleInt16Array) {
            this.registerCustom(new Int16ArraySerdeTransformer());
        }
        if (shouldHandleUint32Array) {
            this.registerCustom(new Uint32ArraySerdeTransformer());
        }
        if (shouldHandleInt32Array) {
            this.registerCustom(new Int32ArraySerdeTransformer());
        }
        if (shouldHandleBigUint64Array) {
            this.registerCustom(new BigUint64ArraySerdeTransformer());
        }
        if (shouldHandleBigInt64Array) {
            this.registerCustom(new BigInt64ArraySerdeTransformer());
        }
        if (shouldHandleFloat32Array) {
            this.registerCustom(new Float32ArraySerdeTransformer());
        }
        if (shouldHandleFloat64Array) {
            this.registerCustom(new Float64ArraySerdeTransformer());
        }
        if (shouldHandleMap) {
            this.registerCustom(new MapSerdeTransformer());
        }
        if (shouldHandleSet) {
            this.registerCustom(new SetSerdeTransformer());
        }
        if (shouldHandleBigInt) {
            this.registerCustom(new BigIntSerdeTransformer());
        }
        if (shouldHandleNaN) {
            this.registerCustom(new NaNSerdeTransformer());
        }
        if (shouldHandleInfinity) {
            this.registerCustom(new InfinitySerdeTransformer());
        }
        if (shouldHandleUndefined) {
            this.registerCustom(new UndefinedSerdeTransformer());
        }
        if (shouldHandleRegExp) {
            this.registerCustom(new RegExpSerdeTransformer());
        }
        if (shouldHandleDate) {
            this.registerCustom(new DateSerdeTransformer());
        }
        if (shouldHandleURL) {
            this.registerCustom(new URLSerdeTransformer());
        }
        if (shouldHandleURLSearchParams) {
            this.registerCustom(new URLSearchParamsSerdeTransformer());
        }
    }

    serialize<TValue>(value: TValue): TSerializedValue {
        return this.serdeAdapter.serialize(value);
    }

    deserialize<TValue>(serializedValue: TSerializedValue): TValue {
        return this.serdeAdapter.deserialize(serializedValue);
    }

    registerEvent<TFields extends Record<string, unknown>>(
        eventClass: SerializableEventClass<TFields>,
        prefix?: OneOrMore<string>,
    ): this {
        return this.registerCustom<BaseEvent<TFields>, TFields>(
            {
                name: eventClass.name,
                isApplicable(value: unknown): value is BaseEvent<TFields> {
                    return value instanceof BaseEvent;
                },
                serialize(deserializedValue: BaseEvent<TFields>): TFields {
                    return deserializedValue.fields;
                },
                deserialize(serializedValue: TFields): BaseEvent<TFields> {
                    return new eventClass(serializedValue);
                },
            },
            prefix,
        );
    }

    registerClass<TSerializedClassInstance>(
        class_: SerializableClass<TSerializedClassInstance>,
        prefix?: OneOrMore<string>,
    ): this {
        return this.registerCustom<
            ISerializable<TSerializedClassInstance>,
            unknown
        >(
            {
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
                    return deserializedValue.serialize();
                },
                name: class_.name,
            },
            prefix,
        );
    }

    registerCustom<TCustomSerialized, TCustomDeserialized>(
        transformer: ISerdeTransformer<TCustomSerialized, TCustomDeserialized>,
        prefix?: OneOrMore<string>,
    ): this {
        let name = simplifyOneOrMoreStr(transformer.name);
        if (prefix !== undefined) {
            prefix = simplifyOneOrMoreStr(prefix);
            name = simplifyOneOrMoreStr([prefix, name]);
        }
        this.serdeAdapter.registerCustom({
            name,
            isApplicable: (value) => transformer.isApplicable(value),
            serialize: (value) => transformer.serialize(value),
            deserialize: (value) => transformer.deserialize(value),
        });
        return this;
    }
}
