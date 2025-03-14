/**
 * @module Serde
 */

import type { OneOrMore } from "@/utilities/_module-exports.js";
import {
    getConstructorName,
    resolveOneOrMoreStr,
} from "@/utilities/_module-exports.js";
import type {
    IFlexibleSerde,
    IFlexibleSerdeAdapter,
    ISerdeTransformer,
    ISerializable,
    SerializableClass,
    SerializableEventClass,
} from "@/serde/contracts/_module-exports.js";
import { BaseEvent } from "@/event-bus/contracts/_module-exports.js";
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
} from "@/serde/implementations/derivables/serde-transformers.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/serde/deriavables"```
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
 * <i>Serde</i> class can be derived from any <i>{@link IFlexibleSerdeAdapter}</i>.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/serde/deriavables"```
 * @group Derivables
 */
export class Serde<TSerializedValue>
    implements IFlexibleSerde<TSerializedValue>
{
    /**
     * @example
     * ```ts
     * import type { IFlexibleSerde } from "@daiso-tech/core/serde/contracts";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
     * import { Serde } from "@daiso-tech/core/serde";
     *
     * const serde: IFlexibleSerde = new Serde(new SuperJsonSerdeAdapter());
     * ```
     */
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

    /**
     * @example
     * ```ts
     * import type { IFlexibleSerde } from "@daiso-tech/core/serde/contracts";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
     * import { Serde } from "@daiso-tech/core/serde";
     *
     * const serde: IFlexibleSerde = new Serde(new SuperJsonSerdeAdapter());
     *
     * const value = { a: 1, b: 2 };
     * const serializedValue = serde.serialize(value);
     *
     * // Will print out { a: 1, b: 2} as json string, this because of the SuperJsonSerdeAdapter
     * console.log(serializedValue);
     * ```
     */
    serialize<TValue>(value: TValue): TSerializedValue {
        return this.serdeAdapter.serialize(value);
    }

    /**
     * @example
     * ```ts
     * import type { IFlexibleSerde } from "@daiso-tech/core/serde/contracts";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
     * import { Serde } from "@daiso-tech/core/serde";
     *
     * const serde: IFlexibleSerde = new Serde(new SuperJsonSerdeAdapter());
     *
     * const value = { a: 1, b: 2 };
     * const deserializedValue = serde.deserialize(serde.serialize(value));
     *
     * // Will print out { a: 1, b: 2}
     * console.log(deserializedValue);
     *
     * // Will print false
     * console.log(value === deserializedValue);
     * ```
     */
    deserialize<TValue>(serializedValue: TSerializedValue): TValue {
        return this.serdeAdapter.deserialize(serializedValue);
    }

    /**
     * @example
     * ```ts
     * import type { IFlexibleSerde } from "@daiso-tech/core/serde/contracts";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
     * import { Serde } from "@daiso-tech/core/serde";
     * import { BaseEvent } from "@daiso-tech/core/event-bus/contracts";
     *
     * const serde: IFlexibleSerde = new Serde(new SuperJsonSerdeAdapter());
     *
     * class AddEvent extends BaseEvent<{ a: number; b: number }> {}
     *
     * serde.registerEvent(AddEvent);
     *
     * const event = new AddEvent({ a: 1, b: 2 });
     * const deserializedEvent = serde.deserialize<AddEvent>(serde.serialize(event));
     *
     * // Will print 1
     * console.log(deserializedEvent.fields.a);
     *
     * // Will print 2
     * console.log(deserializedEvent.fields.b);
     *
     * // Will print true
     * console.log(deserializedEvent instanceof AddEvent);
     *
     * // Will print false
     * console.log(event === deserializedEvent);
     * ```
     */
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

    /**
     * @example
     * ```ts
     * import type { IFlexibleSerde } from "@daiso-tech/core/serde/contracts";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
     * import { Serde } from "@daiso-tech/core/serde";
     * import { ISerializable } from "@daiso-tech/core/serde/contracts";
     *
     * const serde: IFlexibleSerde = new Serde(new SuperJsonSerdeAdapter());
     *
     * type ISerializedUser = {
     *   name: string;
     *   age: number
     * };
     *
     * class User implements ISerializable<ISerializedUser> {
     *   static deserialize(serializedUser: ISerializedUser): User {
     *     return new User(serializedUser.name, serializedUser.age);
     *   }
     *
     *   constructor(public readonly name: string, public readonly age: number) {}
     *
     *   serialize(): ISerializedUser {
     *     return {
     *       name: this.name,
     *       age: this.age,
     *     };
     *   }
     * }
     *
     * serde.registerClass(AddEvent);
     *
     * const user = new User("Carl", 30);
     * const deserializedUser = serde.deserialize<User>(serde.serialize(user));
     *
     * // Will print "Carl"
     * console.log(deserializedUser.name);
     *
     * // Will print 30
     * console.log(deserializedUser.age);
     *
     * // Will print true
     * console.log(deserializedUser instanceof User);
     *
     * // Will print false
     * console.log(user === deserializedUser);
     * ```
     */
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

    /**
     * @example
     * ```ts
     * import type { IFlexibleSerde, ISerializable } from "@daiso-tech/core/serde/contracts";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
     * import { Serde } from "@daiso-tech/core/serde";
     *
     * const serde: IFlexibleSerde = new Serde(new SuperJsonSerdeAdapter());
     *
     * type ISerializedUser = {
     *   name: string;
     *   age: number
     * };
     *
     * class User implements ISerializable<ISerializedUser> {
     *   static deserialize(serializedUser: ISerializedUser): User {
     *     return new User(serializedUser.name, serializedUser.age);
     *   }
     *
     *   constructor(public readonly name: string, public readonly age: number) {}
     *
     *   serialize(): ISerializedUser {
     *     return {
     *       name: this.name,
     *       age: this.age,
     *     };
     *   }
     * }
     *
     * serde.registerCustom<User, ISerializedUser>({
     *   name: User.name,
     *   isApplicable: (value): value is User => {
     *     return value instanceof User;
     *   },
     *   serialize: (value: User): ISerializedUser => {
     *     return {
     *       name: value.name,
     *       age: value.age
     *     };
     *   },
     *   deserialize: (value: ISerializedUser): User => {
     *     return new User(value.name, value.age);
     *   }
     * });
     *
     * const user = new User("Carl", 30);
     * const deserializedUser = serde.deserialize<User>(serde.serialize(user));
     *
     * // Will print "Carl"
     * console.log(deserializedUser.name);
     *
     * // Will print 30
     * console.log(deserializedUser.age);
     *
     * // Will print true
     * console.log(deserializedUser instanceof User);
     *
     * // Will print false
     * console.log(user === deserializedUser);
     * ```
     */
    registerCustom<TCustomSerialized, TCustomDeserialized>(
        transformer: ISerdeTransformer<TCustomSerialized, TCustomDeserialized>,
        prefix?: OneOrMore<string>,
    ): this {
        let name = resolveOneOrMoreStr(transformer.name);
        if (prefix !== undefined) {
            name = resolveOneOrMoreStr([resolveOneOrMoreStr(prefix), name]);
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
