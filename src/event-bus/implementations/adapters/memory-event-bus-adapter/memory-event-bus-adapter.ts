/**
 * @module EventBus
 */

import type {
    IBaseEvent,
    IEventBusAdapter,
    Listener,
} from "@/event-bus/contracts/_module";
import { EventEmitter } from "node:events";

/**
 * To utilize the <i>MemoryEventBusAdapter</i>, you must create instance of it.
 * @group Adapters
 * @example
 * ```ts
 * import { MemoryEventBusAdapter } from "@daiso-tech/core";
 *
 * const eventBusAdapter = new MemoryEventBusAdapter(client);
 * ```
 * You can also provide an <i>EVentEmitter</i>.
 * @example
 * ```ts
 * import { MemoryCacheAdapter } from "@daiso-tech/core";
 * import { EventEmitter } from "node:events";
 *
 * const eventEmitter = new EventEmitter();
 * const eventBusAdapter = new MemoryCacheAdapter(eventEmitter);
 * ```
 */
export class MemoryEventBusAdapter implements IEventBusAdapter {
    constructor(private readonly eventEmiter = new EventEmitter()) {}

    // eslint-disable-next-line @typescript-eslint/require-await
    async addListener(
        event: string,
        listener: Listener<IBaseEvent>,
    ): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.eventEmiter.addListener(event, listener);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async removeListener(
        event: string,
        listener: Listener<IBaseEvent>,
    ): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.eventEmiter.removeListener(event, listener);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async dispatch(events: IBaseEvent[]): Promise<void> {
        for (const event of events) {
            this.eventEmiter.emit(event.type, event);
        }
    }
}
