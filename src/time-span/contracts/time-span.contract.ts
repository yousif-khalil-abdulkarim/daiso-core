/**
 * @module TimeSpan
 */

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/time-span/contracts"`
 * @group Contracts
 */
export const TO_MILLISECONDS = Symbol("TO_MILLISECONDS");

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/time-span/contracts"`
 * @group Contracts
 */
export type ITimeSpan = {
    [TO_MILLISECONDS](): number;
};
