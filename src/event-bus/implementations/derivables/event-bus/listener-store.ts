/**
 * @module EventBus
 */

import type {
    EventListener,
    EventListenerFn,
} from "@/event-bus/contracts/_module-exports.js";
import { resolveInvokable } from "@/utilities/functions.js";

/**
 * @internal
 */
export class ListenerStore {
    constructor(
        private readonly store = new Map<
            string,
            Map<EventListener<any>, EventListenerFn<any>>
        >(),
    ) {}

    getOrAdd<TInput>(
        key: [eventName: string, listener: EventListener<TInput>],
        value: EventListenerFn<TInput>,
    ): EventListenerFn<TInput> {
        const [eventName, listener] = key;
        let eventMap = this.store.get(eventName);
        if (eventMap === undefined) {
            eventMap = new Map();
            this.store.set(eventName, eventMap);
        }

        let listenerFn_ = eventMap.get(listener);
        if (listenerFn_ === undefined) {
            listenerFn_ = resolveInvokable(value);
            eventMap.set(listener, listenerFn_);
        }

        return listenerFn_;
    }

    getAndRemove<TInput>(
        key: [eventName: string, listener: EventListener<TInput>],
    ): EventListenerFn<TInput> | null {
        const [eventName, listener] = key;
        const eventMap = this.store.get(eventName);
        if (eventMap === undefined) {
            return null;
        }

        const listenerFn = eventMap.get(listener);
        if (listenerFn === undefined) {
            return null;
        }

        eventMap.delete(listener);
        if (eventMap.size === 0) {
            this.store.delete(eventName);
        }

        return listenerFn;
    }
}
