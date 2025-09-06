import { beforeEach, describe, expect, test } from "vitest";
import {
    KyselyLockAdapter,
    MemoryLockAdapter,
    type KyselyLockTables,
} from "@/lock/implementations/adapters/_module-exports.js";
import { LockProvider } from "@/lock/implementations/derivables/_module-exports.js";
import { EventBus } from "@/event-bus/implementations/derivables/_module-exports.js";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/adapters/_module-exports.js";
import { lockProviderTestSuite } from "@/lock/implementations/test-utilities/_module-exports.js";
import { Serde } from "@/serde/implementations/derivables/_module-exports.js";
import { SuperJsonSerdeAdapter } from "@/serde/implementations/adapters/_module-exports.js";
import { Namespace } from "@/utilities/_module-exports.js";

describe("class: LockProvider", () => {
    lockProviderTestSuite({
        createLockProvider: () => {
            const serde = new Serde(new SuperJsonSerdeAdapter());
            const lockProvider = new LockProvider({
                serde,
                eventBus: new EventBus({
                    namespace: new Namespace("event-bus"),
                    adapter: new MemoryEventBusAdapter(),
                }),
                adapter: new MemoryLockAdapter(),
                namespace: new Namespace("lock"),
            });
            return {
                lockProvider,
                serde,
            };
        },
        beforeEach,
        describe,
        expect,
        test,
    });
    describe.skip("Serde tests:", () => {
        test.todo("Should differentiate between namespaces");
        test.todo("Should differentiate between adapters");
        test.todo("Should differentiate between serdeTransformerNames");
    });
});
