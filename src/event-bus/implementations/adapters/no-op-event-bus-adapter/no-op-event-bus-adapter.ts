/**
 * @module EventBus
 */

import type {
    IEventBusAdapter,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    IEventBus,
} from "@/event-bus/contracts/_module-exports.js";
import type { InvokableFn, MessageBase } from "@/utilities/types.js";

/**
 * This <i>NoOpEventBusAdapter</i> will do nothing and is used for easily mocking <i>{@link IEventBus}</i> for testing.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/adapters"```
 * @group Adapters
 */
export class NoOpEventBusAdapter implements IEventBusAdapter {
    addListener(
        _eventName: string,
        _listener: InvokableFn<MessageBase>,
    ): PromiseLike<void> {
        return Promise.resolve();
    }

    removeListener(
        _eventName: string,
        _listener: InvokableFn<MessageBase>,
    ): PromiseLike<void> {
        return Promise.resolve();
    }

    dispatch(_eventName: string, _eventData: MessageBase): PromiseLike<void> {
        return Promise.resolve();
    }
}
