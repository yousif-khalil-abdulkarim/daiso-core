/**
 * @module EventBus
 */

import type {
    BaseEvent,
    EventListenerFn,
} from "@/new-event-bus/contracts/_module-exports.js";
import type {
    IEventBusAdapter,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    IEventBus,
} from "@/new-event-bus/contracts/_module-exports.js";

/**
 * This `NoOpEventBusAdapter` will do nothing and is used for easily mocking {@link IEventBus | `IEventBus`} for testing.
 *
 * IMPORT_PATH: `"@daiso-tech/core/event-bus/adapters"`
 * @group Adapters
 */
export class NoOpEventBusAdapter implements IEventBusAdapter {
    addListener(
        _eventName: string,
        _listener: EventListenerFn<BaseEvent>,
    ): PromiseLike<void> {
        return Promise.resolve();
    }

    removeListener(
        _eventName: string,
        _listener: EventListenerFn<BaseEvent>,
    ): PromiseLike<void> {
        return Promise.resolve();
    }

    dispatch(_eventName: string, _eventData: BaseEvent): PromiseLike<void> {
        return Promise.resolve();
    }
}
