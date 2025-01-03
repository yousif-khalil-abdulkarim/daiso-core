/**
 * @module EventBus
 */

import type { Listener, IBaseEvent } from "@/_module";
import type { IEventBusAdapter } from "@/event-bus/contracts/event-bus-adapter.contract";

/**
 * This <i>NoOpEventBusAdapter</i> will do nothing and is used for easily mocking IEventBus for testing.
 * @group Adapters
 */
export class NoOpEventBusAdapter implements IEventBusAdapter {
    addListener(
        _event: string,
        _listener: Listener<IBaseEvent>,
    ): Promise<void> {
        return Promise.resolve();
    }

    removeListener(
        _event: string,
        _listener: Listener<IBaseEvent>,
    ): Promise<void> {
        return Promise.resolve();
    }

    dispatch(_events: IBaseEvent[]): Promise<void> {
        return Promise.resolve();
    }
}
