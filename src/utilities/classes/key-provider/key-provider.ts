/**
 * @module Utilities
 */

import { resolveOneOrMoreStr } from "@/utilities/functions.js";
import type { AtLeastOne, OneOrMore } from "@/utilities/types.js";

/**
 * @internal
 */
type KeySettings = {
    prefixArr: AtLeastOne<string>;
    key: OneOrMore<string>;
    identifierDelimeter: string;
    keyDelimeter: string;
    keyIdentifier: string;
    shouldPrefixKeys: boolean;
};

/**
 * @internal
 */
class Key {
    private readonly prefixArr: AtLeastOne<string>;
    private readonly key: OneOrMore<string>;
    private readonly identifierDelimeter: string;
    private readonly keyDelimeter: string;
    private readonly shouldPrefixKeys: boolean;
    private readonly keyIdentifier: string;

    constructor(settings: KeySettings) {
        const {
            prefixArr,
            key,
            identifierDelimeter,
            keyDelimeter,
            shouldPrefixKeys,
            keyIdentifier,
        } = settings;
        this.prefixArr = prefixArr;
        this.key = key;
        this.identifierDelimeter = identifierDelimeter;
        this.keyDelimeter = keyDelimeter;
        this.shouldPrefixKeys = shouldPrefixKeys;
        this.keyIdentifier = keyIdentifier;
    }

    resolved(): string {
        return resolveOneOrMoreStr(this.key, this.keyDelimeter);
    }

    prefixed(): string {
        if (!this.shouldPrefixKeys) {
            return this.resolved();
        }
        return resolveOneOrMoreStr(
            [...this.prefixArr, this.keyIdentifier, this.resolved()],
            this.identifierDelimeter,
        );
    }
}

/**
 * @internal
 */
export type KeyProviderSettings = {
    group?: OneOrMore<string>;
    shouldPrefixKeys: boolean;
    identifierDelimeter: string;
    keyDelimeter: string;
    keyIdentifier: string;
    rootIdentifier: string;
    groupIdentifier: string;
};

/**
 * @internal
 */
export class KeyProvider {
    private readonly group?: OneOrMore<string>;
    private readonly shouldPrefixKeys: boolean;
    private readonly identifierDelimeter: string;
    private readonly keyDelimeter: string;
    private readonly rootIdentifier: string;
    private readonly groupIdentifier: string;
    private readonly keyIdentifier: string;

    constructor(
        private readonly prefix: OneOrMore<string>,
        settings: KeyProviderSettings,
    ) {
        const {
            shouldPrefixKeys = true,
            identifierDelimeter,
            keyDelimeter,
            keyIdentifier,
            rootIdentifier,
            groupIdentifier,
            group,
        } = settings;
        this.rootIdentifier = rootIdentifier;
        this.groupIdentifier = groupIdentifier;
        this.keyIdentifier = keyIdentifier;
        this.shouldPrefixKeys = shouldPrefixKeys;
        this.identifierDelimeter = identifierDelimeter;
        this.keyDelimeter = keyDelimeter;
        this.group = group;
        this.validate(this.prefix);
        if (this.group !== undefined) {
            this.validate(this.group);
        }
    }

    private validate(key: OneOrMore<string>): void {
        if (key.includes(this.rootIdentifier)) {
            throw new Error("!!__MESSAGE__!!");
        }
        if (key.includes(this.groupIdentifier)) {
            throw new Error("!!__MESSAGE__!!");
        }
        if (key.includes(this.keyIdentifier)) {
            throw new Error("!!__MESSAGE__!!");
        }
    }

    private getGroupPrefixArray(): AtLeastOne<string> {
        let array: AtLeastOne<string> = [
            this.rootIdentifier,
            resolveOneOrMoreStr(this.prefix),
        ];
        if (this.group !== undefined) {
            array = [
                ...array,
                this.groupIdentifier,
                resolveOneOrMoreStr(this.group),
            ];
        }
        return array;
    }

    getGroupPrefix(): string {
        return resolveOneOrMoreStr(
            this.getGroupPrefixArray(),
            this.identifierDelimeter,
        );
    }

    private getKeyPrefixArray(): AtLeastOne<string> {
        return [...this.getGroupPrefixArray(), this.keyIdentifier];
    }

    getKeyPrefix(): string {
        if (!this.shouldPrefixKeys) {
            return "";
        }
        return resolveOneOrMoreStr(
            this.getKeyPrefixArray(),
            this.identifierDelimeter,
        );
    }

    create(key: OneOrMore<string>): Key {
        this.validate(key);
        return new Key({
            key,
            keyDelimeter: this.keyDelimeter,
            identifierDelimeter: this.identifierDelimeter,
            prefixArr: this.getKeyPrefixArray(),
            shouldPrefixKeys: this.shouldPrefixKeys,
            keyIdentifier: this.keyIdentifier,
        });
    }
}
