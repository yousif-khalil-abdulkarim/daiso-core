/**
 * @module EventBus
 */

import type {
    BaseEvent,
    EventListenerFn,
    IEventBusAdapter,
} from "@/event-bus/contracts/_module-exports.js";
import { EventEmitter } from "node:events";

/**
 * To utilize the `MemoryEventBusAdapter`, you must create instance of it.
 *
 * IMPORT_PATH: `"@daiso-tech/core/event-bus/adapters"`
 * @group Adapters
 */
export class MemoryEventBusAdapter implements IEventBusAdapter {
    /**
     *  @example
     * ```ts
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
     *
     * const eventBusAdapter = new MemoryEventBusAdapter();
     * ```
     * You can also provide an {@link EventEmitter | `EventEmitter`} that will be used dispatching the events in memory.
     * @example
     * ```ts
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
     * import { EventEmitter } from "node:events";
     *
     * const eventEmitter = new EventEmitter<any>();
     * const eventBusAdapter = new MemoryEventBusAdapter(eventEmitter);
     * ```
     */
    constructor(
        private readonly eventEmitter: EventEmitter = new EventEmitter(),
    ) {
        this.eventEmitter = eventEmitter;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async addListener(
        eventName: string,
        listener: EventListenerFn<BaseEvent>,
    ): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.eventEmitter.on(eventName, listener);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async removeListener(
        eventName: string,
        listener: EventListenerFn<BaseEvent>,
    ): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.eventEmitter.off(eventName, listener);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async dispatch(eventName: string, eventData: BaseEvent): Promise<void> {
        this.eventEmitter.emit(eventName, eventData);
    }
}
