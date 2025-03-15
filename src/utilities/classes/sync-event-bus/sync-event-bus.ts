/**
 * @module Utilities
 */

import type {
    EventClass,
    EventInstance,
    EventListener,
} from "@/event-bus/contracts/_module-exports.js";
import type { BaseEvent } from "@/event-bus/contracts/_shared.js";
import {
    callInvokable,
    getConstructorName,
} from "@/utilities/_module-exports.js";
import type { ISyncEventListenable } from "@/utilities/contracts/sync-event-bus-listenable.js";

/**
 * @internal
 */
export class SyncEventBus<TEvents extends BaseEvent>
    implements ISyncEventListenable<TEvents>
{
    private readonly eventMap = new Map<string, Set<EventListener<any>>>();

    addListener<TEventClass extends EventClass<TEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): void {
        const eventName = getConstructorName(event);
        let listeners = this.eventMap.get(eventName);
        if (listeners === undefined) {
            listeners = new Set();
            this.eventMap.set(eventName, listeners);
        }
        listeners.add(listener);
    }

    removeListener<TEventClass extends EventClass<TEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): void {
        const eventName = getConstructorName(event);
        const listeners = this.eventMap.get(eventName);
        if (listeners === undefined) {
            return;
        }
        listeners.delete(listener);
        if (listeners.size === 0) {
            this.eventMap.delete(eventName);
        }
    }

    dispatch(event: TEvents): void {
        const eventName = getConstructorName(event);
        if (this.eventMap.size === 0) {
            return;
        }
        const listeners = this.eventMap.get(eventName);
        if (listeners === undefined) {
            return;
        }
        if (listeners.size === 0) {
            return;
        }
        for (const listener of listeners) {
            callInvokable(listener, event);
        }
    }

    clear(): void {
        for (const listeners of this.eventMap.values()) {
            listeners.clear();
        }
        this.eventMap.clear();
    }
}
