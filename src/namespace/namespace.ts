/**
 * @module Utilities
 */

import {
    resolveOneOrMoreStr,
    resolveOneOrMore,
    UnexpectedError,
    type OneOrMore,
} from "@/utilities/_module-exports.js";

/**
 * @internal
 */
type KeySettings = {
    prefixArr: Array<string>;
    key: string;
    delimeter: string;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/namespace"`
 */
export class Key {
    private readonly prefixArr: Array<string>;
    private readonly key: string;
    private readonly delimeter: string;

    /**
     *
     * @internal
     */
    constructor(settings: KeySettings) {
        const { prefixArr, key, delimeter } = settings;
        this.prefixArr = prefixArr;
        this.key = key;
        this.delimeter = delimeter;
    }

    get(): string {
        return resolveOneOrMoreStr(this.key);
    }

    toString(): string {
        return resolveOneOrMoreStr(
            [...this.prefixArr, resolveOneOrMoreStr(this.key, this.delimeter)],
            this.delimeter,
        );
    }
}

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/namespace"`
 */
export type NamespaceSettings = {
    /**
     * @default ":"
     */
    delimeter?: string;

    /**
     * @default "_rt"
     */
    rootIdentifier?: string;
};

/**
 * The `Namespace` class adds prefixes/suffixes to keys to avoid conflicts and group related items.
 *
 * IMPORT_PATH: `"@daiso-tech/core/namespace"`
 */
export class Namespace {
    private readonly delimeter: string;
    private readonly rootIdentifier: string;

    constructor(
        private readonly root: OneOrMore<string>,
        settings: NamespaceSettings = {},
    ) {
        const { delimeter = ":", rootIdentifier = "_rt" } = settings;
        this.delimeter = delimeter;
        this.rootIdentifier = rootIdentifier;
    }

    setDelimeter(delimeter: string): Namespace {
        return new Namespace(this.root, {
            rootIdentifier: this.rootIdentifier,
            delimeter,
        });
    }

    setRootIdentifier(identifier: string): Namespace {
        return new Namespace(this.root, {
            rootIdentifier: identifier,
            delimeter: this.delimeter,
        });
    }

    appendRoot(str: OneOrMore<string>): Namespace {
        return new Namespace(
            [...resolveOneOrMore(this.root), ...resolveOneOrMore(str)],
            {
                rootIdentifier: this.rootIdentifier,
                delimeter: this.delimeter,
            },
        );
    }

    prependRoot(str: OneOrMore<string>): Namespace {
        return new Namespace(
            [...resolveOneOrMore(str), ...resolveOneOrMore(this.root)],
            {
                rootIdentifier: this.rootIdentifier,
                delimeter: this.delimeter,
            },
        );
    }

    private validate(key: string): void {
        if (key.includes(this.rootIdentifier)) {
            throw new UnexpectedError(
                `Key "${key}" cannot not include "${this.rootIdentifier}"`,
            );
        }
    }

    private getKeyPrefixArray(): Array<string> {
        return [
            resolveOneOrMoreStr(this.root, this.delimeter),
            this.rootIdentifier,
        ];
    }

    toString(): string {
        return resolveOneOrMoreStr(this.getKeyPrefixArray(), this.delimeter);
    }

    create(key: string): Key {
        this.validate(key);
        return new Key({
            key,
            delimeter: this.delimeter,
            prefixArr: this.getKeyPrefixArray(),
        });
    }
}
