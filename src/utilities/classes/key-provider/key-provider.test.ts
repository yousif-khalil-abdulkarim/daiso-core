import { describe, expect, test } from "vitest";
import { KeyProvider } from "@/utilities/classes/key-provider/key-provider.js";

describe("class: KeyProvider", () => {
    const BASE_SETTINGS = {
        identifierDelimeter: ":",
        keyDelimeter: "/",
        keyIdentifier: "_ky",
        rootIdentifier: "_rt",
        groupIdentifier: "_gp",
    };
    describe("method: getGroupPrefix", () => {
        test(`Should match when keyProviderA and KeyProviderB root is ["a", "b"]`, () => {
            const keyProviderA = new KeyProvider(["a", "b"], {
                shouldPrefixKeys: true,
                ...BASE_SETTINGS,
            });
            const keyProviderB = new KeyProvider(["a", "b"], {
                shouldPrefixKeys: true,
                ...BASE_SETTINGS,
            });
            expect(keyProviderA.getGroupPrefix()).toBe(
                keyProviderB.getGroupPrefix(),
            );
        });
        test(`Should match when keyProviderA and keyProviderB root is "a" and group is "b"`, () => {
            const keyProviderA = new KeyProvider("a", {
                group: "b",
                shouldPrefixKeys: true,
                ...BASE_SETTINGS,
            });
            const keyProviderB = new KeyProvider("a", {
                group: "b",
                shouldPrefixKeys: true,
                ...BASE_SETTINGS,
            });
            expect(keyProviderA.getGroupPrefix()).toBe(
                keyProviderB.getGroupPrefix(),
            );
        });
        test(`Should not match when keyProviderA root is ["a", "b"] and KeyProvider root is "a" and group is "b"`, () => {
            const keyProviderA = new KeyProvider(["a", "b"], {
                shouldPrefixKeys: true,
                ...BASE_SETTINGS,
            });
            const keyProviderB = new KeyProvider("a", {
                group: "b",
                shouldPrefixKeys: true,
                ...BASE_SETTINGS,
            });
            expect(keyProviderA.getGroupPrefix()).not.toBe(
                keyProviderB.getGroupPrefix(),
            );
        });
    });
    describe("method: getKeyPrefix", () => {
        test(`Should match when keyProviderA and KeyProviderB root is ["a", "b"]`, () => {
            const keyProviderA = new KeyProvider(["a", "b"], {
                shouldPrefixKeys: true,
                ...BASE_SETTINGS,
            });
            const keyProviderB = new KeyProvider(["a", "b"], {
                shouldPrefixKeys: true,
                ...BASE_SETTINGS,
            });
            expect(keyProviderA.getKeyPrefix()).toBe(
                keyProviderB.getKeyPrefix(),
            );
        });
        test(`Should match when keyProviderA and keyProviderB root is "a" and group is "b"`, () => {
            const keyProviderA = new KeyProvider("a", {
                group: "b",
                shouldPrefixKeys: true,
                ...BASE_SETTINGS,
            });
            const keyProviderB = new KeyProvider("a", {
                group: "b",
                shouldPrefixKeys: true,
                ...BASE_SETTINGS,
            });
            expect(keyProviderA.getKeyPrefix()).toBe(
                keyProviderB.getKeyPrefix(),
            );
        });
        test(`Should not match when keyProviderA root is ["a", "b"] and KeyProvider root is "a" and group is "b"`, () => {
            const keyProviderA = new KeyProvider(["a", "b"], {
                shouldPrefixKeys: true,
                ...BASE_SETTINGS,
            });
            const keyProviderB = new KeyProvider("a", {
                group: "b",
                shouldPrefixKeys: true,
                ...BASE_SETTINGS,
            });
            expect(keyProviderA.getKeyPrefix()).not.toBe(
                keyProviderB.getKeyPrefix(),
            );
        });
        test(`Should return empty string when root is ["a", "b"] and shouldPrefixKeys is false`, () => {
            const keyProvider = new KeyProvider(["a", "b"], {
                shouldPrefixKeys: false,
                ...BASE_SETTINGS,
            });
            expect(keyProvider.getKeyPrefix()).toBe("");
        });
        test(`Should return empty string when root is "a", group is "b" and shouldPrefixKeys is false`, () => {
            const keyProvider = new KeyProvider("a", {
                shouldPrefixKeys: false,
                group: "b",
                ...BASE_SETTINGS,
            });
            expect(keyProvider.getKeyPrefix()).toBe("");
        });
    });
    describe("method: create().prefixed()", () => {
        test(`Should match when keyProviderA and KeyProviderB root is ["a", "b"] and key is "c"`, () => {
            const keyA = new KeyProvider(["a", "b"], {
                shouldPrefixKeys: true,
                ...BASE_SETTINGS,
            }).create("c");
            const keyB = new KeyProvider(["a", "b"], {
                shouldPrefixKeys: true,
                ...BASE_SETTINGS,
            }).create("c");
            expect(keyA.prefixed()).toBe(keyB.prefixed());
        });
        test(`Should match when keyProviderA and keyProviderB root is "a", group is "b" and key is "c"`, () => {
            const keyA = new KeyProvider("a", {
                group: "b",
                shouldPrefixKeys: true,
                ...BASE_SETTINGS,
            }).create("c");
            const keyB = new KeyProvider("a", {
                group: "b",
                shouldPrefixKeys: true,
                ...BASE_SETTINGS,
            }).create("c");
            expect(keyA.prefixed()).toBe(keyB.prefixed());
        });
        test(`Should not match when keyProviderA root is ["a", "b"] and KeyProvider root is "a", group is "b" and key is "c"`, () => {
            const keyA = new KeyProvider(["a", "b"], {
                shouldPrefixKeys: true,
                ...BASE_SETTINGS,
            }).create("c");
            const keyB = new KeyProvider("a", {
                group: "b",
                shouldPrefixKeys: true,
                ...BASE_SETTINGS,
            }).create("c");
            expect(keyA.prefixed()).not.toBe(keyB.prefixed());
        });
        test(`Should not match when keyProviderA and KeyProviderB root is ["a", "b"] and keys are different`, () => {
            const keyA = new KeyProvider(["a", "b"], {
                shouldPrefixKeys: true,
                ...BASE_SETTINGS,
            }).create("c");
            const keyB = new KeyProvider(["a", "b"], {
                shouldPrefixKeys: true,
                ...BASE_SETTINGS,
            }).create("d");
            expect(keyA.prefixed()).not.toBe(keyB.prefixed());
        });
        test(`Should not match when keyProviderA and keyProviderB root is "a", group is "b" and keys are different`, () => {
            const keyA = new KeyProvider("a", {
                group: "b",
                shouldPrefixKeys: true,
                ...BASE_SETTINGS,
            }).create("c");
            const keyB = new KeyProvider("a", {
                group: "b",
                shouldPrefixKeys: true,
                ...BASE_SETTINGS,
            }).create("d");
            expect(keyA.prefixed()).not.toBe(keyB.prefixed());
        });
        test(`Key should start with getKeyPrefix when keyProvider root is ["a", "b"] and key is "c"`, () => {
            const keyProvider = new KeyProvider(["a", "b"], {
                shouldPrefixKeys: true,
                ...BASE_SETTINGS,
            });
            const key = keyProvider.create("c");
            expect(key.prefixed().startsWith(keyProvider.getKeyPrefix())).toBe(
                true,
            );
        });
        test(`Key should start with getKeyPrefix when keyProvider root is "a", group is "b" and key is "c"`, () => {
            const keyProvider = new KeyProvider("a", {
                shouldPrefixKeys: true,
                group: "b",
                ...BASE_SETTINGS,
            });
            const key = keyProvider.create("c");
            expect(key.prefixed().startsWith(keyProvider.getKeyPrefix())).toBe(
                true,
            );
        });
        test(`Key should not start with getKeyPrefix when keyProvider when given different root`, () => {
            const keyProviderA = new KeyProvider(["a", "b"], {
                shouldPrefixKeys: true,
                ...BASE_SETTINGS,
            });
            const keyProviderB = new KeyProvider("a", {
                shouldPrefixKeys: true,
                ...BASE_SETTINGS,
            });
            const key = keyProviderA.create("c");
            expect(key.prefixed().startsWith(keyProviderB.getKeyPrefix())).toBe(
                false,
            );
        });
        test(`Key should not start with getKeyPrefix when keyProvider when given different root and group`, () => {
            const keyProviderA = new KeyProvider("a", {
                shouldPrefixKeys: true,
                group: "b",
                ...BASE_SETTINGS,
            });
            const keyProviderB = new KeyProvider("a", {
                shouldPrefixKeys: true,
                group: "c",
                ...BASE_SETTINGS,
            });
            const key = keyProviderA.create("c");
            expect(key.prefixed().startsWith(keyProviderB.getKeyPrefix())).toBe(
                false,
            );
        });
        test(`Should not prefix key when keyProvider root is ["a", "b"], key is "c" and shouldPrefixKeys is false`, () => {
            const keyProvider = new KeyProvider(["a", "b"], {
                shouldPrefixKeys: false,
                ...BASE_SETTINGS,
            });
            expect(keyProvider.create("a").prefixed()).toBe("a");
            expect(keyProvider.create(["a", "c"]).prefixed()).toBe("a/c");
        });
        test(`Should not prefix key when keyProvider root is "a", group is "b", key is "c" and shouldPrefixKeys is false`, () => {
            const keyProvider = new KeyProvider("a", {
                shouldPrefixKeys: false,
                group: "b",
                ...BASE_SETTINGS,
            });
            expect(keyProvider.create("a").prefixed()).toBe("a");
            expect(keyProvider.create(["a", "b"]).prefixed()).toBe("a/b");
        });
    });
    describe("method: create().resolved()", () => {
        test(`Should not prefix key when keyProvider root is ["a", "b"], key is "c"`, () => {
            const keyProvider = new KeyProvider(["a", "b"], {
                shouldPrefixKeys: true,
                ...BASE_SETTINGS,
            });
            expect(keyProvider.create("a").resolved()).toBe("a");
            expect(keyProvider.create(["a", "c"]).resolved()).toBe("a/c");
        });
        test(`Should not prefix key when keyProvider root is "a", group is "b", key is "c"`, () => {
            const keyProvider = new KeyProvider("a", {
                shouldPrefixKeys: true,
                group: "b",
                ...BASE_SETTINGS,
            });
            expect(keyProvider.create("a").resolved()).toBe("a");
            expect(keyProvider.create(["a", "b"]).resolved()).toBe("a/b");
        });
    });
});
