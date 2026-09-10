import { beforeEach, describe, expect, test } from "vitest";
import { lockFactoryTestSuite } from "eridu-tech/lock/test-utilities";
import { LockFactory } from "eridu-tech/lock";
import { MemoryLockAdapter } from "eridu-tech/lock/memory-lock-adapter";
import { Serde } from "eridu-tech/serde";
import { SuperJsonSerdeAdapter } from "eridu-tech/serde/super-json-serde-adapter";

describe("class: MyLockFactory", () => {
    lockFactoryTestSuite({
        createLockFactory: () => ({
            lockFactory: new LockFactory({
                adapter: new MemoryLockAdapter(),
            }),
            serde: new Serde(new SuperJsonSerdeAdapter()),
        }),
        test,
        beforeEach,
        expect,
        describe,
    });
});
