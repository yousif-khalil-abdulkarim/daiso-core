import { describe, expect, test } from "vitest";
import {
    isInvokable,
    isInvokableFn,
    isInvokableObject,
    resolveInvokable,
    type IInvokableObject,
    type InvokableFn,
} from "@/utilities/_module-exports.js";

describe("file: invokable.ts", () => {
    describe("function: isInvokableObject", () => {
        test("Should return false when given InvokableFn", () => {
            const invokable: InvokableFn<[], string> = () => "";
            expect(isInvokableObject(invokable)).toBe(false);
        });
        test("Should return true when given IInvokableObject", () => {
            const invokable: IInvokableObject<[], string> = {
                invoke: function (): string {
                    return "";
                },
            };
            expect(isInvokableObject(invokable)).toBe(true);
        });
        test("Should return false when given not InvokableFn or IInvokableObject", () => {
            expect(isInvokableObject("")).toBe(false);
        });
    });
    describe("function: isInvokableFn", () => {
        test("Should return true when given InvokableFn", () => {
            const invokable: InvokableFn<[], string> = () => "";
            expect(isInvokableFn(invokable)).toBe(true);
        });
        test("Should return false when given IInvokableObject", () => {
            const invokable: IInvokableObject<[], string> = {
                invoke: function (): string {
                    return "";
                },
            };
            expect(isInvokableFn(invokable)).toBe(false);
        });
        test("Should return false when given not InvokableFn or IInvokableObject", () => {
            expect(isInvokableFn("")).toBe(false);
        });
    });
    describe("function: isInvokable", () => {
        test("Should return true when given InvokableFn", () => {
            const invokable: InvokableFn<[], string> = () => "";
            expect(isInvokable(invokable)).toBe(true);
        });
        test("Should return true when given IInvokableObject", () => {
            const invokable: IInvokableObject<[], string> = {
                invoke: function (): string {
                    return "";
                },
            };
            expect(isInvokable(invokable)).toBe(true);
        });
        test("Should return false when given not InvokableFn or IInvokableObject", () => {
            expect(isInvokable("")).toBe(false);
        });
    });
    describe("function: resolveInvokable", () => {
        test("Should return InvokableFn when given InvokableFn", () => {
            const invokable: InvokableFn<[], string> = () => "";
            expect(resolveInvokable(invokable)).toBe(invokable);
        });
        test("Should return InvokableFn when given IInvokableObject", () => {
            const invokable: IInvokableObject<[], string> = {
                invoke: function (): string {
                    return "";
                },
            };
            expect(resolveInvokable(invokable)).toBeTypeOf("function");
        });
    });
});
