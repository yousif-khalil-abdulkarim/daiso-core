/**
 * @module Serde
 */

import { type TestAPI, type ExpectStatic, beforeEach } from "vitest";
import type {
    IFlexibleSerdeAdapter,
    ISerdeTransformerAdapter,
    ISerializable,
} from "@/serde/contracts/_module-exports";

/**
 * @group Utilities
 */
export type FlexibleSerdeAdapterSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    createAdapter: () => IFlexibleSerdeAdapter;
};
/**
 * @group Utilities
 */
export function flexibleSerdeAdapterTestSuite(
    settings: FlexibleSerdeAdapterSuiteSettings,
): void {
    const { expect, test, createAdapter } = settings;
    let flexibleSerdeAdapter: IFlexibleSerdeAdapter;

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
    const array_ = [0, -1, 1, -1.5, 1.5, true, false, "str"];
    const object_ = {
        a: 0,
        b: -1,
        c: 1,
        d: -1.5,
        e: 1.5,
        i: "str",
        j: true,
        l: false,
    };

    beforeEach(() => {
        flexibleSerdeAdapter = createAdapter();
    });
    test("Should work with positive integer", () => {
        const value = 1;
        expect(
            flexibleSerdeAdapter.deserialize(
                flexibleSerdeAdapter.serialize(value),
            ),
        ).toBe(value);
    });
    test("Should work with negative integer", () => {
        const value = -1;
        expect(
            flexibleSerdeAdapter.deserialize(
                flexibleSerdeAdapter.serialize(value),
            ),
        ).toBe(value);
    });
    test("Should work with positive decimal", () => {
        const value = 1.5;
        expect(
            flexibleSerdeAdapter.deserialize(
                flexibleSerdeAdapter.serialize(value),
            ),
        ).toBe(value);
    });
    test("Should work with negative decimal", () => {
        const value = -1.5;
        expect(
            flexibleSerdeAdapter.deserialize(
                flexibleSerdeAdapter.serialize(value),
            ),
        ).toBe(value);
    });
    test("Should work with true", () => {
        const value = true;
        expect(
            flexibleSerdeAdapter.deserialize(
                flexibleSerdeAdapter.serialize(value),
            ),
        ).toBe(value);
    });
    test("Should work with false", () => {
        const value = false;
        expect(
            flexibleSerdeAdapter.deserialize(
                flexibleSerdeAdapter.serialize(value),
            ),
        ).toBe(value);
    });
    test("Should work with string", () => {
        const value = "str";
        expect(
            flexibleSerdeAdapter.deserialize(
                flexibleSerdeAdapter.serialize(value),
            ),
        ).toBe(value);
    });
    test("Should work with array of number, boolean, string, object, array", () => {
        const value = [
            ...array_,
            array_,
            {
                ...object_,
                object_,
                array: [
                    ...array_,
                    array_,
                    {
                        ...object_,
                        object_,
                        array_,
                    },
                ],
            },
        ];
        const deserializedValue = flexibleSerdeAdapter.deserialize(
            flexibleSerdeAdapter.serialize(value),
        );
        expect(deserializedValue).toEqual(value);
    });
    test("Should work with object of number, boolean, string, array, object", () => {
        const value = {
            ...object_,
            object_,
            array: [
                ...array_,
                array_,
                {
                    ...object_,
                    object_,
                    array_,
                },
            ],
        };
        const deserializedValue = flexibleSerdeAdapter.deserialize(
            flexibleSerdeAdapter.serialize(value),
        );
        expect(deserializedValue).toEqual(value);
    });
    test("Should work with custom ISerdeTransformerAdapter", () => {
        const transformer: ISerdeTransformerAdapter<User, SerializedUser> = {
            name: User.name,
            isApplicable(value): value is User {
                return (
                    value instanceof User &&
                    value.constructor.name === User.name
                );
            },
            deserialize(serializedValue) {
                return User.deserialize(serializedValue);
            },
            serialize(deserializedValue) {
                return deserializedValue.serialize();
            },
        };
        flexibleSerdeAdapter.registerCustom(transformer);
    });
}
