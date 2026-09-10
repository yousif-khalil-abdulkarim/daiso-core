import { beforeEach, describe, expect, test } from "vitest";
import { lockAdapterTestSuite } from "eridu-tech/lock/test-utilities";
import { MemoryLockAdapter } from "eridu-tech/lock/memory-lock-adapter";

describe("class: MyLockAdapter", () => {
    lockAdapterTestSuite({
        createAdapter: () => new MemoryLockAdapter(),
        test,
        beforeEach,
        expect,
        describe,
    });
});
