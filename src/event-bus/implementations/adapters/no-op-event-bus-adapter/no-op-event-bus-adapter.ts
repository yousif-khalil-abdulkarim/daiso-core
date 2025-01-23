/**
 * @module EventBus
 */

import type { OneOrMore } from "@/utilities/_module";
import type { BaseEvent, Listener } from "@/event-bus/contracts/_module";
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
    getGroup(): string {
        return "";
    }

    withGroup(_group: OneOrMore<string>): IEventBusAdapter {
        return new NoOpEventBusAdapter();
    }

    addListener(
        _eventName: string,
        _listener: Listener<BaseEvent>,
    ): PromiseLike<void> {
        return Promise.resolve();
    }

    removeListener(
        _eventName: string,
        _listener: Listener<BaseEvent>,
    ): PromiseLike<void> {
        return Promise.resolve();
    }

    dispatch(_eventName: string, _eventData: BaseEvent): PromiseLike<void> {
        return Promise.resolve();
    }
}
