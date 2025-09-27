import { describe, expect, test } from "vitest";
import { Namespace } from "@/namespace/namespace.js";

describe("class: Namespace", () => {
    const BASE_SETTINGS = {
        identifierDelimeter: ":",
        keyDelimeter: "/",
        keyIdentifier: "_ky",
        rootIdentifier: "_rt",
        groupIdentifier: "_gp",
    };
    test("Should match when namespaceA and namespaceB has same root and same key", () => {
        const keyA = new Namespace(["a", "b"], BASE_SETTINGS).create("c");
        const keyB = new Namespace(["a", "b"], BASE_SETTINGS).create("c");
        expect(keyA.toString()).toBe(keyB.toString());
    });
    test("Should not match when namespaceA and namespaceB has same root and keys are different", () => {
        const keyA = new Namespace(["a", "b"], BASE_SETTINGS).create("c");
        const keyB = new Namespace(["a", "b"], BASE_SETTINGS).create("d");
        expect(keyA.toString()).not.toBe(keyB.toString());
    });
    test("Should match when namespaceA and namespaceB has not same root and same key", () => {
        const keyA = new Namespace(["a", "b"], BASE_SETTINGS).create("c");
        const keyB = new Namespace(["a"], BASE_SETTINGS).create("c");
        expect(keyA.toString()).not.toBe(keyB.toString());
    });
    // NamespaceA a key should not start getKeyPrefix when given different root
    test("NamespaceA a key should not start with namespaced field when given different root", () => {
        const namespaceA = new Namespace(["a", "b"], BASE_SETTINGS);
        const namespaceB = new Namespace("a", BASE_SETTINGS);
        const key = namespaceA.create("c");
        expect(key.toString().startsWith(namespaceB.toString())).toBe(false);
    });
});
