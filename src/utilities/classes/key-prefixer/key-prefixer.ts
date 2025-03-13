/**
 * @module Utilities
 */

import { resolveOneOrMoreStr } from "@/utilities//_module-exports.js";
import type { AtLeastOne, OneOrMore } from "@/utilities/types/_module.js";
import type {
    IKey,
    IKeyPrefixer,
} from "@/utilities/classes/key-prefixer/key-prefixer.contract.js";

/**
 * @internal
 */
type KeySettings = {
    prefixArr: AtLeastOne<string>;
    key: OneOrMore<string>;
    identifierDelimeter: string;
    keyDelimeter: string;
};

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 * @group KeyPrefixer
 */
class Key implements IKey {
    private readonly prefixArr: AtLeastOne<string>;
    private readonly key: OneOrMore<string>;
    private readonly identifierDelimeter: string;
    private readonly keyDelimeter: string;

    /**
     *
     * @internal
     */
    constructor(settings: KeySettings) {
        const { prefixArr, key, identifierDelimeter, keyDelimeter } = settings;
        this.prefixArr = prefixArr;
        this.key = key;
        this.identifierDelimeter = identifierDelimeter;
        this.keyDelimeter = keyDelimeter;
    }

    get original(): OneOrMore<string> {
        return this.key;
    }

    get resolved(): string {
        return resolveOneOrMoreStr(this.key);
    }

    get prefixed(): string {
        return resolveOneOrMoreStr(
            [
                ...this.prefixArr,
                resolveOneOrMoreStr(this.key, this.keyDelimeter),
            ],
            this.identifierDelimeter,
        );
    }
}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 * @group KeyPrefixer
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
 * @group KeyPrefixer
 */
export class KeyPrefixer implements IKeyPrefixer {
    private _group: OneOrMore<string> | null = null;
    private readonly identifierDelimeter: string;
    private readonly keyDelimeter: string;
    private readonly rootIdentifier: string;
    private readonly groupIdentifier: string;
    private readonly keyIdentifier: string;

    constructor(
        private readonly _rootPrefix: OneOrMore<string>,
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
        this.validate(this._rootPrefix);
        if (this._group !== null) {
            this.validate(this._group);
        }
    }

    get originalGroup(): OneOrMore<string> | null {
        return this._group;
    }

    get resolvedGroup(): string | null {
        if (this._group === null) {
            return null;
        }
        return resolveOneOrMoreStr(this._group);
    }

    get originalRootPrefix(): OneOrMore<string> {
        return this._rootPrefix;
    }

    get resolvedRootPrefix(): string {
        return resolveOneOrMoreStr(this._rootPrefix);
    }

    private validate(key: OneOrMore<string>): void {
        const resolvedKey = resolveOneOrMoreStr(key);
        if (resolvedKey.includes(this.rootIdentifier)) {
            throw new Error("!!__MESSAGE__!!");
        }
        if (resolvedKey.includes(this.groupIdentifier)) {
            throw new Error("!!__MESSAGE__!!");
        }
        if (resolvedKey.includes(this.keyIdentifier)) {
            throw new Error("!!__MESSAGE__!!");
        }
    }

    private getKeyPrefixArray(): AtLeastOne<string> {
        let array: AtLeastOne<string> = [
            this.rootIdentifier,
            resolveOneOrMoreStr(this._rootPrefix, this.keyDelimeter),
        ];
        if (this._group !== null) {
            array = [
                ...array,
                this.groupIdentifier,
                resolveOneOrMoreStr(this._group, this.keyDelimeter),
            ];
        }
        return [...array, this.keyIdentifier];
    }

    get keyPrefix(): string {
        return resolveOneOrMoreStr(
            this.getKeyPrefixArray(),
            this.identifierDelimeter,
        );
    }

    /**
     * Chaining this method multiple times will have no effect.
     */
    withGroup(group: OneOrMore<string>): KeyPrefixer {
        const keyProvider = new KeyPrefixer(this._rootPrefix, {
            identifierDelimeter: this.identifierDelimeter,
            keyDelimeter: this.keyDelimeter,
            rootIdentifier: this.rootIdentifier,
            groupIdentifier: this.groupIdentifier,
            keyIdentifier: this.keyIdentifier,
        });
        if (keyProvider._group === null) {
            keyProvider._group = group;
        }
        return keyProvider;
    }

    create(key: OneOrMore<string>): Key {
        this.validate(key);
        return new Key({
            key,
            keyDelimeter: this.keyDelimeter,
            identifierDelimeter: this.identifierDelimeter,
            prefixArr: this.getKeyPrefixArray(),
        });
    }
}
