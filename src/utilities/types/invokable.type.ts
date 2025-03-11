/**
 * @module Utilities
 */

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type InvokableFn<
    TArgs extends unknown[] = unknown[],
    TReturn = unknown,
> = (...args: TArgs) => TReturn;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type IInvokableObject<
    TArgs extends unknown[] = unknown[],
    TReturn = unknown,
> = {
    invoke(...args: TArgs): TReturn;
};

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type Invokable<TArgs extends unknown[] = unknown[], TReturn = unknown> =
    | InvokableFn<TArgs, TReturn>
    | IInvokableObject<TArgs, TReturn>;
