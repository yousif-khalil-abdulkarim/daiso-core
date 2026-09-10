import { beforeEach, describe, expect, test } from "vitest";
import { rateLimiterStorageAdapterTestSuite } from "eridu-tech/rate-limiter/test-utilities";
import { MemoryRateLimiterStorageAdapter } from "eridu-tech/rate-limiter/memory-rate-limiter-storage-adapter";

describe("class: MyRateLimiterStorageAdapter", () => {
    rateLimiterStorageAdapterTestSuite({
        createAdapter: () => new MemoryRateLimiterStorageAdapter(),
        test,
        beforeEach,
        expect,
        describe,
    });
});
