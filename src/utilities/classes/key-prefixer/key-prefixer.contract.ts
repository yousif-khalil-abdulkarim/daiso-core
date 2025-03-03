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
    resolved(): string;

    prefixed(): string;
};

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 * @group KeyPrefixer
 */
export type IKeyPrefixer = {
    readonly group: string | null;

    readonly rootPrefix: string;

    getKeyPrefix(): string;

    create(key: OneOrMore<string>): IKey;

    withGroup(group: OneOrMore<string>): IKeyPrefixer;
};
