import {
    type MiddlewareArgs,
    type MiddlewareFn,
} from "eridu-tech/middleware/contracts";

const createLoggingMiddleware = <TParameters extends Array<unknown>, TReturn>(
    prefix: string = "LOG",
): MiddlewareFn<TParameters, TReturn> => {
    return ({ args, next }: MiddlewareArgs<TParameters, TReturn>) => {
        console.log(`${prefix} - Before invocation with args:`, args);
        const result = next(args);
        console.log(`${prefix} - After invocation, result:`, result);
        return result;
    };
};

const loggingMiddleware = createLoggingMiddleware();
