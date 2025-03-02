/**
 * @module EventBus
 */

import {
    resolveInvokable,
    type Invokable,
    type InvokableFn,
} from "@/utilities/_module-exports.js";

/**
 * @internal
 */
export class ListenerStore {
    constructor(
        private readonly store = new Map<
            string,
            Map<Invokable<any, any>, InvokableFn<any, any>>
        >(),
    ) {}

    getOrAdd<TInput, TOutput>(
        eventName: string,
        listener: Invokable<TInput, TOutput>,
    ): InvokableFn<TInput, TOutput> {
        let eventMap = this.store.get(eventName);
        if (eventMap === undefined) {
            eventMap = new Map();
            this.store.set(eventName, eventMap);
        }

        let listenerFn = eventMap.get(listener);
        if (listenerFn === undefined) {
            listenerFn = resolveInvokable(listener);
            eventMap.set(listener, listenerFn);
        }

        return listenerFn;
    }

    getAndRemove<TInput, TOutput>(
        eventName: string,
        listener: Invokable<TInput, TOutput>,
    ): InvokableFn<TInput, TOutput> | null {
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
