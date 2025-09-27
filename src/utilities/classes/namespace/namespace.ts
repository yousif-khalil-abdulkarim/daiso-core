/**
 * @module Utilities
 */

import {
    resolveOneOrMoreStr,
    resolveOneOrMore,
    UnexpectedError,
} from "@/utilities//_module-exports.js";
import type { OneOrMore } from "@/utilities/functions/_module.js";

/**
 * @internal
 */
type KeySettings = {
    prefixArr: Array<string>;
    key: OneOrMore<string>;
    delimeter: string;
};

/**
 * @internal
 */
export class Key {
    private readonly prefixArr: Array<string>;
    private readonly key: OneOrMore<string>;
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

    get original(): OneOrMore<string> {
        return this.key;
    }

    get resolved(): string {
        return resolveOneOrMoreStr(this.key);
    }

    get namespaced(): string {
        return resolveOneOrMoreStr(
            [...this.prefixArr, resolveOneOrMoreStr(this.key, this.delimeter)],
            this.delimeter,
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
     * @default ":"
     */
    delimeter?: string;

    /**
     * @default "_rt"
     */
    rootIdentifier?: string;
};

/**
 * @internal
 */
class InternalNamespace {
    private readonly delimeter: string;
    private readonly rootIdentifier: string;

    constructor(
        private readonly _rootPrefix: OneOrMore<string>,
        settings: NamespaceSettings = {},
    ) {
        const { delimeter = "/", rootIdentifier = "_rt" } = settings;
        this.rootIdentifier = rootIdentifier;
        this.delimeter = delimeter;
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
            throw new UnexpectedError(
                `Resolved key "${resolvedKey}" cannot not include "${this.rootIdentifier}"`,
            );
        }
    }

    private getKeyPrefixArray(): Array<string> {
        return [
            resolveOneOrMoreStr(this._rootPrefix, this.delimeter),
            this.rootIdentifier,
        ];
    }

    get namespaced(): string {
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

    setDelimeter(delimeter: string): Namespace {
        return new Namespace(this.root, {
            ...this.settings,
            delimeter,
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

    prependRoot(str: OneOrMore<string>): Namespace {
        return new Namespace(
            [...resolveOneOrMore(str), ...resolveOneOrMore(this.root)],
            this.settings,
        );
    }

    /**
     * @internal
     */
    _internal_get(): InternalNamespace {
        return new InternalNamespace(this.root, this.settings);
    }
}
