import { AsyncHooks } from "@/utilities/_module-exports.js";
import { describe, expect, test } from "vitest";
import {
    observationMiddleware,
    type OnErrorData,
    type OnSuccessData,
} from "@/async/middlewares/observation/observation.middleware.js";

describe("function: observationMiddleware", () => {
    test("Should call onSuccess callback when no error is thrown", async () => {
        let data = null as OnSuccessData | null;
        await new AsyncHooks(
            (_url: string): string => {
                return "DATA";
            },
            [
                observationMiddleware({
                    onSuccess(data_) {
                        data = data_;
                    },
                }),
            ],
            {
                name: "fetchData",
            },
        ).invoke("ENDPOINT");
        expect(data?.args).toStrictEqual(["ENDPOINT"]);
        expect(data?.context).toStrictEqual({
            name: "fetchData",
        });
        expect(data?.returnValue).toBe("DATA");
    });
    test("Should not call onSuccess callback when error is thrown", async () => {
        let data = null as OnSuccessData | null;
        const promise = new AsyncHooks((): string => {
            throw new Error("error");
        }, [
            observationMiddleware({
                onSuccess(data_) {
                    data = data_;
                },
            }),
        ]).invoke();
        try {
            await promise;
        } catch {
            /* Empty */
        }
        expect(data).toBeNull();
    });
    test("Should call onError callback when error is thrown", async () => {
        let data = null as OnErrorData | null;
        const promise = new AsyncHooks(
            (_url: string): string => {
                throw new Error("UNEXPECTED");
            },
            [
                observationMiddleware({
                    onError(data_) {
                        data = data_;
                    },
                }),
            ],
            {
                name: "fetchData",
            },
        ).invoke("ENDPOINT");
        try {
            await promise;
        } catch {
            /* Empty */
        }
        expect(data?.args).toStrictEqual(["ENDPOINT"]);
        expect(data?.context).toStrictEqual({
            name: "fetchData",
        });
        expect(data?.error).toBeInstanceOf(Error);
    });
    test("Should not call onError callback when no error is thrown", async () => {
        let data = null as OnErrorData | null;
        await new AsyncHooks((): string => {
            return "a";
        }, [
            observationMiddleware({
                onError(data_) {
                    data = data_;
                },
            }),
        ]).invoke();
        expect(data).toBeNull();
    });
    test("Should call onFinally callback when no error is thrown", async () => {
        type Context = {
            name: string;
        };
        let data = null as Context | null;
        await new AsyncHooks(
            (): string => {
                return "str";
            },
            [
                observationMiddleware({
                    onFinally(data_) {
                        data = data_ as Context;
                    },
                }),
            ],
            { name: "fetchData" } satisfies Context,
        ).invoke();

        expect(data).toStrictEqual({
            name: "fetchData",
        });
    });
    test("Should call onFinally callback when error is thrown", async () => {
        type Context = {
            name: string;
        };
        let data = null as Context | null;
        const promise = new AsyncHooks(
            (): string => {
                throw new Error("error");
            },
            [
                observationMiddleware({
                    onFinally(data_) {
                        data = data_ as Context;
                    },
                }),
            ],
            { name: "fetchData" } satisfies Context,
        ).invoke();
        try {
            await promise;
        } catch {
            /* Empty */
        }
        expect(data).toStrictEqual({
            name: "fetchData",
        });
    });
});
