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
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
class Key {
    private readonly prefixArr: AtLeastOne<string>;
    private readonly key: OneOrMore<string>;
    private readonly identifierDelimeter: string;
    private readonly keyDelimeter: string;
    private readonly shouldPrefixKeys: boolean;
    private readonly keyIdentifier: string;

    /**
     *
     * @internal
     */
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
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type KeyPrefixerSettings = {
    identifierDelimeter?: string;
    keyDelimeter?: string;
    keyIdentifier?: string;
    rootIdentifier?: string;
    groupIdentifier?: string;
};

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export class KeyPrefixer {
    public group: OneOrMore<string> | null = null;
    private shouldPrefixKeys: boolean = true;
    private readonly identifierDelimeter: string;
    private readonly keyDelimeter: string;
    private readonly rootIdentifier: string;
    private readonly groupIdentifier: string;
    private readonly keyIdentifier: string;

    constructor(
        public readonly rootPrefix: OneOrMore<string>,
        settings: KeyPrefixerSettings = {},
    ) {
        const {
            identifierDelimeter = ":",
            keyDelimeter = "/",
            keyIdentifier = "_ky",
            rootIdentifier = "_rt",
            groupIdentifier = "_gp",
        } = settings;
        this.rootIdentifier = rootIdentifier;
        this.groupIdentifier = groupIdentifier;
        this.keyIdentifier = keyIdentifier;
        this.identifierDelimeter = identifierDelimeter;
        this.keyDelimeter = keyDelimeter;
        this.validate(this.rootPrefix);
        if (this.group !== null) {
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
            resolveOneOrMoreStr(this.rootPrefix),
        ];
        if (this.group !== null) {
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

    /**
     * Chaining this method multiple times will have no effect.
     */
    withGroup(group: OneOrMore<string>): KeyPrefixer {
        const keyProvider = new KeyPrefixer(this.rootPrefix, {
            identifierDelimeter: this.identifierDelimeter,
            keyDelimeter: this.keyDelimeter,
            rootIdentifier: this.rootIdentifier,
            groupIdentifier: this.groupIdentifier,
            keyIdentifier: this.keyIdentifier,
        });
        if (keyProvider.group === null) {
            keyProvider.group = group;
        }
        keyProvider.shouldPrefixKeys = this.shouldPrefixKeys;
        return keyProvider;
    }

    /**
     * Chaining this method multiple times will have no effect.
     */
    disablePrefix(): KeyPrefixer {
        const keyProvider = new KeyPrefixer(this.rootPrefix, {
            identifierDelimeter: this.identifierDelimeter,
            keyDelimeter: this.keyDelimeter,
            rootIdentifier: this.rootIdentifier,
            groupIdentifier: this.groupIdentifier,
            keyIdentifier: this.keyIdentifier,
        });
        keyProvider.shouldPrefixKeys = false;
        keyProvider.group = this.group;
        return keyProvider;
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
