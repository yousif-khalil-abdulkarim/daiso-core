/**
 * @module Utilities
 */

/**
 * @group Contracts
 */
export type ISerializedError = {
    name: string;
    message: string;
    cause?: unknown;
};
