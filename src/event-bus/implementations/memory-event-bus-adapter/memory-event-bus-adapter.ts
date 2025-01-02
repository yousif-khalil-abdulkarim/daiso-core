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
 * @group Adapters
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
