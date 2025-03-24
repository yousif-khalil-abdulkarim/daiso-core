import { describe, expect, test } from "vitest";
import { KeyPrefixer } from "@/utilities/classes/key-prefixer/key-prefixer.js";

describe("class: KeyPrefixer", () => {
    const BASE_SETTINGS = {
        identifierDelimeter: ":",
        keyDelimeter: "/",
        keyIdentifier: "_ky",
        rootIdentifier: "_rt",
        groupIdentifier: "_gp",
    };
    test("Should match when keyPrefixerA and KeyPrefixerB has same root and same key", () => {
        const keyA = new KeyPrefixer(["a", "b"], BASE_SETTINGS).create("c");
        const keyB = new KeyPrefixer(["a", "b"], BASE_SETTINGS).create("c");
        expect(keyA.prefixed).toBe(keyB.prefixed);
    });
    test("Should not match when keyPrefixerA and KeyPrefixerB has same root and keys are different", () => {
        const keyA = new KeyPrefixer(["a", "b"], BASE_SETTINGS).create("c");
        const keyB = new KeyPrefixer(["a", "b"], BASE_SETTINGS).create("d");
        expect(keyA.prefixed).not.toBe(keyB.prefixed);
    });
    test("Should match when keyPrefixerA and KeyPrefixerB has not same root and same key", () => {
        const keyA = new KeyPrefixer(["a", "b"], BASE_SETTINGS).create("c");
        const keyB = new KeyPrefixer(["a"], BASE_SETTINGS).create("c");
        expect(keyA.prefixed).not.toBe(keyB.prefixed);
    });
    // KeyPrefixerA a key should not start getKeyPrefix when given different root
    test("KeyPrefixerA a key should not start getKeyPrefix when given different root", () => {
        const keyPrefixerA = new KeyPrefixer(["a", "b"], BASE_SETTINGS);
        const keyPrefixerB = new KeyPrefixer("a", BASE_SETTINGS);
        const key = keyPrefixerA.create("c");
        expect(key.prefixed.startsWith(keyPrefixerB.keyPrefix)).toBe(false);
    });
});
