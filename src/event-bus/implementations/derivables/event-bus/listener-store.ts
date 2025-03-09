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
        key: [eventName: string, listener: Invokable<TInput, TOutput>],
        value: InvokableFn<TInput, TOutput>,
    ): InvokableFn<TInput, TOutput> {
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

    getAndRemove<TInput, TOutput>(
        key: [eventName: string, listener: Invokable<TInput, TOutput>],
    ): InvokableFn<TInput, TOutput> | null {
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
