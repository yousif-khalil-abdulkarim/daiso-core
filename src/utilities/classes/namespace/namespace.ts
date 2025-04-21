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
 * @internal
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

    get namespaced(): string {
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
 * @group Namespace
 */
export type NamespaceSettings = {
    /**
     * @default {":"}
     */
    identifierDelimeter?: string;

    /**
     * @default {"/"}
     */
    keyDelimeter?: string;

    /**
     * @default {"_rt"}
     */
    rootIdentifier?: string;
};

/**
 * The `Namespace` class adds prefixes/suffixes to keys to avoid conflicts and group related items.
 * Note the `Namespace` class is not meant to be used directly, instead you should configure it once and then pass it to a public class like `Cache` and `LockProvider`.
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 * @group Namespace
 */
export class Namespace {
    private readonly identifierDelimeter: string;
    private readonly keyDelimeter: string;
    private readonly rootIdentifier: string;

    constructor(
        private readonly _rootPrefix: OneOrMore<string>,
        settings: NamespaceSettings = {},
    ) {
        const {
            identifierDelimeter = ":",
            keyDelimeter = "/",
            rootIdentifier = "_rt",
        } = settings;
        this.rootIdentifier = rootIdentifier;
        this.identifierDelimeter = identifierDelimeter;
        this.keyDelimeter = keyDelimeter;
        this.validate(this._rootPrefix);
    }

    /**
     * @internal
     */
    get original(): OneOrMore<string> {
        return this._rootPrefix;
    }

    /**
     * @internal
     */
    get resolved(): string {
        return resolveOneOrMoreStr(this._rootPrefix);
    }

    /**
     * @internal
     */
    private validate(key: OneOrMore<string>): void {
        const resolvedKey = resolveOneOrMoreStr(key);
        if (resolvedKey.includes(this.rootIdentifier)) {
            throw new Error(
                `Resolved key "${resolvedKey}" cannot not include "${this.rootIdentifier}"`,
            );
        }
    }

    /**
     * @internal
     */
    private getKeyPrefixArray(): AtLeastOne<string> {
        return [
            resolveOneOrMoreStr(this._rootPrefix, this.keyDelimeter),
            this.rootIdentifier,
        ];
    }

    /**
     * @internal
     */
    get namespaced(): string {
        return resolveOneOrMoreStr(
            this.getKeyPrefixArray(),
            this.identifierDelimeter,
        );
    }

    /**
     * @internal
     */
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
