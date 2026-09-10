
import { beforeEach, describe, expect, test } from "vitest";
import { sharedLockAdapterTestSuite } from "eridu-tech/shared-lock/test-utilities";
import { MemorySharedLockAdapter } from "eridu-tech/shared-lock/memory-shared-lock-adapter";

describe("class: MySharedLockAdapter", () => {
    sharedLockAdapterTestSuite({
        createAdapter: () => new MemorySharedLockAdapter(),
        test,
        beforeEach,
        expect,
        describe,
    });
});
