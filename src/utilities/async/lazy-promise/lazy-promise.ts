/**
 * @module Async
 */

/**
 * The <i>LazyPromise</i> class is used for creating lazy <i>{@link PromiseLike}<i> object that will only execute when awaited or when then method is called.
 * @group Promise utilities
 * @example
 * ```ts
 * (async () => {
 *   const promise = new LazyPromise(async () => {
 *     console.log("I am lazy");
 *   });
 *   // "I am lazy" will only logged when awaited or then method i called.
 *   await promise;
 * })();
 * ```
 */
export class LazyPromise<TValue> implements PromiseLike<TValue> {
    private promise: PromiseLike<TValue> | null = null;

    constructor(private readonly asyncFn: () => PromiseLike<TValue>) {}

    then<TResult1 = TValue, TResult2 = never>(
        onfulfilled?:
            | ((value: TValue) => TResult1 | PromiseLike<TResult1>)
            | null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
    ): PromiseLike<TResult1 | TResult2> {
        if (this.promise === null) {
            this.promise = this.asyncFn();
        }
        // eslint-disable-next-line @typescript-eslint/use-unknown-in-catch-callback-variable
        return this.promise.then(onfulfilled, onrejected);
    }
}

/**
 * The <i>deferLazyPromise</i> function will execute <i>{@link LazyPromise}</i> without awaiting it.
 * @group Promise utilities
 */
export function deferLazyPromise<TValue>(promise: LazyPromise<TValue>): void {
    promise.then(() => {});
}
