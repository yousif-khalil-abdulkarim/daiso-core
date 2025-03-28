import { describe, expect, test } from "vitest";
import { Pipeline } from "@/utilities/classes/pipeline/pipeline.js";

describe("class: Pipeline", () => {
    test("Should call original function", () => {
        function fn(nbr: number): number {
            return nbr + 1;
        }
        const value = new Pipeline(fn, []).invoke(1);
        expect(value).toBe(2);
    });
    test("Should forward arguments to middleware when given one argument", () => {
        function fn(nbr: number): number {
            return nbr + 1;
        }
        let args: unknown[] = [];
        new Pipeline(fn, [
            (args_, next) => {
                args = args_;
                return next(...args_);
            },
        ]).invoke(1);
        expect(args).toStrictEqual([1]);
    });
    test("Should forward arguments to middleware when given 2 arguments", () => {
        function fn(a: number, b: number): number {
            return a + b;
        }
        let args: unknown[] = [];
        new Pipeline(fn, [
            (args_, next) => {
                args = args_;
                return next(...args_);
            },
        ]).invoke(1, 2);
        expect(args).toStrictEqual([1, 2]);
    });
    test("Should forward arguments to second middleware", () => {
        function fn(nbr: number): number {
            return nbr + 1;
        }
        let args: unknown[] = [];
        new Pipeline(fn, [
            (args_, next) => {
                return next(...args_);
            },
            (args_, next) => {
                args = args_;
                return next(...args_);
            },
        ]).invoke(1);
        expect(args).toStrictEqual([1]);
    });
    test("Should change arguments from first middleware", () => {
        function fn(nbr: number): number {
            return nbr + 1;
        }
        let args: unknown[] = [];
        new Pipeline(fn, [
            (_args, next) => {
                return next(-1);
            },
            (args_, next) => {
                args = args_;
                return next(...args_);
            },
        ]).invoke(1);
        expect(args).toStrictEqual([-1]);
    });
    test("Should change return value from first middleware", () => {
        function fn(nbr: number): number {
            return nbr + 1;
        }
        const result = new Pipeline(fn, [
            (args, next) => {
                return next(...args);
            },
            (args, next) => {
                return next(...args) + 1;
            },
        ]).invoke(1);
        expect(result).toStrictEqual(3);
    });
    test("Should change return value from second middleware", () => {
        function fn(nbr: number): number {
            return nbr + 1;
        }
        const result = new Pipeline(fn, [
            (args, next) => {
                return next(...args);
            },
            (args, next) => {
                return next(...args) + 1;
            },
            (args, next) => {
                return next(...args) + -2;
            },
        ]).invoke(1);
        expect(result).toStrictEqual(1);
    });
    test("Should overide return value from first middleware", () => {
        function fn(nbr: number): number {
            return nbr + 1;
        }
        const result = new Pipeline(fn, [
            (args, next) => {
                return next(...args);
            },
            () => {
                return -1;
            },
        ]).invoke(1);
        expect(result).toStrictEqual(-1);
    });
    test("Should forward context to first middleware", () => {
        function fn(nbr: number): number {
            return nbr + 1;
        }
        let context: unknown = undefined;
        new Pipeline(
            fn,
            [
                (args, next, context_) => {
                    context = context_;
                    return next(...args);
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
    test("Should forward context to second middleware", () => {
        function fn(nbr: number): number {
            return nbr + 1;
        }
        let context: unknown = undefined;
        new Pipeline(
            fn,
            [
                (args, next) => {
                    return next(...args);
                },
                (args, next, context_) => {
                    context = context_;
                    return next(...args);
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
