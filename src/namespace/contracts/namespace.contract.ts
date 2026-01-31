/**
 * @module Namespace
 */

import { type IEquals } from "@/utilities/_module.js";

/**
 * @group Contracts
 */
export interface IKey extends IEquals<IKey> {
    get(): string;

    toString(): string;
}

/**
 * @group Contracts
 */
export type INamespace = {
    toString(): string;

    create(key: string): IKey;
};
