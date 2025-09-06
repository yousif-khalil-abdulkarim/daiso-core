import { beforeEach, describe, expect, test } from "vitest";
import { MemorySharedLockAdapter } from "@/shared-lock/implementations/adapters/_module-exports.js";
import { SharedLockProvider } from "@/shared-lock/implementations/derivables/_module-exports.js";
import { EventBus } from "@/event-bus/implementations/derivables/_module-exports.js";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/adapters/_module-exports.js";
import { lockProviderTestSuite } from "@/lock/implementations/test-utilities/_module-exports.js";
import { Serde } from "@/serde/implementations/derivables/_module-exports.js";
import { SuperJsonSerdeAdapter } from "@/serde/implementations/adapters/_module-exports.js";
import { Namespace, type OneOrMore } from "@/utilities/_module-exports.js";
import type {
    ILockProvider,
    LockProviderCreateSettings,
} from "@/lock/contracts/lock-provider.contract.js";
import { ToLock } from "@/shared-lock/implementations/helpers/to-lock.js";
import type { ILock } from "@/lock/contracts/lock.contract.js";
import type { LazyPromise } from "@/async/_module-exports.js";
import type {
    EventListener,
    Unsubscribe,
} from "@/event-bus/contracts/event-bus.contract.js";
import type { LockEventMap } from "@/lock/contracts/lock.events.js";

describe("sharedLock class: ToLock", () => {
    const serde = new Serde(new SuperJsonSerdeAdapter());
    lockProviderTestSuite({
        createLockProvider: () => {
            const sharedLockProvider = new SharedLockProvider({
                serde,
                eventBus: new EventBus({
                    namespace: new Namespace("event-bus"),
                    adapter: new MemoryEventBusAdapter(),
                }),
                adapter: new MemorySharedLockAdapter(),
                namespace: new Namespace("lock"),
            });
            class LockProvider implements ILockProvider {
                addListener<TEventName extends keyof LockEventMap>(
                    _eventName: TEventName,
                    _listener: EventListener<LockEventMap[TEventName]>,
                ): LazyPromise<void> {
                    throw new Error("Method not implemented.");
                }

                removeListener<TEventName extends keyof LockEventMap>(
                    _eventName: TEventName,
                    _listener: EventListener<LockEventMap[TEventName]>,
                ): LazyPromise<void> {
                    throw new Error("Method not implemented.");
                }

                listenOnce<TEventName extends keyof LockEventMap>(
                    _eventName: TEventName,
                    _listener: EventListener<LockEventMap[TEventName]>,
                ): LazyPromise<void> {
                    throw new Error("Method not implemented.");
                }

                asPromise<TEventName extends keyof LockEventMap>(
                    _eventName: TEventName,
                ): LazyPromise<LockEventMap[TEventName]> {
                    throw new Error("Method not implemented.");
                }

                subscribeOnce<TEventName extends keyof LockEventMap>(
                    _eventName: TEventName,
                    _listener: EventListener<LockEventMap[TEventName]>,
                ): LazyPromise<Unsubscribe> {
                    throw new Error("Method not implemented.");
                }

                subscribe<TEventName extends keyof LockEventMap>(
                    _eventName: TEventName,
                    _listener: EventListener<LockEventMap[TEventName]>,
                ): LazyPromise<Unsubscribe> {
                    throw new Error("Method not implemented.");
                }

                create(
                    key: OneOrMore<string>,
                    settings?: LockProviderCreateSettings,
                ): ILock {
                    return new ToLock(
                        sharedLockProvider.create(key, {
                            limit: 1,
                            ...settings,
                        }),
                    );
                }
            }
            return new LockProvider();
        },
        beforeEach,
        describe,
        expect,
        test,
        serde,
        includeEventTests: false,
        includeSerdeTests: false,
    });
});
