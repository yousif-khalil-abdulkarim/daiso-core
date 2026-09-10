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

const wrappedFn = use(originalFn, loggingMiddleware);

// Call the wrapped function
const result = wrappedFn("Alice", 30);
// Logs: "Before invocation with args: ["Alice", 30]"
// Logs: "After invocation, result: Alice is 30 years old"
