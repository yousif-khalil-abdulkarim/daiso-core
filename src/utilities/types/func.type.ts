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
export type AnyFunction = Func<any[], any>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type NoneFunction<TType> = Exclude<TType, AnyFunction>;
