/**
 * @module Utilities
 */

/**
 * @group Contracts
 */
export type IDeinitizable = {
    deInit(): PromiseLike<void>;
};
