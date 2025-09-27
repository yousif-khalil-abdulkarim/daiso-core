import { describe, expect, test } from "vitest";
import { Namespace } from "@/utilities/classes/namespace/namespace.js";

describe("class: Namespace", () => {
    const BASE_SETTINGS = {
        identifierDelimeter: ":",
        keyDelimeter: "/",
        keyIdentifier: "_ky",
        rootIdentifier: "_rt",
        groupIdentifier: "_gp",
    };
    test("Should match when namespaceA and namespaceB has same root and same key", () => {
        const keyA = new Namespace(["a", "b"], BASE_SETTINGS)
            ._internal_get()
            .create("c");
        const keyB = new Namespace(["a", "b"], BASE_SETTINGS)
            ._internal_get()
            .create("c");
        expect(keyA.namespaced).toBe(keyB.namespaced);
    });
    test("Should not match when namespaceA and namespaceB has same root and keys are different", () => {
        const keyA = new Namespace(["a", "b"], BASE_SETTINGS)
            ._internal_get()
            .create("c");
        const keyB = new Namespace(["a", "b"], BASE_SETTINGS)
            ._internal_get()
            .create("d");
        expect(keyA.namespaced).not.toBe(keyB.namespaced);
    });
    test("Should match when namespaceA and namespaceB has not same root and same key", () => {
        const keyA = new Namespace(["a", "b"], BASE_SETTINGS)
            ._internal_get()
            .create("c");
        const keyB = new Namespace(["a"], BASE_SETTINGS)
            ._internal_get()
            .create("c");
        expect(keyA.namespaced).not.toBe(keyB.namespaced);
    });
    // NamespaceA a key should not start getKeyPrefix when given different root
    test("NamespaceA a key should not start with namespaced field when given different root", () => {
        const namespaceA = new Namespace(["a", "b"], BASE_SETTINGS);
        const namespaceB = new Namespace("a", BASE_SETTINGS);
        const key = namespaceA._internal_get().create("c");
        expect(
            key.namespaced.startsWith(namespaceB._internal_get().namespaced),
        ).toBe(false);
    });
});
