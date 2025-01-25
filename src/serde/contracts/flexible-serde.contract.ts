import type { ISerializable } from "@/serde/contracts/serializable.contract";
import type { ISerde } from "@/serde/contracts/serde.contract";

/**
 * The <i>SerializableClass</i> contract defines standard way to make a class instance serializable and deserializable.
 * @group Contracts
 */
export type SerializableClass<TSerializedValue> = {
    new (...arguments_: any[]): ISerializable<TSerializedValue>;
    deserialize(
        serializedValue: TSerializedValue,
    ): ISerializable<TSerializedValue>;
};

/**
 * The <i>IFlexibleSerde</i> contract defines a standard way to serialize and deserialize both plain data and custom classes.
 * @group Contracts
 */
export type IFlexibleSerde<TSerializedValue = unknown> =
    ISerde<TSerializedValue> & {
        /**
         * The <i>registerClass</i> method is used for registering custom class for serialization and deserialization.
         * The <i>class_</i> parameter must be of type <i>{@link SerializableClass}</i>.
         * @example
         * ```ts
         * import type { IFlexibleSerde } from "@daiso-tech/core";
         *
         * type SerializedUser = {
         *   name: string;
         *   age: number;
         * };
         *
         * class User implements ISerializable<SerializedUser> {
         *   static deserialize(serializedUser: SerializedUser): User {
         *     return new User(serializedUser.name, serializedUser.age);
         *   }
         *
         *   constructor(public readonly name: string, public readonly age: number) {}
         *
         *   getInfo(): string {
         *     return `name: ${this.name}, age: ${this.age}`;
         *   }
         * }
         *
         * function main(serde: IFlexibleSerde) {
         *   // You must register the class before trying to serialize or deserialize it.
         *   serde.registerClass(User);
         *
         *   const user = serde.deserialize(serde.serialize(new User("Jacob", 50)));
         *
         *   console.log(user.getInfo());
         *   // "name: Jacob, age: 50"
         * }
         *
         * ```
         */
        registerClass<TSerializedClassInstance>(
            class_: SerializableClass<TSerializedClassInstance>,
        ): IFlexibleSerde<TSerializedValue>;
    };
