import { describe, expect, test } from "vitest";
import {
    isAsyncFactory,
    isAsyncFactoryFn,
    isAsyncFactoryObject,
    isFactory,
    isFactoryFn,
    isFactoryObject,
    resolveAsyncFactory,
    resolveAsyncFactoryable,
    resolveFactory,
    resolveFactoryable,
    type AsyncFactoryFn,
    type FactoryFn,
    type IAsyncFactoryObject,
    type IFactoryObject,
    type Promisable,
} from "@/utilities/_module-exports.js";

describe("file: factory.ts", () => {
    describe("function: isFactoryFn", () => {
        test("Should return false when given IFactoryObject", () => {
            const factory: IFactoryObject<unknown, unknown> = {
                use: function (_value: unknown): unknown {
                    throw new Error("Function not implemented.");
                },
            };
            expect(isFactoryFn(factory)).toBe(false);
        });
        test("Should return false when given not IFactoryObject or FactoryFn", () => {
            expect(isFactoryFn("str")).toBe(false);
        });
        test("Should return true when given FactoryFn", () => {
            const factory: FactoryFn<unknown, unknown> = function (
                _value: unknown,
            ): unknown {
                throw new Error("Function not implemented.");
            };

            expect(isFactoryFn(factory)).toBe(true);
        });
    });
    describe("function: isFactoryObject", () => {
        test("Should return true when given IFactoryObject", () => {
            const factory: IFactoryObject<unknown, unknown> = {
                use: function (_value: unknown): unknown {
                    throw new Error("Function not implemented.");
                },
            };
            expect(isFactoryObject(factory)).toBe(true);
        });
        test("Should return false when given not IFactoryObject or FactoryFn", () => {
            expect(isFactoryObject("str")).toBe(false);
        });
        test("Should return false when given FactoryFn", () => {
            const factory: FactoryFn<unknown, unknown> = function (
                _value: unknown,
            ): unknown {
                throw new Error("Function not implemented.");
            };

            expect(isFactoryObject(factory)).toBe(false);
        });
    });
    describe("function: isFactory", () => {
        test("Should return true when given IFactoryObject", () => {
            const factory: IFactoryObject<unknown, unknown> = {
                use: function (_value: unknown): unknown {
                    throw new Error("Function not implemented.");
                },
            };
            expect(isFactory(factory)).toBe(true);
        });
        test("Should return true when given FactoryFn", () => {
            const factory: FactoryFn<unknown, unknown> = function (
                _value: unknown,
            ): unknown {
                throw new Error("Function not implemented.");
            };

            expect(isFactoryFn(factory)).toBe(true);
        });
        test("Should return false when given not IFactoryObject or FactoryFn", () => {
            expect(isFactory("str")).toBe(false);
        });
    });
    describe("function: isAsyncFactoryFn", () => {
        test("Should return false when given IAsyncFactoryObject", () => {
            const factory: IAsyncFactoryObject<unknown, unknown> = {
                use: function (_value: unknown): Promisable<unknown> {
                    throw new Error("Function not implemented.");
                },
            };
            expect(isAsyncFactoryFn(factory)).toBe(false);
        });
        test("Should return false when given not IAsyncFactoryObject or AsyncFactoryFn", () => {
            expect(isAsyncFactoryFn("str")).toBe(false);
        });
        test("Should return true when given AsyncFactoryFn", () => {
            const factory: AsyncFactoryFn<unknown, unknown> = function (
                _value: unknown,
            ): Promisable<unknown> {
                throw new Error("Function not implemented.");
            };

            expect(isAsyncFactoryFn(factory)).toBe(true);
        });
    });
    describe("function: isAsyncFactoryObject", () => {
        test("Should return true when given IFactoryObject", () => {
            const factory: IAsyncFactoryObject<unknown, unknown> = {
                use: function (_value: unknown): Promisable<unknown> {
                    throw new Error("Function not implemented.");
                },
            };
            expect(isAsyncFactoryObject(factory)).toBe(true);
        });
        test("Should return false when given not IAsyncFactoryObject or AsyncFactoryFn", () => {
            expect(isAsyncFactoryObject("str")).toBe(false);
        });
        test("Should return false when given AsyncFactoryFn", () => {
            const factory: AsyncFactoryFn<unknown, unknown> = function (
                _value: unknown,
            ): Promisable<unknown> {
                throw new Error("Function not implemented.");
            };

            expect(isAsyncFactoryObject(factory)).toBe(false);
        });
    });
    describe("function: isAsyncFactory", () => {
        test("Should return true when given IAsyncFactoryObject", () => {
            const factory: IAsyncFactoryObject<unknown, unknown> = {
                use: function (_value: unknown): Promisable<unknown> {
                    throw new Error("Function not implemented.");
                },
            };
            expect(isAsyncFactory(factory)).toBe(true);
        });
        test("Should return true when given AsyncFactoryFn", () => {
            const factory: AsyncFactoryFn<unknown, unknown> = function (
                _value: unknown,
            ): Promisable<unknown> {
                throw new Error("Function not implemented.");
            };

            expect(isAsyncFactoryFn(factory)).toBe(true);
        });
        test("Should return false when given not IAsyncFactoryObject or AsyncFactoryFn", () => {
            expect(isAsyncFactory("str")).toBe(false);
        });
    });
    describe("function: resolveFactory", () => {
        test("Should return FactoryFn when given FactoryFn", () => {
            const factory: FactoryFn<unknown, unknown> = function (
                _value: unknown,
            ): unknown {
                throw new Error("Function not implemented.");
            };

            expect(resolveFactory(factory)).toBe(factory);
        });
        test("Should return FactoryFn when given IFactoryObject", () => {
            const factory: IFactoryObject<unknown, unknown> = {
                use: function (_value: unknown): unknown {
                    throw new Error("Function not implemented.");
                },
            };
            expect(resolveFactory(factory)).toBeTypeOf("function");
        });
    });
    describe("function: resolveAsyncFactory", () => {
        test("Should return AsyncFactoryFn when given AsyncFactoryFn", () => {
            const factory: AsyncFactoryFn<unknown, unknown> = function (
                _value: unknown,
            ): Promisable<unknown> {
                throw new Error("Function not implemented.");
            };

            expect(resolveAsyncFactory(factory)).toBe(factory);
        });
        test("Should return AsyncFactoryFn when given IAsyncFactoryObject", () => {
            const factory: IAsyncFactoryObject<unknown, unknown> = {
                use: function (_value: unknown): Promisable<unknown> {
                    throw new Error("Function not implemented.");
                },
            };
            expect(resolveAsyncFactory(factory)).toBeTypeOf("function");
        });
    });
    describe("function: resolveFactoryable", () => {
        test("Should return value when given IFactoryObject", () => {
            const factory: IFactoryObject<string, number> = {
                use: function (value: string): number {
                    return value.length;
                },
            };
            const str = "TEXT";
            expect(resolveFactoryable(factory, str)).toBe(str.length);
        });
        test("Should return value when given FactoryFn", () => {
            const factory: FactoryFn<string, number> = function (
                value: string,
            ): number {
                return value.length;
            };
            const str = "TEXT";
            expect(resolveFactoryable(factory, str)).toBe(str.length);
        });
        test("Should return value when given not IFactoryObject or FactoryFn", () => {
            const str = "TEXT";
            expect(resolveFactoryable(20, str)).toBe(20);
        });
    });
    describe("function: resolveAsyncFactoryable", () => {
        test("Should return value when given IAsyncFactoryObject", async () => {
            const factory: IAsyncFactoryObject<string, number> = {
                use: function (value: string): Promisable<number> {
                    return value.length;
                },
            };
            const str = "TEXT";
            expect(await resolveAsyncFactoryable(factory, str)).toBe(
                str.length,
            );
        });
        test("Should return value when given AsyncFactoryFn", async () => {
            const factory: AsyncFactoryFn<string, number> = function (
                value: string,
            ): Promisable<number> {
                return value.length;
            };
            const str = "TEXT";
            expect(await resolveAsyncFactoryable(factory, str)).toBe(
                str.length,
            );
        });
        test("Should return value when given not IAsyncFactoryObject or AsyncFactoryFn", async () => {
            const str = "TEXT";
            expect(await resolveAsyncFactoryable(20, str)).toBe(20);
        });
    });
});
