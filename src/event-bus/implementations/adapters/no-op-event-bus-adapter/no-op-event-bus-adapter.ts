/**
 * @module EventBus
 */

import type { Listener, IBaseEvent } from "@/event-bus/contracts/_module";
import type {
    IEventBusAdapter,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    IEventBus,
} from "@/event-bus/contracts/_module";

/**
 * This <i>NoOpEventBusAdapter</i> will do nothing and is used for easily mocking {@link IEventBus} for testing.
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
