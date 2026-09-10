import { use } from "eridu-tech/middleware";
import {
    type IMiddlewareObject,
    type MiddlewareArgs,
} from "eridu-tech/middleware/contracts";

const originalFn = (name: string, age: number): string => {
    return `${name} is ${age} years old`;
};

class AuthMiddleware implements IMiddlewareObject<[string, number], string> {
    constructor(public readonly priority: number = 100) {}

    invoke({ args, next }: MiddlewareArgs<[string, number], string>): string {
        // Authentication logic
        return next(args);
    }
}

const authMiddleware = new AuthMiddleware(100);
const wrappedFn = use(originalFn, authMiddleware);
