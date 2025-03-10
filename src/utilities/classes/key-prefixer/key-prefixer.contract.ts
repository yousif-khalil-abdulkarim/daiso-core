/**
 * @module Utilities
 */

import type { OneOrMore } from "@/utilities/types/_module.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 * @group KeyPrefixer
 */
export type IKey = {
    readonly original: OneOrMore<string>;

    readonly resolved: string;

    readonly prefixed: string;
};

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 * @group KeyPrefixer
 */
export type IKeyPrefixer = {
    readonly originalGroup: OneOrMore<string> | null;

    readonly resolvedGroup: string | null;

    readonly originalRootPrefix: OneOrMore<string>;

    readonly resolvedRootPrefix: string;

    readonly keyPrefix: string;

    create(key: OneOrMore<string>): IKey;

    withGroup(group: OneOrMore<string>): IKeyPrefixer;
};
