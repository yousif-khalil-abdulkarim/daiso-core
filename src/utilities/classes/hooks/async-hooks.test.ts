import { describe, expect, test } from "vitest";
import { AsyncHooks } from "@/utilities/classes/hooks/async-hooks.js";

describe("class: AsyncHooks", () => {
    test("Should call original function", async () => {
        function fn(nbr: number): number {
            return nbr + 1;
        }
        const value = await new AsyncHooks(fn, []).invoke(1);
        expect(value).toBe(2);
    });
    test("Should call function and middleware with correct order when passed through constructor", async () => {
        const array: number[] = [];

        await new AsyncHooks(() => {
            array.push(4);
        }, [
            (_, next) => {
                array.push(1);
                return next();
            },
            (_, next) => {
                array.push(2);
                return next();
            },
            (_, next) => {
                array.push(3);
                return next();
            },
        ]).invoke();

        expect(array).toStrictEqual([1, 2, 3, 4]);
    });
    test("Should call function and middleware with correct order when passed through pipe", async () => {
        const array: number[] = [];

        await new AsyncHooks(() => {
            array.push(4);
        }, [])
            .pipe([
                (_, next) => {
                    array.push(1);
                    return next();
                },
                (_, next) => {
                    array.push(2);
                    return next();
                },
                (_, next) => {
                    array.push(3);
                    return next();
                },
            ])
            .invoke();

        expect(array).toStrictEqual([1, 2, 3, 4]);
    });
    test("Should call function and middleware with correct order when passed through constructor and pipe", async () => {
        const array: number[] = [];

        await new AsyncHooks(() => {
            array.push(4);
        }, [
            (_, next) => {
                array.push(1);
                return next();
            },
        ])
            .pipe([
                (_, next) => {
                    array.push(2);
                    return next();
                },
                (_, next) => {
                    array.push(3);
                    return next();
                },
            ])
            .invoke();

        expect(array).toStrictEqual([1, 2, 3, 4]);
    });
    test("Should forward arguments to middleware when given one argument", async () => {
        function fn(nbr: number): number {
            return nbr + 1;
        }
        let args: unknown[] = [];
        await new AsyncHooks(fn, [
            async (args_, next) => {
                args = args_;
                return await next(...args_);
            },
        ]).invoke(1);
        expect(args).toStrictEqual([1]);
    });
    test("Should forward arguments to middleware when given 2 arguments", async () => {
        function fn(a: number, b: number): number {
            return a + b;
        }
        let args: unknown[] = [];
        await new AsyncHooks(fn, [
            async (args_, next) => {
                args = args_;
                return await next(...args_);
            },
        ]).invoke(1, 2);
        expect(args).toStrictEqual([1, 2]);
    });
    test("Should forward arguments to second middleware", async () => {
        function fn(nbr: number): number {
            return nbr + 1;
        }
        let args: unknown[] = [];
        await new AsyncHooks(fn, [
            async (args_, next) => {
                return await next(...args_);
            },
            async (args_, next) => {
                args = args_;
                return await next(...args_);
            },
        ]).invoke(1);
        expect(args).toStrictEqual([1]);
    });
    test("Should change arguments from first middleware", async () => {
        function fn(nbr: number): number {
            return nbr + 1;
        }
        let args: unknown[] = [];
        await new AsyncHooks(fn, [
            async (_args, next) => {
                return await next(-1);
            },
            async (args_, next) => {
                args = args_;
                return await next(...args_);
            },
        ]).invoke(1);
        expect(args).toStrictEqual([-1]);
    });
    test("Should change return value from first middleware", async () => {
        function fn(nbr: number): number {
            return nbr + 1;
        }
        const result = await new AsyncHooks(fn, [
            async (args, next) => {
                return await next(...args);
            },
            async (args, next) => {
                return (await next(...args)) + 1;
            },
        ]).invoke(1);
        expect(result).toStrictEqual(3);
    });
    test("Should change return value from second middleware", async () => {
        function fn(nbr: number): number {
            return nbr + 1;
        }
        const result = await new AsyncHooks(fn, [
            async (args, next) => {
                return await next(...args);
            },
            async (args, next) => {
                return (await next(...args)) + 1;
            },
            async (args, next) => {
                return (await next(...args)) + -2;
            },
        ]).invoke(1);
        expect(result).toStrictEqual(1);
    });
    test("Should overide return value from first middleware", async () => {
        function fn(nbr: number): number {
            return nbr + 1;
        }
        const result = await new AsyncHooks(fn, [
            async (args, next) => {
                return await next(...args);
            },
            () => Promise.resolve(-1),
        ]).invoke(1);
        expect(result).toStrictEqual(-1);
    });
    test("Should forward context to first middleware", async () => {
        function fn(nbr: number): number {
            return nbr + 1;
        }
        let context: unknown = undefined;
        await new AsyncHooks(
            fn,
            [
                async (args, next, { context: context_ }) => {
                    context = context_;
                    return await next(...args);
                },
            ],
            {
                context: {
                    name: "Kalle",
                    age: 20,
                },
            },
        ).invoke(1);
        expect(context).toStrictEqual({
            name: "Kalle",
            age: 20,
        });
    });
    test("Should forward context to second middleware", async () => {
        function fn(nbr: number): number {
            return nbr + 1;
        }
        let context: unknown = undefined;
        await new AsyncHooks(
            fn,
            [
                async (args, next) => {
                    return await next(...args);
                },
                async (args, next, { context: context_ }) => {
                    context = context_;
                    return await next(...args);
                },
            ],
            {
                context: {
                    name: "Kalle",
                    age: 20,
                },
            },
        ).invoke(1);
        expect(context).toStrictEqual({
            name: "Kalle",
            age: 20,
        });
    });
    test("Should abort middleware from function", async () => {
        const abortController = new AbortController();
        abortController.abort("aborted");
        let hasAborted = false;
        await new AsyncHooks(
            (_url: string, _signal?: AbortSignal): Promise<unknown> => {
                return Promise.resolve("data");
            },
            [
                (args, next, { signal }) => {
                    hasAborted = signal.aborted;
                    return next(...args);
                },
            ],
            {
                signalBinder: {
                    getSignal: (args) => args[1],
                    forwardSignal: (args, signal) => {
                        args[1] = signal;
                    },
                },
            },
        ).invoke("url", abortController.signal);
        expect(hasAborted).toBe(true);
    });
    test("Should abort function from middleware", async () => {
        const abortController = new AbortController();
        let hasAborted = false;
        await new AsyncHooks(
            (_url: string, signal?: AbortSignal): Promise<unknown> => {
                if (signal?.aborted !== undefined) {
                    hasAborted = signal.aborted;
                }
                return Promise.resolve("data");
            },
            [
                (args, next, { abort }) => {
                    abort("Aborted");
                    return next(...args);
                },
            ],
            {
                signalBinder: {
                    getSignal: (args) => args[1],
                    forwardSignal: (args, signal) => {
                        args[1] = signal;
                    },
                },
            },
        ).invoke("url", abortController.signal);
        expect(hasAborted).toBe(true);
    });
});
