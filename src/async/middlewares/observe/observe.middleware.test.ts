import { AsyncHooks, TimeSpan } from "@/utilities/_module-exports.js";
import { describe, expect, test } from "vitest";
import {
    observe,
    type OnErrorData,
    type OnFinallyData,
    type OnStartData,
    type OnSuccessData,
} from "@/async/middlewares/observe/observe.middleware.js";

describe("function: observe", () => {
    test("Should call onStart callback when no error is thrown", async () => {
        let data = null as OnStartData | null;
        await new AsyncHooks(
            (_url: string): string => {
                return "DATA";
            },
            [
                observe({
                    onStart(data_) {
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
    });
    test("Should call onStart callback when error is thrown", async () => {
        let data = null as OnStartData | null;
        const promise = new AsyncHooks(
            (_url: string): string => {
                throw new Error("Unexpected error");
            },
            [
                observe({
                    onStart(data_) {
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
    });
    test("Should call onSuccess callback when no error is thrown", async () => {
        let data = null as OnSuccessData | null;
        await new AsyncHooks(
            (_url: string): string => {
                return "DATA";
            },
            [
                observe({
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
            observe({
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
                observe({
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
            observe({
                onError(data_) {
                    data = data_;
                },
            }),
        ]).invoke();
        expect(data).toBeNull();
    });
    test("Should call onFinally callback when no error is thrown", async () => {
        let data = null as OnFinallyData | null;
        await new AsyncHooks(
            (): string => {
                return "str";
            },
            [
                observe({
                    onFinally(data_) {
                        data = data_;
                    },
                }),
            ],
            { name: "fetchData" },
        ).invoke();

        expect(data?.executionTime).toBeInstanceOf(TimeSpan);
        expect(data?.context).toStrictEqual({
            name: "fetchData",
        });
    });
    test("Should call onFinally callback when error is thrown", async () => {
        let data = null as OnFinallyData | null;
        const promise = new AsyncHooks(
            (): string => {
                throw new Error("error");
            },
            [
                observe({
                    onFinally(data_) {
                        data = data_;
                    },
                }),
            ],
            { name: "fetchData" },
        ).invoke();
        try {
            await promise;
        } catch {
            /* Empty */
        }

        expect(data?.executionTime).toBeInstanceOf(TimeSpan);
        expect(data?.context).toStrictEqual({
            name: "fetchData",
        });
    });
});
