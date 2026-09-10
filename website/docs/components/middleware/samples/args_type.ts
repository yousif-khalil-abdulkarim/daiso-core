import type { NextFn } from "eridu-tech/middleware/contracts";

type MiddlewareArgs<TParameters extends Array<unknown>, TReturn> = {
    // Original function arguments
    args: TParameters;
    // Function to invoke next middleware or original function
    next: NextFn<TParameters, TReturn>;
    // Name of the function/method
    name: string;
};
