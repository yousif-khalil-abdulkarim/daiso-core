/**
 * @module Utilities
 */

import type { OneOrMore } from "@/utilities/types.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 * @group KeyPrefixer
 */
export type IKey = {
    readonly resolved: string;

    readonly prefixed: string;
};

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 * @group KeyPrefixer
 */
export type IKeyPrefixer = {
    readonly group: OneOrMore<string> | null;

    readonly resolvedGroup: string | null;

    readonly rootPrefix: OneOrMore<string>;

    readonly resolvedRootPrefix: string;

    readonly keyPrefix: string;

    create(key: OneOrMore<string>): IKey;

    withGroup(group: OneOrMore<string>): IKeyPrefixer;
};
