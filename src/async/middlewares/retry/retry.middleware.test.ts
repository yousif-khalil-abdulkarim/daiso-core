import {
    AsyncHooks,
    RESULT,
    resultFailure,
    resultSuccess,
    TimeSpan,
    type ResultFailure,
    type ResultSuccess,
    type Result,
} from "@/utilities/_module-exports.js";
import { describe, expect, test } from "vitest";
import z from "zod";
import { retry } from "@/async/middlewares/retry/retry.middleware.js";
import type {
    OnRetryAttemptData,
    OnRetryDelayData,
} from "@/async/middlewares/retry/retry.types.js";

describe("function: retry", () => {
    describe("With boolean return value", () => {
        test("Should not retry when given ErrorPolicyBoolSetting.treatFalseAsError is false and given Result success return value is false", async () => {
            let i = 0;
            const maxAttempts = 4;
            await new AsyncHooks(
                (): Result<boolean, Error> => {
                    i++;
                    return resultSuccess(false);
                },
                retry({
                    maxAttempts,
                    backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                    errorPolicy: {
                        treatFalseAsError: false,
                    },
                }),
            ).invoke();

            expect(i).toBe(1);
        });
        test("Should not retry when given ErrorPolicyBoolSetting.treatFalseAsError is false and given Result success return value is true", async () => {
            let i = 0;
            const maxAttempts = 4;
            await new AsyncHooks(
                (): Result<boolean, Error> => {
                    i++;
                    return resultSuccess(true);
                },
                retry({
                    maxAttempts,
                    backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                    errorPolicy: {
                        treatFalseAsError: false,
                    },
                }),
            ).invoke();

            expect(i).toBe(1);
        });
        test("Should not retry when given ErrorPolicyBoolSetting.treatFalseAsError is true and given Result success return value is true", async () => {
            let i = 0;
            const maxAttempts = 4;
            await new AsyncHooks(
                (): Result<boolean, Error> => {
                    i++;
                    return resultSuccess(true);
                },
                retry({
                    maxAttempts,
                    backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                    errorPolicy: {
                        treatFalseAsError: true,
                    },
                }),
            ).invoke();

            expect(i).toBe(1);
        });
        test("Should not retry when given ErrorPolicyBoolSetting.treatFalseAsError is true and given Result success return value is false", async () => {
            let i = 0;
            const maxAttempts = 4;
            await new AsyncHooks(
                (): Result<boolean, Error> => {
                    i++;
                    return resultSuccess(false);
                },
                retry({
                    maxAttempts,
                    backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                    errorPolicy: {
                        treatFalseAsError: true,
                    },
                }),
            ).invoke();

            expect(i).toBe(1);
        });
        test("Should not retry when given ErrorPolicyBoolSetting.treatFalseAsError is false and given false return value", async () => {
            let i = 0;
            const maxAttempts = 4;
            await new AsyncHooks(
                (): boolean => {
                    i++;
                    return false;
                },
                retry({
                    maxAttempts,
                    backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                    errorPolicy: {
                        treatFalseAsError: false,
                    },
                }),
            ).invoke();

            expect(i).toBe(1);
        });
        test("Should not retry when given ErrorPolicyBoolSetting.treatFalseAsError is false and given true return value", async () => {
            let i = 0;
            const maxAttempts = 4;
            await new AsyncHooks(
                (): boolean => {
                    i++;
                    return true;
                },
                retry({
                    maxAttempts,
                    backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                    errorPolicy: {
                        treatFalseAsError: false,
                    },
                }),
            ).invoke();

            expect(i).toBe(1);
        });
        test("Should not retry when given ErrorPolicyBoolSetting.treatFalseAsError is true and given true return value", async () => {
            let i = 0;
            const maxAttempts = 4;
            await new AsyncHooks(
                (): boolean => {
                    i++;
                    return true;
                },
                retry({
                    maxAttempts,
                    backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                    errorPolicy: {
                        treatFalseAsError: true,
                    },
                }),
            ).invoke();

            expect(i).toBe(1);
        });
        test("Should retry when ErrorPolicyBoolSetting.treatFalseAsError is true and given false return value", async () => {
            let i = 0;
            const maxAttempts = 4;
            await new AsyncHooks(
                (): boolean => {
                    i++;
                    return false;
                },
                retry({
                    maxAttempts,
                    backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                    errorPolicy: {
                        treatFalseAsError: true,
                    },
                }),
            ).invoke();

            expect(i).toBe(maxAttempts);
        });
    });
    describe("With result:", () => {
        test("Should return failed result type when all atempts fail", async () => {
            const result = await new AsyncHooks(
                (): Result<string, Error> => {
                    return resultFailure(new Error("My own error"));
                },
                retry({
                    maxAttempts: 4,
                    backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                }),
            ).invoke();

            expect(result.type).toBe(RESULT.FAILURE);
            expect((result as ResultFailure).error).toBeInstanceOf(Error);
        });
        test("Should retry until given maxAttempts", async () => {
            let repetition = 0;
            const maxAttempts = 4;

            try {
                await new AsyncHooks(
                    (): Result<string, Error> => {
                        repetition++;
                        return resultFailure(new Error("My own error"));
                    },
                    retry({
                        maxAttempts,
                        backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                    }),
                ).invoke();
            } catch {
                /* Empty */
            }

            expect(repetition).toBe(maxAttempts);
        });
        test("Should not retry when given predicate ErrorPolicy and unknown error", async () => {
            class ErrorA extends Error {}
            class ErrorB extends Error {}

            let i = 0;
            const maxAttempts = 4;
            await new AsyncHooks(
                (): Result<string, ErrorB | ErrorA> => {
                    i++;
                    return resultFailure(new ErrorB("My own error"));
                },
                retry({
                    maxAttempts,
                    backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                    errorPolicy: (error) => error instanceof ErrorA,
                }),
            ).invoke();

            expect(i).toBe(1);
        });
        test("Should not retry when given standard schema ErrorPolicy and unknown error", async () => {
            class ErrorA extends Error {}
            class ErrorB extends Error {}

            let i = 0;
            const maxAttempts = 4;
            await new AsyncHooks(
                (): Result<string, ErrorA | ErrorB> => {
                    i++;
                    return resultFailure(new ErrorB("My own error"));
                },
                retry({
                    maxAttempts,
                    backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                    errorPolicy: z.instanceof(ErrorA),
                }),
            ).invoke();

            expect(i).toBe(1);
        });
        test("Should not retry when given class ErrorPolicy and unknown error", async () => {
            class ErrorA extends Error {}
            class ErrorB extends Error {}

            let i = 0;
            const maxAttempts = 4;
            await new AsyncHooks(
                (): Result<string, ErrorA | ErrorB> => {
                    i++;
                    return resultFailure(new ErrorB("My own error"));
                },
                retry({
                    maxAttempts,
                    backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                    errorPolicy: ErrorA,
                }),
            ).invoke();

            expect(i).toBe(1);
        });
        test("Should retry specific error when given predicate ErrorPolicy", async () => {
            class ErrorA extends Error {}

            let i = 0;
            const maxAttempts = 4;
            await new AsyncHooks(
                (): Result<string, ErrorA> => {
                    i++;
                    return resultFailure(new ErrorA("My own error"));
                },
                retry({
                    maxAttempts,
                    backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                    errorPolicy: (error) => error instanceof ErrorA,
                }),
            ).invoke();

            expect(i).toBe(maxAttempts);
        });
        test("Should retry specific error when given standard schema ErrorPolicy", async () => {
            class ErrorA extends Error {}

            let i = 0;
            const maxAttempts = 4;
            await new AsyncHooks(
                (): Result<string, ErrorA> => {
                    i++;
                    return resultFailure(new ErrorA("My own error"));
                },
                retry({
                    maxAttempts,
                    backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                    errorPolicy: z.instanceof(ErrorA),
                }),
            ).invoke();

            expect(i).toBe(maxAttempts);
        });
        test("Should retry specific error when given class ErrorPolicy", async () => {
            class ErrorA extends Error {}

            let i = 0;
            const maxAttempts = 4;
            await new AsyncHooks(
                (): Result<string, ErrorA> => {
                    i++;
                    return resultFailure(new ErrorA("My own error"));
                },
                retry({
                    maxAttempts,
                    backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                    errorPolicy: ErrorA,
                }),
            ).invoke();

            expect(i).toBe(maxAttempts);
        });
        test("Should return value after throwing 4 times", async () => {
            let repetition = 0;
            const maxAttempts = 4;

            const result = await new AsyncHooks(
                (): Result<string, Error> => {
                    repetition++;
                    if (repetition < maxAttempts) {
                        return resultFailure(new Error("My own error"));
                    }
                    return resultSuccess("text");
                },
                retry({
                    maxAttempts,
                    backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                }),
            ).invoke();

            expect(result.type).toBe(RESULT.SUCCESS);
            expect((result as ResultSuccess).value).toBe("text");
        });
        test("Should call onExecutionAttempt callback when failed result is returned", async () => {
            let repetition = 0;
            const maxAttempts = 4;
            let data = null as OnRetryAttemptData | null;
            try {
                await new AsyncHooks(
                    (_url: string): Result<string, Error> => {
                        return resultFailure(new Error("My own error"));
                    },
                    retry({
                        maxAttempts,
                        backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                        onExecutionAttempt(data_) {
                            data = data_;
                            repetition++;
                        },
                    }),
                    {
                        context: {
                            name: "fetchData",
                        },
                    },
                ).invoke("ENDPOINT");
            } catch {
                /* Empty */
            }
            expect(data?.attempt).toBe(maxAttempts);
            expect(data?.args).toStrictEqual(["ENDPOINT"]);
            expect(data?.context).toStrictEqual({
                name: "fetchData",
            });
            expect(repetition).toBe(maxAttempts);
        });
        test("Should call onExecutionAttempt callback when no failed result is returned", async () => {
            let repetition = 0;
            const maxAttempts = 4;
            let data = null as OnRetryAttemptData | null;
            try {
                await new AsyncHooks(
                    (_url: string): Result<string, Error> => {
                        return resultSuccess("data");
                    },
                    retry({
                        maxAttempts,
                        backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                        onExecutionAttempt(data_) {
                            data = data_;
                            repetition++;
                        },
                    }),
                    {
                        context: {
                            name: "fetchData",
                        },
                    },
                ).invoke("ENDPOINT");
            } catch {
                /* Empty */
            }
            expect(data?.attempt).toBe(1);
            expect(data?.args).toStrictEqual(["ENDPOINT"]);
            expect(data?.context).toStrictEqual({
                name: "fetchData",
            });
            expect(repetition).toBe(1);
        });
        test("Should call onRetryDelay callback when failed result is returned", async () => {
            let repetition = 0;
            const maxAttempts = 4;
            let data = null as OnRetryDelayData | null;
            try {
                await new AsyncHooks(
                    (_url: string): Result<string, Error> => {
                        return resultFailure(new Error("My own error"));
                    },
                    retry({
                        maxAttempts,
                        backoffPolicy: () => TimeSpan.fromMilliseconds(25),
                        onRetryDelay(data_) {
                            data = data_;
                            repetition++;
                        },
                    }),
                    {
                        context: {
                            name: "fetchData",
                        },
                    },
                ).invoke("ENDPOINT");
            } catch {
                /* Empty */
            }
            expect(data?.args).toStrictEqual(["ENDPOINT"]);
            expect(data?.attempt).toBe(maxAttempts);
            expect(data?.context).toStrictEqual({
                name: "fetchData",
            });
            expect(data?.error).toBeInstanceOf(Error);
            expect(data?.waitTime.toMilliseconds()).toBe(25);
            expect(repetition).toBe(maxAttempts);
        });
        test("Should not call onRetryDelay callback when no failed result is returned", async () => {
            let repetition = 0;
            const maxAttempts = 4;
            let data = null as OnRetryDelayData | null;
            try {
                await new AsyncHooks(
                    (_url: string): string => {
                        return "data";
                    },
                    retry({
                        maxAttempts,
                        backoffPolicy: () => TimeSpan.fromMilliseconds(25),
                        onRetryDelay(data_) {
                            data = data_;
                            repetition++;
                        },
                    }),
                    {
                        context: {
                            name: "fetchData",
                        },
                    },
                ).invoke("ENDPOINT");
            } catch {
                /* Empty */
            }
            expect(data).toBeNull();
            expect(repetition).toBe(0);
        });
    });
    describe("With throw error:", () => {
        test("Should throw Error when all atempts fail", async () => {
            const promise = new AsyncHooks(
                () => {
                    throw new Error("My own error");
                },
                retry({
                    maxAttempts: 4,
                    backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                }),
            ).invoke();

            await expect(promise).rejects.toBeInstanceOf(Error);
        });
        test("Should retry until given maxAttempts", async () => {
            let repetition = 0;
            const maxAttempts = 4;

            try {
                await new AsyncHooks(
                    () => {
                        repetition++;
                        throw new Error("My own error");
                    },
                    retry({
                        maxAttempts,
                        backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                    }),
                ).invoke();
            } catch {
                /* Empty */
            }

            expect(repetition).toBe(maxAttempts);
        });
        test("Should not retry when given predicate ErrorPolicy and unknown error", async () => {
            class ErrorA extends Error {}
            class ErrorB extends Error {}

            let i = 0;
            const maxAttempts = 4;
            const promise = new AsyncHooks(
                (): string => {
                    i++;
                    throw new ErrorB("My own error");
                },
                retry({
                    maxAttempts,
                    backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                    errorPolicy: (error) => error instanceof ErrorA,
                }),
            ).invoke();

            try {
                await promise;
            } catch {
                /* EMPTY */
            }

            expect(i).toBe(1);
        });
        test("Should not retry when given standard schema ErrorPolicy and unknown error", async () => {
            class ErrorA extends Error {}
            class ErrorB extends Error {}

            let i = 0;
            const maxAttempts = 4;
            const promise = new AsyncHooks(
                (): string => {
                    i++;
                    throw new ErrorB("My own error");
                },
                retry({
                    maxAttempts,
                    backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                    errorPolicy: z.instanceof(ErrorA),
                }),
            ).invoke();

            try {
                await promise;
            } catch {
                /* EMPTY */
            }

            expect(i).toBe(1);
        });
        test("Should not retry when given class ErrorPolicy and unknown error", async () => {
            class ErrorA extends Error {}
            class ErrorB extends Error {}

            let i = 0;
            const maxAttempts = 4;
            const promise = new AsyncHooks(
                (): string => {
                    i++;
                    throw new ErrorB("My own error");
                },
                retry({
                    maxAttempts,
                    backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                    errorPolicy: ErrorA,
                }),
            ).invoke();

            try {
                await promise;
            } catch {
                /* EMPTY */
            }

            expect(i).toBe(1);
        });
        test("Should retry specific error when given predicate ErrorPolicy", async () => {
            class ErrorA extends Error {}

            let i = 0;
            const maxAttempts = 4;
            const promise = new AsyncHooks(
                (): string => {
                    i++;
                    throw new ErrorA("My own error");
                },
                retry({
                    maxAttempts,
                    backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                    errorPolicy: (error) => error instanceof ErrorA,
                }),
            ).invoke();

            try {
                await promise;
            } catch {
                /* EMPTY */
            }

            expect(i).toBe(maxAttempts);
        });
        test("Should retry specific error when given standard schema ErrorPolicy", async () => {
            class ErrorA extends Error {}

            let i = 0;
            const maxAttempts = 4;
            const promise = new AsyncHooks(
                (): string => {
                    i++;
                    throw new ErrorA("My own error");
                },
                retry({
                    maxAttempts,
                    backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                    errorPolicy: z.instanceof(ErrorA),
                }),
            ).invoke();

            try {
                await promise;
            } catch {
                /* EMPTY */
            }

            expect(i).toBe(maxAttempts);
        });
        test("Should retry specific error when given class ErrorPolicy", async () => {
            class ErrorA extends Error {}

            let i = 0;
            const maxAttempts = 4;
            const promise = new AsyncHooks(
                (): string => {
                    i++;
                    throw new ErrorA("My own error");
                },
                retry({
                    maxAttempts,
                    backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                    errorPolicy: ErrorA,
                }),
            ).invoke();

            try {
                await promise;
            } catch {
                /* EMPTY */
            }

            expect(i).toBe(maxAttempts);
        });
        test("Should return value after throwing 4 times", async () => {
            let repetition = 0;
            const maxAttempts = 4;

            const promise = new AsyncHooks(
                () => {
                    repetition++;
                    if (repetition < maxAttempts) {
                        throw new Error("My own error");
                    }
                    return "text";
                },
                retry({
                    maxAttempts,
                    backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                }),
            ).invoke();

            await expect(promise).resolves.toBe("text");
        });
        test("Should call onExecutionAttempt callback when error is thrown", async () => {
            let repetition = 0;
            const maxAttempts = 4;
            let data = null as OnRetryAttemptData | null;
            try {
                await new AsyncHooks(
                    (_url: string): string => {
                        throw new Error("My own error");
                    },
                    retry({
                        maxAttempts,
                        backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                        onExecutionAttempt(data_) {
                            data = data_;
                            repetition++;
                        },
                    }),
                    {
                        context: {
                            name: "fetchData",
                        },
                    },
                ).invoke("ENDPOINT");
            } catch {
                /* Empty */
            }
            expect(data?.attempt).toBe(maxAttempts);
            expect(data?.args).toStrictEqual(["ENDPOINT"]);
            expect(data?.context).toStrictEqual({
                name: "fetchData",
            });
            expect(repetition).toBe(maxAttempts);
        });
        test("Should call onExecutionAttempt callback when no error is thrown", async () => {
            let repetition = 0;
            const maxAttempts = 4;
            let data = null as OnRetryAttemptData | null;
            try {
                await new AsyncHooks(
                    (_url: string): string => {
                        return "data";
                    },
                    retry({
                        maxAttempts,
                        backoffPolicy: () => TimeSpan.fromMilliseconds(0),
                        onExecutionAttempt(data_) {
                            data = data_;
                            repetition++;
                        },
                    }),
                    {
                        context: {
                            name: "fetchData",
                        },
                    },
                ).invoke("ENDPOINT");
            } catch {
                /* Empty */
            }
            expect(data?.attempt).toBe(1);
            expect(data?.args).toStrictEqual(["ENDPOINT"]);
            expect(data?.context).toStrictEqual({
                name: "fetchData",
            });
            expect(repetition).toBe(1);
        });
        test("Should call onRetryDelay callback when error is thrown", async () => {
            let repetition = 0;
            const maxAttempts = 4;
            let data = null as OnRetryDelayData | null;
            try {
                await new AsyncHooks(
                    (_url: string): string => {
                        throw new Error("My own error");
                    },
                    retry({
                        maxAttempts,
                        backoffPolicy: () => TimeSpan.fromMilliseconds(25),
                        onRetryDelay(data_) {
                            data = data_;
                            repetition++;
                        },
                    }),
                    {
                        context: {
                            name: "fetchData",
                        },
                    },
                ).invoke("ENDPOINT");
            } catch {
                /* Empty */
            }
            expect(data?.args).toStrictEqual(["ENDPOINT"]);
            expect(data?.attempt).toBe(maxAttempts);
            expect(data?.context).toStrictEqual({
                name: "fetchData",
            });
            expect(data?.error).toBeInstanceOf(Error);
            expect(data?.waitTime.toMilliseconds()).toBe(25);
            expect(repetition).toBe(maxAttempts);
        });
        test("Should not call onRetryDelay callback when no error is thrown", async () => {
            let repetition = 0;
            const maxAttempts = 4;
            let data = null as OnRetryDelayData | null;
            try {
                await new AsyncHooks(
                    (_url: string): string => {
                        return "data";
                    },
                    retry({
                        maxAttempts,
                        backoffPolicy: () => TimeSpan.fromMilliseconds(25),
                        onRetryDelay(data_) {
                            data = data_;
                            repetition++;
                        },
                    }),
                    {
                        context: {
                            name: "fetchData",
                        },
                    },
                ).invoke("ENDPOINT");
            } catch {
                /* Empty */
            }
            expect(data).toBeNull();
            expect(repetition).toBe(0);
        });
    });
});
