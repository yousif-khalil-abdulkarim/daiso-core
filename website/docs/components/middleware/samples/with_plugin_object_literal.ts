import { withPlugin } from "eridu-tech/middleware";
import {
    type MiddlewareFn,
    type PluginFn,
} from "eridu-tech/middleware/contracts";

// Timing middleware for synchronous methods
function withPerformanceLogging<
    TParameters extends Array<unknown>,
    TReturn,
>(): MiddlewareFn<TParameters, TReturn> {
    return ({ args, next, name }) => {
        const start = performance.now();
        const returnValue = next(args);
        const timeInMs = performance.now() - start;
        console.log(`function/method ${name} took ${timeInMs}ms`);
        return returnValue;
    };
}

const calculator = {
    add(a: number, b: number): number {
        return a + b;
    },
    subtract(a: number, b: number): number {
        return a - b;
    },
};

const loggingPlugin: PluginFn<typeof calculator> = (obj, enhance) => {
    enhance(obj, "add", withPerformanceLogging());

    enhance(obj, "subtract", withPerformanceLogging());
};

const enhancedCalc = withPlugin(calculator, loggingPlugin);

enhancedCalc.add(2, 3);
// Logs: add called with: [2, 3]

// The original calculator object is NOT modified — a copy is returned instead
