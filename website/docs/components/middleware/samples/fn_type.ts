import type { MiddlewareArgs } from "eridu-tech/middleware/contracts";

type MiddlewareFn<TParameters extends Array<unknown>, TReturn> = (
    args: MiddlewareArgs<TParameters, TReturn>,
) => TReturn;
