/**
 * @module Utilities
 */

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 * @group Contracts
 */
export type ISerializedError = {
    name: string;
    message: string;
    cause?: unknown;
};
