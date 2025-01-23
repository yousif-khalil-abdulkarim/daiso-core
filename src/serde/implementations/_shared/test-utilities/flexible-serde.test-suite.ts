/**
 * @module Serde
 */

import { type TestAPI, type ExpectStatic, beforeEach } from "vitest";
import type { IFlexibleSerde, ISerializable } from "@/serde/contracts/_module";
import { serdeTestSuite } from "@/serde/implementations/_shared/test-utilities/serde.test-suite";

/**
 * @group Utilities
 */
export type FlexibleSerdeSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    createAdapter: () => IFlexibleSerde;
};
/**
 * @group Utilities
 */
export function flexibleSerdeTestSuite(
    settings: FlexibleSerdeSuiteSettings,
): void {
    const { expect, test, createAdapter } = settings;
    let flexibleSerde: IFlexibleSerde;
    beforeEach(() => {
        flexibleSerde = createAdapter();
    });
    serdeTestSuite(settings);

    type SerializedUser = {
        name: string;
        age: number;
    };
    class User implements ISerializable<SerializedUser> {
        static deserialize(serializedUser: SerializedUser): User {
            return new User(serializedUser.name, serializedUser.age);
        }

        constructor(
            public readonly name: string,
            public readonly age: number,
        ) {}

        serialize(): SerializedUser {
            return {
                name: this.name,
                age: this.age,
            };
        }

        getInfo(): string {
            return `name: ${this.name}, age: ${this.age.toString()}`;
        }
    }
    class ExtendedUser extends User {
        static override deserialize(
            serializedUser: SerializedUser,
        ): ExtendedUser {
            return new ExtendedUser(serializedUser.name, serializedUser.age);
        }
    }

    test("Should work with custom registerd classes", () => {
        flexibleSerde.registerClass(User);
        const user = new User("Abra", 20);
        const deserializedValue: User = flexibleSerde.deserialize(
            flexibleSerde.serialize(user),
        );
        expect(deserializedValue).toBeInstanceOf(User);
        expect(deserializedValue.getInfo()).toBe("name: Abra, age: 20");
    });
    test("Should work with custom registerd classes that is extended", () => {
        flexibleSerde.registerClass(ExtendedUser);
        const user = new ExtendedUser("Abra", 20);
        const deserializedValue: ExtendedUser = flexibleSerde.deserialize(
            flexibleSerde.serialize(user),
        );
        expect(deserializedValue).toBeInstanceOf(ExtendedUser);
        expect(deserializedValue.getInfo()).toBe("name: Abra, age: 20");
    });
}
