import { beforeEach, describe, expect, test } from "vitest";
import { semaphoreAdapterTestSuite } from "@/semaphore/implementations/test-utilities/_module-exports.js";
import { MemorySemaphoreAdapter } from "@/semaphore/implementations/adapters/memory-semaphore-adapter/_module.js";

describe("class: MemorySemaphoreAdapter", () => {
    semaphoreAdapterTestSuite({
        createAdapter: () => new MemorySemaphoreAdapter(new Map()),
        test,
        beforeEach,
        expect,
        describe,
    });
});
