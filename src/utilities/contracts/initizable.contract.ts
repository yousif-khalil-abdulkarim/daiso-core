/**
 * @module Utilities
 */

/**
 * @group Contracts
 */
export type IInitizable = {
    init(): PromiseLike<void>;
};
