import {
    AsyncHooks,
    resultFailure,
    resultSuccess,
    TimeSpan,
    type Result,
} from "@/utilities/_module-exports.js";
import { describe, expect, test } from "vitest";
import {
    type OnObserveErrorData,
    type OnObserveFinallyData,
    type OnObserveStartData,
    type OnObserveSuccessData,
} from "@/async/middlewares/observe/observe.types.js";
import { observe } from "@/async/middlewares/observe/observe.middleware.js";

describe("function: observe", () => {
    test("Should call onStart callback when no error is thrown", async () => {
        let data = null as OnObserveStartData | null;
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
                context: {
                    name: "fetchData",
                },
            },
        ).invoke("ENDPOINT");
        expect(data?.args).toStrictEqual(["ENDPOINT"]);
        expect(data?.context).toStrictEqual({
            name: "fetchData",
        });
    });
    test("Should call onStart callback when error is thrown", async () => {
        let data = null as OnObserveStartData | null;
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
                context: {
                    name: "fetchData",
                },
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
    test("Should call onStart callback when failed Result is returned", async () => {
        let data = null as OnObserveStartData | null;
        const promise = new AsyncHooks(
            (_url: string): Result<string, Error> => {
                return resultFailure(new Error("Unexpected error"));
            },
            [
                observe({
                    onStart(data_) {
                        data = data_;
                    },
                }),
            ],
            {
                context: {
                    name: "fetchData",
                },
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
        let data = null as OnObserveSuccessData | null;
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
                context: {
                    name: "fetchData",
                },
            },
        ).invoke("ENDPOINT");
        expect(data?.args).toStrictEqual(["ENDPOINT"]);
        expect(data?.context).toStrictEqual({
            name: "fetchData",
        });
        expect(data?.returnValue).toBe("DATA");
    });
    test("Should call onSuccess callback when success Result is returned", async () => {
        let data = null as OnObserveSuccessData | null;
        await new AsyncHooks(
            (_url: string): Result<string, Error> => {
                return resultSuccess("DATA");
            },
            [
                observe({
                    onSuccess(data_) {
                        data = data_;
                    },
                }),
            ],
            {
                context: {
                    name: "fetchData",
                },
            },
        ).invoke("ENDPOINT");
        expect(data?.args).toStrictEqual(["ENDPOINT"]);
        expect(data?.context).toStrictEqual({
            name: "fetchData",
        });
        expect(data?.returnValue).toBe("DATA");
    });
    test("Should not call onSuccess callback when error is thrown", async () => {
        let data = null as OnObserveSuccessData | null;
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
    test("Should not call onSuccess callback when failed Result is returned", async () => {
        let data = null as OnObserveSuccessData | null;
        const promise = new AsyncHooks((): Result<string, Error> => {
            return resultFailure(new Error("error"));
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
        let data = null as OnObserveErrorData | null;
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
                context: {
                    name: "fetchData",
                },
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
    test("Should call onError callback when failed Result is returned", async () => {
        let data = null as OnObserveErrorData | null;
        const promise = new AsyncHooks(
            (_url: string): Result<string, Error> => {
                return resultFailure(new Error("UNEXPECTED"));
            },
            [
                observe({
                    onError(data_) {
                        data = data_;
                    },
                }),
            ],
            {
                context: {
                    name: "fetchData",
                },
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
        let data = null as OnObserveErrorData | null;
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
        let data = null as OnObserveFinallyData | null;
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
            {
                context: {
                    name: "fetchData",
                },
            },
        ).invoke();

        expect(data?.executionTime).toBeInstanceOf(TimeSpan);
        expect(data?.context).toStrictEqual({
            name: "fetchData",
        });
    });
    test("Should call onFinally callback when error is thrown", async () => {
        let data = null as OnObserveFinallyData | null;
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
            {
                context: {
                    name: "fetchData",
                },
            },
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
    test("Should call onFinally callback when failed Result is returned", async () => {
        let data = null as OnObserveFinallyData | null;
        const promise = new AsyncHooks(
            (): Result<string> => {
                return resultFailure(new Error("error"));
            },
            [
                observe({
                    onFinally(data_) {
                        data = data_;
                    },
                }),
            ],
            {
                context: {
                    name: "fetchData",
                },
            },
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
