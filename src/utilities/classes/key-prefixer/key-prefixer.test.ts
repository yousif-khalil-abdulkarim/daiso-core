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
    describe("method: getGroupPrefix", () => {
        test(`Should match when keyPrefixerA and KeyPrefixerB root is ["a", "b"]`, () => {
            const keyPrefixerA = new KeyPrefixer(
                ["a", "b"],
                BASE_SETTINGS,
            ).disablePrefix();
            const keyPrefixerB = new KeyPrefixer(
                ["a", "b"],
                BASE_SETTINGS,
            ).disablePrefix();
            expect(keyPrefixerA.getGroupPrefix()).toBe(
                keyPrefixerB.getGroupPrefix(),
            );
        });
        test(`Should match when keyPrefixerA and keyPrefixerB root is "a" and group is "b"`, () => {
            const keyPrefixerA = new KeyPrefixer("a", BASE_SETTINGS).withGroup(
                "b",
            );
            const keyPrefixerB = new KeyPrefixer("a", BASE_SETTINGS).withGroup(
                "b",
            );
            expect(keyPrefixerA.getGroupPrefix()).toBe(
                keyPrefixerB.getGroupPrefix(),
            );
        });
        test(`Should not match when keyPrefixerA root is ["a", "b"] and KeyPrefixer root is "a" and group is "b"`, () => {
            const keyPrefixerA = new KeyPrefixer(
                ["a", "b"],
                BASE_SETTINGS,
            ).disablePrefix();
            const keyPrefixerB = new KeyPrefixer("a", BASE_SETTINGS).withGroup(
                "b",
            );
            expect(keyPrefixerA.getGroupPrefix()).not.toBe(
                keyPrefixerB.getGroupPrefix(),
            );
        });
    });
    describe("method: getKeyPrefix", () => {
        test(`Should match when keyPrefixerA and KeyPrefixerB root is ["a", "b"]`, () => {
            const keyPrefixerA = new KeyPrefixer(
                ["a", "b"],
                BASE_SETTINGS,
            ).disablePrefix();
            const keyPrefixerB = new KeyPrefixer(
                ["a", "b"],
                BASE_SETTINGS,
            ).disablePrefix();
            expect(keyPrefixerA.getKeyPrefix()).toBe(
                keyPrefixerB.getKeyPrefix(),
            );
        });
        test(`Should match when keyPrefixerA and keyPrefixerB root is "a" and group is "b"`, () => {
            const keyPrefixerA = new KeyPrefixer("a", BASE_SETTINGS).withGroup(
                "b",
            );
            const keyPrefixerB = new KeyPrefixer("a", BASE_SETTINGS).withGroup(
                "b",
            );
            expect(keyPrefixerA.getKeyPrefix()).toBe(
                keyPrefixerB.getKeyPrefix(),
            );
        });
        test(`Should not match when keyPrefixerA root is ["a", "b"] and KeyPrefixer root is "a" and group is "b"`, () => {
            const keyPrefixerA = new KeyPrefixer(
                ["a", "b"],
                BASE_SETTINGS,
            ).disablePrefix();
            const keyPrefixerB = new KeyPrefixer("a", BASE_SETTINGS).withGroup(
                "b",
            );
            expect(keyPrefixerA.getKeyPrefix()).not.toBe(
                keyPrefixerB.getKeyPrefix(),
            );
        });
        test(`Should return empty string when root is ["a", "b"] and prefixing is disabled`, () => {
            const keyPrefixer = new KeyPrefixer(
                ["a", "b"],
                BASE_SETTINGS,
            ).disablePrefix();
            expect(keyPrefixer.getKeyPrefix()).toBe("");
        });
        test(`Should return empty string when root is "a", group is "b" and prefixing is disabled`, () => {
            const keyPrefixer = new KeyPrefixer("a", BASE_SETTINGS)
                .disablePrefix()
                .withGroup("b");
            expect(keyPrefixer.getKeyPrefix()).toBe("");
        });
    });
    describe("method: create().prefixed()", () => {
        test(`Should match when keyPrefixerA and KeyPrefixerB root is ["a", "b"] and key is "c"`, () => {
            const keyA = new KeyPrefixer(["a", "b"], BASE_SETTINGS).create("c");
            const keyB = new KeyPrefixer(["a", "b"], BASE_SETTINGS).create("c");
            expect(keyA.prefixed()).toBe(keyB.prefixed());
        });
        test(`Should match when keyPrefixerA and keyPrefixerB root is "a", group is "b" and key is "c"`, () => {
            const keyA = new KeyPrefixer("a", BASE_SETTINGS)
                .withGroup("b")

                .create("c");
            const keyB = new KeyPrefixer("a", BASE_SETTINGS)
                .withGroup("b")

                .create("c");
            expect(keyA.prefixed()).toBe(keyB.prefixed());
        });
        test(`Should not match when keyPrefixerA root is ["a", "b"] and KeyPrefixer root is "a", group is "b" and key is "c"`, () => {
            const keyA = new KeyPrefixer(["a", "b"], BASE_SETTINGS).create("c");
            const keyB = new KeyPrefixer("a", BASE_SETTINGS)
                .withGroup("b")

                .create("c");
            expect(keyA.prefixed()).not.toBe(keyB.prefixed());
        });
        test(`Should not match when keyPrefixerA and KeyPrefixerB root is ["a", "b"] and keys are different`, () => {
            const keyA = new KeyPrefixer(["a", "b"], BASE_SETTINGS).create("c");
            const keyB = new KeyPrefixer(["a", "b"], BASE_SETTINGS).create("d");
            expect(keyA.prefixed()).not.toBe(keyB.prefixed());
        });
        test(`Should not match when keyPrefixerA and keyPrefixerB root is "a", group is "b" and keys are different`, () => {
            const keyA = new KeyPrefixer("a", BASE_SETTINGS)
                .withGroup("b")

                .create("c");
            const keyB = new KeyPrefixer("a", BASE_SETTINGS)
                .withGroup("b")

                .create("d");
            expect(keyA.prefixed()).not.toBe(keyB.prefixed());
        });
        test(`Key should start with getKeyPrefix when keyPrefixer root is ["a", "b"] and key is "c"`, () => {
            const keyPrefixer = new KeyPrefixer(
                ["a", "b"],
                BASE_SETTINGS,
            ).disablePrefix();
            const key = keyPrefixer.create("c");
            expect(key.prefixed().startsWith(keyPrefixer.getKeyPrefix())).toBe(
                true,
            );
        });
        test(`Key should start with getKeyPrefix when keyPrefixer root is "a", group is "b" and key is "c"`, () => {
            const keyPrefixer = new KeyPrefixer("a", BASE_SETTINGS).withGroup(
                "a",
            );
            const key = keyPrefixer.create("c");
            expect(key.prefixed().startsWith(keyPrefixer.getKeyPrefix())).toBe(
                true,
            );
        });
        test(`Key should not start with getKeyPrefix when keyPrefixer when given different root`, () => {
            const keyPrefixerA = new KeyPrefixer(["a", "b"], BASE_SETTINGS);
            const keyPrefixerB = new KeyPrefixer("a", BASE_SETTINGS);
            const key = keyPrefixerA.create("c");
            expect(key.prefixed().startsWith(keyPrefixerB.getKeyPrefix())).toBe(
                false,
            );
        });
        test(`Key should not start with getKeyPrefix when keyPrefixer when given different root and group`, () => {
            const keyPrefixerA = new KeyPrefixer("a", BASE_SETTINGS).withGroup(
                "a",
            );
            const keyPrefixerB = new KeyPrefixer("a", BASE_SETTINGS).withGroup(
                "c",
            );
            const key = keyPrefixerA.create("c");
            expect(key.prefixed().startsWith(keyPrefixerB.getKeyPrefix())).toBe(
                false,
            );
        });
        test(`Should not prefix key when keyPrefixer root is ["a", "b"], key is "c" and prefixing is disabled`, () => {
            const keyPrefixer = new KeyPrefixer(
                ["a", "b"],
                BASE_SETTINGS,
            ).disablePrefix();
            expect(keyPrefixer.create("a").prefixed()).toBe("a");
            expect(keyPrefixer.create(["a", "c"]).prefixed()).toBe("a/c");
        });
        test(`Should not prefix key when keyPrefixer root is "a", group is "b", key is "c" and prefixing is disabled`, () => {
            const keyPrefixer = new KeyPrefixer("a", BASE_SETTINGS)
                .disablePrefix()
                .withGroup("b");
            expect(keyPrefixer.create("a").prefixed()).toBe("a");
            expect(keyPrefixer.create(["a", "b"]).prefixed()).toBe("a/b");
        });
    });
    describe("method: create().resolved()", () => {
        test(`Should not prefix key when keyPrefixer root is ["a", "b"], key is "c"`, () => {
            const keyPrefixer = new KeyPrefixer(
                ["a", "b"],
                BASE_SETTINGS,
            ).disablePrefix();
            expect(keyPrefixer.create("a").resolved()).toBe("a");
            expect(keyPrefixer.create(["a", "c"]).resolved()).toBe("a/c");
        });
        test(`Should not prefix key when keyPrefixer root is "a", group is "b", key is "c"`, () => {
            const keyPrefixer = new KeyPrefixer("a", BASE_SETTINGS).withGroup(
                "a",
            );
            expect(keyPrefixer.create("a").resolved()).toBe("a");
            expect(keyPrefixer.create(["a", "b"]).resolved()).toBe("a/b");
        });
    });
});
