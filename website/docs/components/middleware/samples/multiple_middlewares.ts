import { use } from "eridu-tech/middleware";
import {
    type MiddlewareArgs,
    type MiddlewareFn,
} from "eridu-tech/middleware/contracts";

const originalFn = (name: string, age: number): string => {
    return `${name} is ${age} years old`;
};

const createLoggingMiddleware = (): MiddlewareFn<[string, number], string> => {
    return ({ args, next }: MiddlewareArgs<[string, number], string>) => {
        console.log("Before invocation with args:", args);
        const result = next(args);
        console.log("After invocation, result:", result);
        return result;
    };
};

const loggingMiddleware = createLoggingMiddleware();

const createValidationMiddleware = (): MiddlewareFn<
    [string, number],
    string
> => {
    return ({ args, next }: MiddlewareArgs<[string, number], string>) => {
        const [name, age] = args;
        if (age < 0) throw new Error("Age cannot be negative");
        return next(args);
    };
};

const createAuthMiddleware = (): MiddlewareFn<[string, number], string> => {
    return ({ args, next }: MiddlewareArgs<[string, number], string>) => {
        console.log("Checking authorization...");
        return next(args);
    };
};

const validationMiddleware = createValidationMiddleware();
const authMiddleware = createAuthMiddleware();

const wrappedFn = use(originalFn, [
    loggingMiddleware,
    validationMiddleware,
    authMiddleware,
]);
