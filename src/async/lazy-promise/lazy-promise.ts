/**
 * @module Async
 */

/**
 * The <i>LazyPromise</i> class is used for creating lazy <i>{@link Promise}<i> that will only execute when awaited or when then method is called.
 * @group Promise utilities
 */
export class LazyPromise<TValue> implements PromiseLike<TValue> {
    constructor(private readonly asyncFn: () => PromiseLike<TValue>) {}

    then<TResult1 = TValue, TResult2 = never>(
        onfulfilled?:
            | ((value: TValue) => TResult1 | PromiseLike<TResult1>)
            | null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
    ): PromiseLike<TResult1 | TResult2> {
        // eslint-disable-next-line @typescript-eslint/use-unknown-in-catch-callback-variable
        return this.asyncFn().then(onfulfilled, onrejected);
    }
}

/**
 * The <i>isLazyPromise</i> function checks if <i>{@link PromiseLike}</i> object is <i>{@link LazyPromise}</i>.
 * @group Promise utilities
 */
export function isLazyPromise<TValue>(
    promise: PromiseLike<TValue>,
): promise is LazyPromise<TValue> {
    return promise instanceof LazyPromise;
}

/**
 * The <i>lazyPromise</i> function makes a <i>{@link PromiseLike}</i> object lazy in other words the <i>{@link PromiseLike}</i> object will only be executed when awaited or then method is called.
 * @group Promise utilities
 * @example
 * ```ts
 * import { lazyPromise } from "@daiso-tech/core";
 *
 * (async () => {
 *   // Nothing will be logged here.
 *   const promise = lazyPromise(async () => {
 *     console.log("I am lazy");
 *   });
 *   // "I am lazy" will be logged.
 *   await promise;
 * })();
 * ```
 */
export function lazyPromise<TValue>(
    asyncFn: () => PromiseLike<TValue>,
): LazyPromise<TValue> {
    return new LazyPromise(asyncFn);
}

/**
 * The <i>deferLazyPromise</i> function will execute <i>{@link LazyPromise}</i> without awaiting it.
 * @group Promise utilities
 */
export function deferLazyPromise<TValue>(promise: LazyPromise<TValue>): void {
    promise.then(() => {});
}
