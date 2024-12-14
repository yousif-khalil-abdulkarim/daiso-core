/**
 * @module Async
 */

export function lazyPromise<TValue>(
    promiseFn: () => PromiseLike<TValue>,
): PromiseLike<TValue> {
    return {
        then<TResult1 = TValue, TResult2 = never>(
            onfulfilled?:
                | ((value: TValue) => TResult1 | PromiseLike<TResult1>)
                | null,
            onrejected?: // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
        ): PromiseLike<TResult1 | TResult2> {
            // eslint-disable-next-line @typescript-eslint/use-unknown-in-catch-callback-variable
            return promiseFn().then(onfulfilled, onrejected);
        },
    };
}
