/**
 * @module EventBus
 */

import type { BaseEvent } from "@/event-bus/contracts/_module-exports.js";
import type {
    IEventBusAdapter,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    IEventBus,
} from "@/event-bus/contracts/_module-exports.js";
import type { InvokableFn } from "@/utilities/types.js";

/**
 * This <i>NoOpEventBusAdapter</i> will do nothing and is used for easily mocking <i>{@link IEventBus}</i> for testing.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/adapters"```
 * @group Adapters
 */
export class NoOpEventBusAdapter implements IEventBusAdapter {
    addListener(
        _eventName: string,
        _listener: InvokableFn<BaseEvent>,
    ): PromiseLike<void> {
        return Promise.resolve();
    }

    removeListener(
        _eventName: string,
        _listener: InvokableFn<BaseEvent>,
    ): PromiseLike<void> {
        return Promise.resolve();
    }

    dispatch(_eventName: string, _eventData: BaseEvent): PromiseLike<void> {
        return Promise.resolve();
    }
}
