/**
 * @module Namespace
 */

import { type INamespace } from "@/namespace/contracts/_module.js";
import {
    resolveOneOrMoreStr,
    resolveOneOrMore,
    UnexpectedError,
    type OneOrMore,
} from "@/utilities/_module.js";

/**
 * @internal
 */
type KeySettings = {
    prefixArr: Array<string>;
    key: string;
    delimeter: string;
};

/**
 * @internal
 */
class Key {
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
        return this.key;
    }

    toString(): string {
        return resolveOneOrMoreStr(
            [...this.prefixArr, this.key],
            this.delimeter,
        );
    }
}

/**
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
 * @group Adapters
 *
 * @example
 * ```ts
 * import { Namespace } from "@daiso-tech/core/namspace";
 *
 * const namespace = new Namespace("@my-namespace");
 *
 * // Logs "@my-namespace:_rt"
 * console.log(namespace.toString());
 *
 * const key = namespace.create("my-key");
 *
 * // Logs "my-key"
 * console.log(key.get())
 *
 * // Logs "@my-namespace:_rt:my-key"
 * console.log(key.toString())
 *
 * // You can extend the root
 * const newNamespace = namespace.appendRoot("sub");
 *
 * // Logs "@my-namespace:sub:_rt"
 * console.log(newNamespace.toString());
 *
 * ```
 */
export class Namespace implements INamespace {
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
