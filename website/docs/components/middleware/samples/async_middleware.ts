import { use } from "eridu-tech/middleware";
import {
    type MiddlewareArgs,
    type MiddlewareFn,
} from "eridu-tech/middleware/contracts";

// Async validator used by the middleware
const validateAsync = async (args: [string, number]): Promise<boolean> => {
    const [, age] = args;
    return age >= 0;
};

const createAsyncValidationMiddleware = (
    validator: (args: [string, number]) => Promise<boolean>,
): MiddlewareFn<[string, number], Promise<string>> => {
    return async ({
        args,
        next,
    }: MiddlewareArgs<[string, number], Promise<string>>): Promise<string> => {
        // Perform async validation
        const isValid = await validator(args);
        if (!isValid) throw new Error("Validation failed");
        return await next(args);
    };
};

// Async function being wrapped
const originalFn = async (
    name: string,
    age: number,
): Promise<string> => {
    return `${name} is ${age} years old`;
};

const asyncValidationMiddleware =
    createAsyncValidationMiddleware(validateAsync);
const wrappedFn = use(originalFn, asyncValidationMiddleware);
