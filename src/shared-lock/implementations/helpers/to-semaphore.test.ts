import { beforeEach, describe, expect, test } from "vitest";
import { MemorySharedLockAdapter } from "@/shared-lock/implementations/adapters/_module-exports.js";
import { SharedLockProvider } from "@/shared-lock/implementations/derivables/_module-exports.js";
import { EventBus } from "@/event-bus/implementations/derivables/_module-exports.js";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/adapters/_module-exports.js";
import { semaphoreProviderTestSuite } from "@/semaphore/implementations/test-utilities/_module-exports.js";
import { Serde } from "@/serde/implementations/derivables/_module-exports.js";
import { SuperJsonSerdeAdapter } from "@/serde/implementations/adapters/_module-exports.js";
import { Namespace, type OneOrMore } from "@/utilities/_module-exports.js";
import type {
    ISemaphoreProvider,
    SemaphoreProviderCreateSettings,
} from "@/semaphore/contracts/semaphore-provider.contract.js";
import { ToSemaphore } from "@/shared-lock/implementations/helpers/to-semaphore.js";
import type { ISemaphore } from "@/semaphore/contracts/semaphore.contract.js";
import type { LazyPromise } from "@/async/_module-exports.js";
import type {
    EventListener,
    Unsubscribe,
} from "@/event-bus/contracts/event-bus.contract.js";
import type { SemaphoreEventMap } from "@/semaphore/contracts/semaphore.events.js";

describe("sharedLock class: ToLock", () => {
    const serde = new Serde(new SuperJsonSerdeAdapter());
    semaphoreProviderTestSuite({
        createSemaphoreProvider: () => {
            const sharedLockProvider = new SharedLockProvider({
                serde,
                eventBus: new EventBus({
                    namespace: new Namespace("event-bus"),
                    adapter: new MemoryEventBusAdapter(),
                }),
                adapter: new MemorySharedLockAdapter(),
                namespace: new Namespace("lock"),
            });
            class SemaphoreProvider implements ISemaphoreProvider {
                addListener<TEventName extends keyof SemaphoreEventMap>(
                    _eventName: TEventName,
                    _listener: EventListener<SemaphoreEventMap[TEventName]>,
                ): LazyPromise<void> {
                    throw new Error("Method not implemented.");
                }

                removeListener<TEventName extends keyof SemaphoreEventMap>(
                    _eventName: TEventName,
                    _listener: EventListener<SemaphoreEventMap[TEventName]>,
                ): LazyPromise<void> {
                    throw new Error("Method not implemented.");
                }

                listenOnce<TEventName extends keyof SemaphoreEventMap>(
                    _eventName: TEventName,
                    _listener: EventListener<SemaphoreEventMap[TEventName]>,
                ): LazyPromise<void> {
                    throw new Error("Method not implemented.");
                }

                asPromise<TEventName extends keyof SemaphoreEventMap>(
                    _eventName: TEventName,
                ): LazyPromise<SemaphoreEventMap[TEventName]> {
                    throw new Error("Method not implemented.");
                }

                subscribeOnce<TEventName extends keyof SemaphoreEventMap>(
                    _eventName: TEventName,
                    _listener: EventListener<SemaphoreEventMap[TEventName]>,
                ): LazyPromise<Unsubscribe> {
                    throw new Error("Method not implemented.");
                }

                subscribe<TEventName extends keyof SemaphoreEventMap>(
                    _eventName: TEventName,
                    _listener: EventListener<SemaphoreEventMap[TEventName]>,
                ): LazyPromise<Unsubscribe> {
                    throw new Error("Method not implemented.");
                }

                create(
                    key: OneOrMore<string>,
                    settings: SemaphoreProviderCreateSettings,
                ): ISemaphore {
                    return new ToSemaphore(
                        sharedLockProvider.create(key, {
                            ...settings,
                            lockId: settings.slotId,
                        }),
                    );
                }
            }
            return new SemaphoreProvider();
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
