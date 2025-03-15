/**
 * @module Async
 */

import { callInvokable, type Invokable } from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Utilities
 */
export type ILazyPromiseListener<TEventMap extends Record<string, unknown>> = {
    addListener<TEventName extends keyof TEventMap>(
        eventName: Extract<TEventName, string>,
        listener: Invokable<[event: TEventMap[TEventName]]>,
    ): void;

    removeListener<TEventName extends keyof TEventMap>(
        eventName: Extract<TEventName, string>,
        listener: Invokable<[event: TEventMap[TEventName]]>,
    ): void;
};

/**
 * @internal
 */
export class LazyPromiseEventBus<TEventMap extends Record<string, unknown>>
    implements ILazyPromiseListener<TEventMap>
{
    private readonly eventMap = new Map<string, Set<Invokable<[event: any]>>>();

    dispatch<TEventName extends keyof TEventMap>(
        eventName: Extract<TEventName, string>,
        event: TEventMap[TEventName],
    ): void {
        const eventListeners = this.eventMap.get(eventName);
        if (eventListeners === undefined) {
            return;
        }
        for (const eventListener of eventListeners) {
            callInvokable(eventListener, event);
        }
    }

    addListener<TEventName extends keyof TEventMap>(
        eventName: Extract<TEventName, string>,
        listener: Invokable<[event: TEventMap[TEventName]]>,
    ): void {
        let eventListeners = this.eventMap.get(eventName);
        if (eventListeners === undefined) {
            eventListeners = new Set();
            this.eventMap.set(eventName, eventListeners);
        }
        eventListeners.add(listener);
    }

    removeListener<TEventName extends keyof TEventMap>(
        eventName: Extract<TEventName, string>,
        listener: Invokable<[event: TEventMap[TEventName]]>,
    ): void {
        const eventListeners = this.eventMap.get(eventName);
        if (eventListeners === undefined) {
            return;
        }
        eventListeners.delete(listener);
        if (eventListeners.size === 0) {
            this.eventMap.delete(eventName);
        }
    }

    clear(): void {
        for (const eventListeners of this.eventMap.values()) {
            eventListeners.clear();
        }
        this.eventMap.clear();
    }
}
