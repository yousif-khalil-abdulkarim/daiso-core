/**
 * @module EventBus
 */

import type { MessageBase } from "@/utilities/_module-exports.js";
import { type InvokableFn } from "@/utilities/_module-exports.js";
import type { IEventBusAdapter } from "@/event-bus/contracts/_module-exports.js";
import { EventEmitter } from "node:events";

/**
 * To utilize the <i>MemoryEventBusAdapter</i>, you must create instance of it.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/adapters"```
 * @group Adapters
 */
export class MemoryEventBusAdapter implements IEventBusAdapter {
    /**
     *  @example
     * ```ts
     * import { MemoryEventBus } from "@daiso-tech/core/event-bus/adapters";
     *
     * const eventBusAdapter = new MemoryEventBus();
     * ```
     * You can also provide an <i>{@link EventEmitter}</i> that will be used for storing the data.
     * @example
     * ```ts
     * import { MemoryEventBus } from "@daiso-tech/core/event-bus/adapters";
     * import { EventEmitter } from "node:events";
     *
     * const eventEmitter = new EventEmitter<any, any>();
     * const eventBusAdapter = new MemoryEventBus(eventEmitter);
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
        listener: InvokableFn<MessageBase>,
    ): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.eventEmitter.on(eventName, listener);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async removeListener(
        eventName: string,
        listener: InvokableFn<MessageBase>,
    ): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.eventEmitter.off(eventName, listener);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async dispatch(eventName: string, eventData: MessageBase): Promise<void> {
        this.eventEmitter.emit(eventName, eventData);
    }
}
