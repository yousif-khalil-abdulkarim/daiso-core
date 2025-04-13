import { describe, expect, test } from "vitest";
import { Hooks } from "@/utilities/classes/hooks/hooks.js";

describe("class: Hooks", () => {
    test("Should call original function", () => {
        function fn(nbr: number): number {
            return nbr + 1;
        }
        const value = new Hooks(fn, []).invoke(1);
        expect(value).toBe(2);
    });
    test("Should call function and middleware with correct order when passed through constructor", () => {
        const array: number[] = [];

        new Hooks(() => {
            array.push(4);
        }, [
            (_, next) => {
                array.push(1);
                next();
            },
            (_, next) => {
                array.push(2);
                next();
            },
            (_, next) => {
                array.push(3);
                next();
            },
        ]).invoke();

        expect(array).toStrictEqual([1, 2, 3, 4]);
    });
    test("Should call function and middleware with correct order when passed through pipe", () => {
        const array: number[] = [];

        new Hooks(() => {
            array.push(4);
        }, [])
            .pipe([
                (_, next) => {
                    array.push(1);
                    next();
                },
                (_, next) => {
                    array.push(2);
                    next();
                },
                (_, next) => {
                    array.push(3);
                    next();
                },
            ])
            .invoke();

        expect(array).toStrictEqual([1, 2, 3, 4]);
    });
    test("Should call function and middleware with correct order when passed through constructor and pipe", () => {
        const array: number[] = [];

        new Hooks(() => {
            array.push(4);
        }, [
            (_, next) => {
                array.push(1);
                next();
            },
        ])
            .pipe([
                (_, next) => {
                    array.push(2);
                    next();
                },
                (_, next) => {
                    array.push(3);
                    next();
                },
            ])
            .invoke();

        expect(array).toStrictEqual([1, 2, 3, 4]);
    });
    test("Should forward arguments to middleware when given one argument", () => {
        function fn(nbr: number): number {
            return nbr + 1;
        }
        let args: unknown[] = [];
        new Hooks(fn, [
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
        new Hooks(fn, [
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
        new Hooks(fn, [
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
        new Hooks(fn, [
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
        const result = new Hooks(fn, [
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
        const result = new Hooks(fn, [
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
        const result = new Hooks(fn, [
            (args, next) => {
                return next(...args);
            },
            () => -1,
        ]).invoke(1);
        expect(result).toStrictEqual(-1);
    });
    test("Should forward context to first middleware", () => {
        function fn(nbr: number): number {
            return nbr + 1;
        }
        let context: unknown = undefined;
        new Hooks(
            fn,
            [
                (args, next, { context: context_ }) => {
                    context = context_;
                    return next(...args);
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
    test("Should forward context to second middleware", () => {
        function fn(nbr: number): number {
            return nbr + 1;
        }
        let context: unknown = undefined;
        new Hooks(
            fn,
            [
                (args, next) => {
                    return next(...args);
                },
                (args, next, { context: context_ }) => {
                    context = context_;
                    return next(...args);
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
});
