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
                async (args, next, context_) => {
                    context = context_;
                    return await next(...args);
                },
            ],
            {
                name: "Kalle",
                age: 20,
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
                async (args, next, context_) => {
                    context = context_;
                    return await next(...args);
                },
            ],
            {
                name: "Kalle",
                age: 20,
            },
        ).invoke(1);
        expect(context).toStrictEqual({
            name: "Kalle",
            age: 20,
        });
    });
});
