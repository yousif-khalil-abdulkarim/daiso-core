/**
 * @module Utilities
 */

/**
 * @group Contracts
 */
export type IBuildable<TReturn> = {
    build(): TReturn;
};
