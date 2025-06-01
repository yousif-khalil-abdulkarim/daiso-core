/**
 * @module Utilities
 */

import {
    resolveOneOrMoreStr,
    resolveOneOrMore,
} from "@/utilities//_module-exports.js";
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
 * @internal
 */
class InternalNamespace {
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

    get original(): OneOrMore<string> {
        return this._rootPrefix;
    }

    get resolved(): string {
        return resolveOneOrMoreStr(this._rootPrefix);
    }

    private validate(key: OneOrMore<string>): void {
        const resolvedKey = resolveOneOrMoreStr(key);
        if (resolvedKey.includes(this.rootIdentifier)) {
            throw new Error(
                `Resolved key "${resolvedKey}" cannot not include "${this.rootIdentifier}"`,
            );
        }
    }

    private getKeyPrefixArray(): AtLeastOne<string> {
        return [
            resolveOneOrMoreStr(this._rootPrefix, this.keyDelimeter),
            this.rootIdentifier,
        ];
    }

    get namespaced(): string {
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

/**
 * The `Namespace` class adds prefixes/suffixes to keys to avoid conflicts and group related items.
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 * @group Namespace
 */
export class Namespace {
    constructor(
        private readonly root: OneOrMore<string>,
        private readonly settings: NamespaceSettings = {},
    ) {}

    setIdentifierDelimeter(delimeter: string): Namespace {
        return new Namespace(this.root, {
            ...this.settings,
            identifierDelimeter: delimeter,
        });
    }

    setKeyDelimeter(delimeter: string): Namespace {
        return new Namespace(this.root, {
            ...this.settings,
            keyDelimeter: delimeter,
        });
    }

    setRootIdentifier(identifier: string): Namespace {
        return new Namespace(this.root, {
            ...this.settings,
            rootIdentifier: identifier,
        });
    }

    appendRoot(str: OneOrMore<string>): Namespace {
        return new Namespace(
            [...resolveOneOrMore(this.root), ...resolveOneOrMore(str)],
            this.settings,
        );
    }

    /**
     * @internal
     */
    _getInternal(): InternalNamespace {
        return new InternalNamespace(this.root, this.settings);
    }
}
