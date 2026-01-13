/**
 * @module Namespace
 */

/**
 * @group Contracts
 */
export type IKey = {
    get(): string;

    toString(): string;
};

/**
 * @group Contracts
 */
export type INamespace = {
    toString(): string;

    create(key: string): IKey;
};
