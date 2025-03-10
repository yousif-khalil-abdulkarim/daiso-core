/**
 * @module Utilities
 */

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type Func<TArgs extends unknown[], TReturn> = (
    ...args_: TArgs
) => TReturn;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type AnyFunc = Func<any[], any>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type NoneFunc<TType> = Exclude<TType, AnyFunc>;
