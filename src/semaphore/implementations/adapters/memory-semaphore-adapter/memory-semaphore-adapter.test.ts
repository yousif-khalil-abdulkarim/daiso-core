import { beforeEach, describe, expect, test } from "vitest";

import { MemorySemaphoreAdapter } from "@/semaphore/implementations/adapters/memory-semaphore-adapter/_module.js";
import { semaphoreAdapterTestSuite } from "@/semaphore/implementations/test-utilities/_module.js";

describe("class: MemorySemaphoreAdapter", () => {
    semaphoreAdapterTestSuite({
        createAdapter: () => new MemorySemaphoreAdapter(new Map()),
        test,
        beforeEach,
        expect,
        describe,
    });
});
