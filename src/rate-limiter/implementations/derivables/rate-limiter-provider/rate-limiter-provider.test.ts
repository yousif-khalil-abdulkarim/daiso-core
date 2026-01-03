import { beforeEach, describe, expect, test, vi } from "vitest";

import { MemoryEventBusAdapter } from "@/event-bus/implementations/adapters/_module.js";
import { EventBus } from "@/event-bus/implementations/derivables/_module.js";
import {
    BlockedRateLimiterError,
    RATE_LIMITER_EVENTS,
    type AllowedRateLimiterEvent,
    type BlockedRateLimiterEvent,
    type IRateLimiterProvider,
    type IRateLimiterStateMethods,
    type ResetedRateLimiterEvent,
    type TrackedFailureRateLimiterEvent,
    type UntrackedFailureRateLimiterEvent,
} from "@/rate-limiter/contracts/_module.js";
import {
    type IRateLimiterAdapter,
    type IRateLimiterAdapterState,
} from "@/rate-limiter/contracts/rate-limiter-adapter.contract.js";
import { RateLimiterProvider } from "@/rate-limiter/implementations/derivables/rate-limiter-provider/rate-limiter-provider.js";
import { TimeSpan } from "@/time-span/implementations/_module.js";

describe("class: RateLimiterProvider", () => {
    const adapter: IRateLimiterAdapter = {
        getState: function (
            _key: string,
        ): Promise<IRateLimiterAdapterState | null> {
            throw new Error("Function not implemented.");
        },
        updateState: function (
            _key: string,
            _limit: number,
        ): Promise<IRateLimiterAdapterState> {
            throw new Error("Function not implemented.");
        },
        reset: function (_key: string): Promise<void> {
            throw new Error("Function not implemented.");
        },
    };
    const KEY = "a";

    let rateLimiterProvider: IRateLimiterProvider;
    beforeEach(() => {
        vi.resetAllMocks();
        rateLimiterProvider = new RateLimiterProvider({
            adapter,
            eventBus: new EventBus({
                adapter: new MemoryEventBusAdapter(),
            }),
            // serde: new Serde(new SuperJsonSerdeAdapter()),
            enableAsyncTracking: false,
        });
    });

    describe("API tests:", () => {
        describe("method: runOrFail", () => {
            describe("onlyError = true", () => {
                test("Should call IRateLimiterAdapter.updateState when the function throws an error", async () => {
                    const state: IRateLimiterAdapterState = {
                        success: true,
                        attempt: 1,
                        resetTime: null,
                    };
                    const updateStateSpy = vi
                        .spyOn(adapter, "updateState")
                        .mockImplementation(() => Promise.resolve(state));
                    vi.spyOn(adapter, "getState").mockImplementation(() =>
                        Promise.resolve(state),
                    );

                    try {
                        await rateLimiterProvider
                            .create(KEY, {
                                limit: 5,
                                onlyError: true,
                            })
                            .runOrFail(() => {
                                throw new Error("Unexpected error");
                            });
                    } catch {
                        /* EMPTY */
                    }

                    expect(updateStateSpy).toHaveBeenCalledOnce();
                });
                test("Should not call IRateLimiterAdapter.updateState when the function does not throw an error", async () => {
                    const state: IRateLimiterAdapterState = {
                        success: true,
                        attempt: 1,
                        resetTime: null,
                    };
                    const updateStateSpy = vi
                        .spyOn(adapter, "updateState")
                        .mockImplementation(() => Promise.resolve(state));
                    vi.spyOn(adapter, "getState").mockImplementation(() =>
                        Promise.resolve(state),
                    );

                    await rateLimiterProvider
                        .create(KEY, {
                            limit: 5,
                            onlyError: true,
                        })
                        .runOrFail(() => {});

                    expect(updateStateSpy).not.toHaveBeenCalled();
                });
                test("Should call IRateLimiterAdapter.getState when the function throws an error", async () => {
                    const state: IRateLimiterAdapterState = {
                        success: true,
                        attempt: 1,
                        resetTime: null,
                    };
                    vi.spyOn(adapter, "updateState").mockImplementation(() =>
                        Promise.resolve(state),
                    );
                    const getStateSpy = vi
                        .spyOn(adapter, "getState")
                        .mockImplementation(() => Promise.resolve(state));

                    try {
                        await rateLimiterProvider
                            .create(KEY, {
                                limit: 5,
                                onlyError: true,
                            })
                            .runOrFail(() => {
                                throw new Error("Unexpected error");
                            });
                    } catch {
                        /* EMPTY */
                    }

                    expect(getStateSpy).toHaveBeenCalledOnce();
                });
                test("Should call IRateLimiterAdapter.getState when the function does not throw an error", async () => {
                    const state: IRateLimiterAdapterState = {
                        success: true,
                        attempt: 1,
                        resetTime: null,
                    };
                    vi.spyOn(adapter, "updateState").mockImplementation(() =>
                        Promise.resolve(state),
                    );
                    const getStateSpy = vi
                        .spyOn(adapter, "getState")
                        .mockImplementation(() => Promise.resolve(state));

                    await rateLimiterProvider
                        .create(KEY, {
                            limit: 5,
                            onlyError: true,
                        })
                        .runOrFail(() => {});

                    expect(getStateSpy).toHaveBeenCalledOnce();
                });
                test("Should throw BlockedRateLimiterError when in limit is reached", async () => {
                    const state: IRateLimiterAdapterState = {
                        success: false,
                        attempt: 1,
                        resetTime: TimeSpan.fromMinutes(5),
                    };
                    vi.spyOn(adapter, "updateState").mockImplementation(() =>
                        Promise.resolve(state),
                    );
                    vi.spyOn(adapter, "getState").mockImplementation(() =>
                        Promise.resolve(state),
                    );

                    const rateLimiter = rateLimiterProvider.create(KEY, {
                        limit: 5,
                        onlyError: true,
                    });
                    const promise = rateLimiter.runOrFail(() => {
                        return Promise.reject(new Error("UNEXPECTED ERROR"));
                    });
                    await expect(promise).rejects.toBeInstanceOf(
                        BlockedRateLimiterError,
                    );
                });
            });
            describe("onlyError = false", () => {
                test("Should call IRateLimiterAdapter.updateState when the function throws an error", async () => {
                    const state: IRateLimiterAdapterState = {
                        success: true,
                        attempt: 1,
                        resetTime: null,
                    };
                    const updateStateSpy = vi
                        .spyOn(adapter, "updateState")
                        .mockImplementation(() => Promise.resolve(state));
                    vi.spyOn(adapter, "getState").mockImplementation(() =>
                        Promise.resolve(state),
                    );

                    try {
                        await rateLimiterProvider
                            .create(KEY, {
                                limit: 5,
                                onlyError: false,
                            })
                            .runOrFail(() => {
                                throw new Error("Unexpected error");
                            });
                    } catch {
                        /* EMPTY */
                    }

                    expect(updateStateSpy).toHaveBeenCalledOnce();
                });
                test("Should call IRateLimiterAdapter.updateState when the function does not throw an error", async () => {
                    const state: IRateLimiterAdapterState = {
                        success: true,
                        attempt: 1,
                        resetTime: null,
                    };
                    const updateStateSpy = vi
                        .spyOn(adapter, "updateState")
                        .mockImplementation(() => Promise.resolve(state));
                    vi.spyOn(adapter, "getState").mockImplementation(() =>
                        Promise.resolve(state),
                    );

                    await rateLimiterProvider
                        .create(KEY, {
                            limit: 5,
                            onlyError: false,
                        })
                        .runOrFail(() => {});

                    expect(updateStateSpy).toHaveBeenCalledOnce();
                });
                test("Should not call IRateLimiterAdapter.getState when the function throws an error", async () => {
                    const state: IRateLimiterAdapterState = {
                        success: true,
                        attempt: 1,
                        resetTime: null,
                    };
                    vi.spyOn(adapter, "updateState").mockImplementation(() =>
                        Promise.resolve(state),
                    );
                    const getStateSpy = vi
                        .spyOn(adapter, "getState")
                        .mockImplementation(() => Promise.resolve(state));

                    try {
                        await rateLimiterProvider
                            .create(KEY, {
                                limit: 5,
                                onlyError: false,
                            })
                            .runOrFail(() => {
                                throw new Error("Unexpected error");
                            });
                    } catch {
                        /* EMPTY */
                    }

                    expect(getStateSpy).not.toHaveBeenCalledOnce();
                });
                test("Should not call IRateLimiterAdapter.getState when the function does not throw an error", async () => {
                    const state: IRateLimiterAdapterState = {
                        success: true,
                        attempt: 1,
                        resetTime: null,
                    };
                    vi.spyOn(adapter, "updateState").mockImplementation(() =>
                        Promise.resolve(state),
                    );
                    const getStateSpy = vi
                        .spyOn(adapter, "getState")
                        .mockImplementation(() => Promise.resolve(state));

                    await rateLimiterProvider
                        .create(KEY, {
                            limit: 5,
                            onlyError: false,
                        })
                        .runOrFail(() => {});

                    expect(getStateSpy).not.toHaveBeenCalledOnce();
                });
                test("Should throw BlockedRateLimiterError when in limit is reached", async () => {
                    const state: IRateLimiterAdapterState = {
                        success: false,
                        attempt: 1,
                        resetTime: TimeSpan.fromMinutes(5),
                    };
                    vi.spyOn(adapter, "updateState").mockImplementation(() =>
                        Promise.resolve(state),
                    );

                    const rateLimiter = rateLimiterProvider.create(KEY, {
                        limit: 5,
                        onlyError: false,
                    });
                    const promise = rateLimiter.runOrFail(() => {
                        return Promise.reject(new Error("UNEXPECTED ERROR"));
                    });
                    await expect(promise).rejects.toBeInstanceOf(
                        BlockedRateLimiterError,
                    );
                });
            });
        });
        describe("method: reset", () => {
            test("Should call IRateLimiterAdapter.reset", async () => {
                const resetSpy = vi
                    .spyOn(adapter, "reset")
                    .mockImplementation(() => Promise.resolve());

                const rateLimiter = rateLimiterProvider.create(KEY, {
                    limit: 10,
                });

                await rateLimiter.reset();

                expect(resetSpy).toHaveBeenCalledOnce();
            });
        });
    });
    describe("Event tests:", () => {
        describe("method: runOrFail", () => {
            describe("onlyError = true", () => {
                test("Should dispatch TrackedFailureRateLimiterEvent when the function throws", async () => {
                    const state: IRateLimiterAdapterState = {
                        success: true,
                        attempt: 1,
                        resetTime: null,
                    };
                    vi.spyOn(adapter, "getState").mockImplementation(() => {
                        return Promise.resolve(state);
                    });
                    vi.spyOn(adapter, "updateState").mockImplementation(() => {
                        return Promise.resolve(state);
                    });

                    const handlerFn = vi.fn(
                        (_event: TrackedFailureRateLimiterEvent) => {},
                    );
                    await rateLimiterProvider.addListener(
                        RATE_LIMITER_EVENTS.TRACKED_FAILURE,
                        handlerFn,
                    );

                    const limit = 5;
                    class ErrorA extends Error {}
                    try {
                        await rateLimiterProvider
                            .create(KEY, {
                                limit,
                                onlyError: true,
                            })
                            .runOrFail(() => {
                                throw new ErrorA("Unexpected error");
                            });
                    } catch {
                        /* EMPTY */
                    }

                    expect(handlerFn).toHaveBeenCalledOnce();
                    expect(handlerFn).toHaveBeenCalledWith(
                        expect.objectContaining({
                            rateLimiter: expect.objectContaining({
                                getState: expect.any(
                                    Function,
                                ) as IRateLimiterStateMethods["getState"],
                                key: KEY,
                                limit,
                            } satisfies IRateLimiterStateMethods) as IRateLimiterStateMethods,
                            error: expect.any(ErrorA),
                        } satisfies TrackedFailureRateLimiterEvent),
                    );
                });
                test("Should not dispatch TrackedFailureRateLimiterEvent when given error doesnt match the error policy", async () => {
                    const state: IRateLimiterAdapterState = {
                        success: true,
                        attempt: 1,
                        resetTime: null,
                    };
                    vi.spyOn(adapter, "getState").mockImplementation(() => {
                        return Promise.resolve(state);
                    });
                    vi.spyOn(adapter, "updateState").mockImplementation(() => {
                        return Promise.resolve(state);
                    });

                    const handlerFn = vi.fn(
                        (_event: TrackedFailureRateLimiterEvent) => {},
                    );
                    await rateLimiterProvider.addListener(
                        RATE_LIMITER_EVENTS.TRACKED_FAILURE,
                        handlerFn,
                    );

                    class ErrorA extends Error {}
                    class ErrorB extends Error {}
                    try {
                        await rateLimiterProvider
                            .create(KEY, {
                                limit: 5,
                                onlyError: true,
                                errorPolicy: ErrorA,
                            })
                            .runOrFail(() => {
                                throw new ErrorB("Unexpected error");
                            });
                    } catch {
                        /* EMPTY */
                    }

                    expect(handlerFn).not.toHaveBeenCalled();
                });
                test("Should dispatch UntrackedFailureRateLimiterEvent when given error doesnt match the error policy", async () => {
                    const state: IRateLimiterAdapterState = {
                        success: true,
                        attempt: 1,
                        resetTime: null,
                    };
                    vi.spyOn(adapter, "getState").mockImplementation(() => {
                        return Promise.resolve(state);
                    });
                    vi.spyOn(adapter, "updateState").mockImplementation(() => {
                        return Promise.resolve(state);
                    });

                    const handlerFn = vi.fn(
                        (_event: UntrackedFailureRateLimiterEvent) => {},
                    );
                    await rateLimiterProvider.addListener(
                        RATE_LIMITER_EVENTS.UNTRACKED_FAILURE,
                        handlerFn,
                    );

                    class ErrorA extends Error {}
                    class ErrorB extends Error {}
                    const limit = 5;
                    try {
                        await rateLimiterProvider
                            .create(KEY, {
                                limit,
                                onlyError: true,
                                errorPolicy: ErrorA,
                            })
                            .runOrFail(() => {
                                throw new ErrorB("Unexpected error");
                            });
                    } catch {
                        /* EMPTY */
                    }

                    expect(handlerFn).toHaveBeenCalledOnce();
                    expect(handlerFn).toHaveBeenCalledWith(
                        expect.objectContaining({
                            rateLimiter: expect.objectContaining({
                                getState: expect.any(
                                    Function,
                                ) as IRateLimiterStateMethods["getState"],
                                key: KEY,
                                limit,
                            } satisfies IRateLimiterStateMethods) as IRateLimiterStateMethods,
                            error: expect.any(ErrorB),
                        } satisfies UntrackedFailureRateLimiterEvent),
                    );
                });
                test("Should dispatch AllowedRateLimiterEvent when limit is not reached by error", async () => {
                    const limit = 5;
                    const state: IRateLimiterAdapterState = {
                        success: true,
                        attempt: limit,
                        resetTime: null,
                    };
                    vi.spyOn(adapter, "getState").mockImplementation(() => {
                        return Promise.resolve(state);
                    });
                    vi.spyOn(adapter, "updateState").mockImplementation(() => {
                        return Promise.resolve(state);
                    });

                    const handlerFn = vi.fn(
                        (_event: AllowedRateLimiterEvent) => {},
                    );
                    await rateLimiterProvider.addListener(
                        RATE_LIMITER_EVENTS.ALLOWED,
                        handlerFn,
                    );

                    class ErrorA extends Error {}
                    try {
                        await rateLimiterProvider
                            .create(KEY, {
                                limit,
                                onlyError: true,
                            })
                            .runOrFail(() => {
                                throw new ErrorA("Unexpected error");
                            });
                    } catch {
                        /* EMPTY */
                    }

                    expect(handlerFn).toHaveBeenCalledOnce();
                    expect(handlerFn).toHaveBeenCalledWith(
                        expect.objectContaining({
                            rateLimiter: expect.objectContaining({
                                getState: expect.any(
                                    Function,
                                ) as IRateLimiterStateMethods["getState"],
                                key: KEY,
                                limit,
                            } satisfies IRateLimiterStateMethods) as IRateLimiterStateMethods,
                        } satisfies AllowedRateLimiterEvent),
                    );
                });
                test("Should dispatch BlockedRateLimiterEvent when limit is reached by error", async () => {
                    const limit = 5;
                    const state: IRateLimiterAdapterState = {
                        success: false,
                        attempt: limit,
                        resetTime: TimeSpan.fromMinutes(1),
                    };
                    vi.spyOn(adapter, "getState").mockImplementation(() => {
                        return Promise.resolve(state);
                    });
                    vi.spyOn(adapter, "updateState").mockImplementation(() => {
                        return Promise.resolve(state);
                    });

                    const handlerFn = vi.fn(
                        (_event: BlockedRateLimiterEvent) => {},
                    );
                    await rateLimiterProvider.addListener(
                        RATE_LIMITER_EVENTS.BLOCKED,
                        handlerFn,
                    );

                    class ErrorA extends Error {}
                    try {
                        await rateLimiterProvider
                            .create(KEY, {
                                limit,
                                onlyError: true,
                            })
                            .runOrFail(() => {
                                throw new ErrorA("Unexpected error");
                            });
                    } catch {
                        /* EMPTY */
                    }

                    expect(handlerFn).toHaveBeenCalledOnce();
                    expect(handlerFn).toHaveBeenCalledWith(
                        expect.objectContaining({
                            rateLimiter: expect.objectContaining({
                                getState: expect.any(
                                    Function,
                                ) as IRateLimiterStateMethods["getState"],
                                key: KEY,
                                limit,
                            } satisfies IRateLimiterStateMethods) as IRateLimiterStateMethods,
                        } satisfies BlockedRateLimiterEvent),
                    );
                });
                test("Should dispatch AllowedRateLimiterEvent when limit is reached by function call", async () => {
                    const limit = 5;
                    const state: IRateLimiterAdapterState = {
                        success: true,
                        attempt: limit,
                        resetTime: TimeSpan.fromMinutes(1),
                    };
                    vi.spyOn(adapter, "getState").mockImplementation(() => {
                        return Promise.resolve(state);
                    });
                    vi.spyOn(adapter, "updateState").mockImplementation(() => {
                        return Promise.resolve(state);
                    });

                    const handlerFn = vi.fn(
                        (_event: AllowedRateLimiterEvent) => {},
                    );
                    await rateLimiterProvider.addListener(
                        RATE_LIMITER_EVENTS.ALLOWED,
                        handlerFn,
                    );

                    await rateLimiterProvider
                        .create(KEY, {
                            limit,
                            onlyError: true,
                        })
                        .runOrFail(() => {});

                    expect(handlerFn).toHaveBeenCalledOnce();
                    expect(handlerFn).toHaveBeenCalledWith(
                        expect.objectContaining({
                            rateLimiter: expect.objectContaining({
                                getState: expect.any(
                                    Function,
                                ) as IRateLimiterStateMethods["getState"],
                                key: KEY,
                                limit,
                            } satisfies IRateLimiterStateMethods) as IRateLimiterStateMethods,
                        } satisfies AllowedRateLimiterEvent),
                    );
                });
            });
            describe("onlyError = false", () => {
                test("Should dispatch AllowedRateLimiterEvent when limit is not reached by error", async () => {
                    const limit = 5;
                    const state: IRateLimiterAdapterState = {
                        success: true,
                        attempt: limit - 2,
                        resetTime: null,
                    };
                    vi.spyOn(adapter, "getState").mockImplementation(() => {
                        return Promise.resolve(state);
                    });
                    vi.spyOn(adapter, "updateState").mockImplementation(() => {
                        return Promise.resolve(state);
                    });

                    const handlerFn = vi.fn(
                        (_event: AllowedRateLimiterEvent) => {},
                    );
                    await rateLimiterProvider.addListener(
                        RATE_LIMITER_EVENTS.ALLOWED,
                        handlerFn,
                    );

                    class ErrorA extends Error {}
                    try {
                        await rateLimiterProvider
                            .create(KEY, {
                                limit,
                                onlyError: false,
                            })
                            .runOrFail(() => {
                                throw new ErrorA("Unexpected error");
                            });
                    } catch {
                        /* EMPTY */
                    }

                    expect(handlerFn).toHaveBeenCalledOnce();
                    expect(handlerFn).toHaveBeenCalledWith(
                        expect.objectContaining({
                            rateLimiter: expect.objectContaining({
                                getState: expect.any(
                                    Function,
                                ) as IRateLimiterStateMethods["getState"],
                                key: KEY,
                                limit,
                            } satisfies IRateLimiterStateMethods) as IRateLimiterStateMethods,
                        } satisfies AllowedRateLimiterEvent),
                    );
                });
                test("Should dispatch BlockedRateLimiterEvent when limit is reached by error", async () => {
                    const limit = 5;
                    const state: IRateLimiterAdapterState = {
                        success: false,
                        attempt: limit,
                        resetTime: TimeSpan.fromMinutes(1),
                    };
                    vi.spyOn(adapter, "getState").mockImplementation(() => {
                        return Promise.resolve(state);
                    });
                    vi.spyOn(adapter, "updateState").mockImplementation(() => {
                        return Promise.resolve(state);
                    });

                    const handlerFn = vi.fn(
                        (_event: BlockedRateLimiterEvent) => {},
                    );
                    await rateLimiterProvider.addListener(
                        RATE_LIMITER_EVENTS.BLOCKED,
                        handlerFn,
                    );

                    class ErrorA extends Error {}
                    try {
                        await rateLimiterProvider
                            .create(KEY, {
                                limit,
                                onlyError: false,
                            })
                            .runOrFail(() => {
                                throw new ErrorA("Unexpected error");
                            });
                    } catch {
                        /* EMPTY */
                    }

                    expect(handlerFn).toHaveBeenCalledOnce();
                    expect(handlerFn).toHaveBeenCalledWith(
                        expect.objectContaining({
                            rateLimiter: expect.objectContaining({
                                getState: expect.any(
                                    Function,
                                ) as IRateLimiterStateMethods["getState"],
                                key: KEY,
                                limit,
                            } satisfies IRateLimiterStateMethods) as IRateLimiterStateMethods,
                        } satisfies BlockedRateLimiterEvent),
                    );
                });
                test("Should dispatch AllowedRateLimiterEvent when limit is not reached by function call", async () => {
                    const limit = 5;
                    const state: IRateLimiterAdapterState = {
                        success: true,
                        attempt: limit - 2,
                        resetTime: null,
                    };
                    vi.spyOn(adapter, "getState").mockImplementation(() => {
                        return Promise.resolve(state);
                    });
                    vi.spyOn(adapter, "updateState").mockImplementation(() => {
                        return Promise.resolve(state);
                    });

                    const handlerFn = vi.fn(
                        (_event: AllowedRateLimiterEvent) => {},
                    );
                    await rateLimiterProvider.addListener(
                        RATE_LIMITER_EVENTS.ALLOWED,
                        handlerFn,
                    );

                    await rateLimiterProvider
                        .create(KEY, {
                            limit,
                            onlyError: false,
                        })
                        .runOrFail(() => {});

                    expect(handlerFn).toHaveBeenCalledOnce();
                    expect(handlerFn).toHaveBeenCalledWith(
                        expect.objectContaining({
                            rateLimiter: expect.objectContaining({
                                getState: expect.any(
                                    Function,
                                ) as IRateLimiterStateMethods["getState"],
                                key: KEY,
                                limit,
                            } satisfies IRateLimiterStateMethods) as IRateLimiterStateMethods,
                        } satisfies AllowedRateLimiterEvent),
                    );
                });
                test("Should dispatch BlockedRateLimiterEvent when limit is reached by function call", async () => {
                    const limit = 5;
                    const state: IRateLimiterAdapterState = {
                        success: false,
                        attempt: limit,
                        resetTime: TimeSpan.fromMinutes(1),
                    };
                    vi.spyOn(adapter, "getState").mockImplementation(() => {
                        return Promise.resolve(state);
                    });
                    vi.spyOn(adapter, "updateState").mockImplementation(() => {
                        return Promise.resolve(state);
                    });

                    const handlerFn = vi.fn(
                        (_event: BlockedRateLimiterEvent) => {},
                    );
                    await rateLimiterProvider.addListener(
                        RATE_LIMITER_EVENTS.BLOCKED,
                        handlerFn,
                    );

                    try {
                        await rateLimiterProvider
                            .create(KEY, {
                                limit,
                                onlyError: false,
                            })
                            .runOrFail(() => {});
                    } catch {
                        /* EMPTY */
                    }

                    expect(handlerFn).toHaveBeenCalledOnce();
                    expect(handlerFn).toHaveBeenCalledWith(
                        expect.objectContaining({
                            rateLimiter: expect.objectContaining({
                                getState: expect.any(
                                    Function,
                                ) as IRateLimiterStateMethods["getState"],
                                key: KEY,
                                limit,
                            } satisfies IRateLimiterStateMethods) as IRateLimiterStateMethods,
                        } satisfies BlockedRateLimiterEvent),
                    );
                });
            });
        });
        describe("method: reset", () => {
            test("Should call dispatch ResetedRateLimiterEvent when reset method is called", async () => {
                vi.spyOn(adapter, "reset").mockImplementation(() =>
                    Promise.resolve(),
                );
                const handlerFn = vi.fn(() => {});
                await rateLimiterProvider.addListener(
                    RATE_LIMITER_EVENTS.RESETED,
                    handlerFn,
                );

                await rateLimiterProvider.create(KEY, { limit: 10 }).reset();

                expect(handlerFn).toHaveBeenCalledOnce();
                expect(handlerFn).toHaveBeenCalledWith(
                    expect.objectContaining({
                        rateLimiter: expect.objectContaining({
                            getState: expect.any(
                                Function,
                            ) as IRateLimiterStateMethods["getState"],
                            key: KEY,
                            limit: 10,
                        } satisfies IRateLimiterStateMethods) as IRateLimiterStateMethods,
                    } satisfies ResetedRateLimiterEvent),
                );
            });
        });
    });
});
