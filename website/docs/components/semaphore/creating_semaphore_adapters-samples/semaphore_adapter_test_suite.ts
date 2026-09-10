import { beforeEach, describe, expect, test } from "vitest";
import { semaphoreAdapterTestSuite } from "eridu-tech/semaphore/test-utilities";
import { MemorySemaphoreAdapter } from "eridu-tech/semaphore/memory-semaphore-adapter";

describe("class: MySemaphoreAdapter", () => {
    semaphoreAdapterTestSuite({
        createAdapter: () => new MemorySemaphoreAdapter(),
        test,
        beforeEach,
        expect,
        describe,
    });
});
