import { beforeEach, describe, expect, test } from "vitest";
import { sharedLockFactoryTestSuite } from "eridu-tech/shared-lock/test-utilities";
import { SharedLockFactory } from "eridu-tech/shared-lock";
import { MemorySharedLockAdapter } from "eridu-tech/shared-lock/memory-shared-lock-adapter";
import { Serde } from "eridu-tech/serde";
import { SuperJsonSerdeAdapter } from "eridu-tech/serde/super-json-serde-adapter";

describe("class: SharedLockFactory", () => {
    sharedLockFactoryTestSuite({
        createSharedLockFactory: () => ({
            sharedLockFactory: new SharedLockFactory({
                adapter: new MemorySharedLockAdapter(),
            }),
            serde: new Serde(new SuperJsonSerdeAdapter()),
        }),
        test,
        beforeEach,
        expect,
        describe,
    });
});
