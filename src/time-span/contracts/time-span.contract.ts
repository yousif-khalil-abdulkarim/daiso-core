/**
 * @module Utilities
 */

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 * @group Contracts
 */
export const TO_MILLISECONDS = Symbol("TO_MILLISECONDS");

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 * @group Contracts
 */
export type ITimeSpan = {
    [TO_MILLISECONDS](): number;
};
