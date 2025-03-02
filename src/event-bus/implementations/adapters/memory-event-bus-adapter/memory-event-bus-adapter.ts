/**
 * @module EventBus
 */

import { type InvokableFn } from "@/utilities/_module-exports.js";
import type {
    BaseEvent,
    IEventBusAdapter,
} from "@/event-bus/contracts/_module-exports.js";
import { EventEmitter } from "node:events";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/implementations/adapters"```
 * @group Adapters
 */
export type MemoryEventBusAdapterSettings = {
    rootGroup: string;
    eventEmitter?: EventEmitter;
};

/**
 * To utilize the <i>MemoryEventBusAdapter</i>, you must create instance of it.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/implementations/adapters"```
 * @group Adapters
 */
export class MemoryEventBusAdapter implements IEventBusAdapter {
    /**
     * @example
     * ```ts
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { EventEmitter } from "node:events";
     *
     * const eventBusAdapter = new MemoryEventBusAdapter();
     * ```
     *
     * You can also provide an <i>EVentEmitter</i>.
     * @example
     * ```ts
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { EventEmitter } from "node:events";
     *
     * const eventEmitter = new EventEmitter();
     * const eventBusAdapter = new MemoryEventBusAdapter(new EventEmitter());
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
        listener: InvokableFn<BaseEvent>,
    ): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.eventEmitter.on(eventName, listener);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async removeListener(
        eventName: string,
        listener: InvokableFn<BaseEvent>,
    ): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.eventEmitter.off(eventName, listener);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async dispatch(eventName: string, eventData: BaseEvent): Promise<void> {
        this.eventEmitter.emit(eventName, eventData);
    }
}
