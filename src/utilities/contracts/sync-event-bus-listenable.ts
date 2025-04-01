/**
 * @module Utilities
 */

import type {
    BaseEvent,
    EventClass,
    EventInstance,
    EventListener,
} from "@/event-bus/contracts/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 * @group Contracts
 */
export type ISyncEventListenable<TEvents extends BaseEvent> = {
    addListener<TEventClass extends EventClass<TEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): void;

    removeListener<TEventClass extends EventClass<TEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): void;
};
