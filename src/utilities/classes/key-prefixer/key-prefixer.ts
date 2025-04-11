/**
 * @module Utilities
 */

import { resolveOneOrMoreStr } from "@/utilities//_module-exports.js";
import type { AtLeastOne, OneOrMore } from "@/utilities/types/_module.js";

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
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 * @group KeyPrefixer
 */
export class Key {
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
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
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
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 * @group KeyPrefixer
 */
export class KeyPrefixer {
    private readonly identifierDelimeter: string;
    private readonly keyDelimeter: string;
    private readonly rootIdentifier: string;
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
        } = settings;
        this.rootIdentifier = rootIdentifier;
        this.keyIdentifier = keyIdentifier;
        this.identifierDelimeter = identifierDelimeter;
        this.keyDelimeter = keyDelimeter;
        this.validate(this._rootPrefix);
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
            throw new Error(
                `Resolved key "${resolvedKey}" cannot not include "${this.rootIdentifier}"`,
            );
        }
        if (resolvedKey.includes(this.keyIdentifier)) {
            throw new Error(
                `Resolved key "${resolvedKey}" cannot not include "${this.keyIdentifier}"`,
            );
        }
    }

    private getKeyPrefixArray(): AtLeastOne<string> {
        return [
            resolveOneOrMoreStr(this._rootPrefix, this.keyDelimeter),
            this.rootIdentifier,
        ];
    }

    get keyPrefix(): string {
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
        });
    }
}
