/**
 * @module EventBus
 */

import {
    resolveOneOrMoreStr,
    type InvokableFn,
} from "@/utilities/_module-exports.js";
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
    private readonly group: string;
    private readonly eventEmitter: EventEmitter;

    /**
     * @example
     * ```ts
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { EventEmitter } from "node:events";
     *
     * const eventEmitter = new EventEmitter();
     * const eventBusAdapter = new MemoryEventBusAdapter({
     *   eventEmitter
     * });
     * ```
     * You can also provide an <i>EVentEmitter</i>.
     * @example
     * ```ts
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { EventEmitter } from "node:events";
     *
     * const eventEmitter = new EventEmitter();
     * const eventBusAdapter = new MemoryEventBusAdapter({
     *   rootGroup: "@global",
     *   eventEmitter
     * });
     * ```
     */
    constructor(settings: MemoryEventBusAdapterSettings) {
        const { rootGroup, eventEmitter = new EventEmitter() } = settings;
        this.eventEmitter = eventEmitter;
        this.group = rootGroup;
    }

    getGroup(): string {
        return this.group;
    }

    withGroup(group: string): IEventBusAdapter {
        return new MemoryEventBusAdapter({
            rootGroup: resolveOneOrMoreStr([this.group, group]),
            eventEmitter: this.eventEmitter,
        });
    }

    private withPrefix(event: string): string {
        return resolveOneOrMoreStr([this.group, event]);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async addListener(
        eventName: string,
        listener: InvokableFn<BaseEvent>,
    ): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.eventEmitter.on(this.withPrefix(eventName), listener);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async removeListener(
        eventName: string,
        listener: InvokableFn<BaseEvent>,
    ): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.eventEmitter.off(this.withPrefix(eventName), listener);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async dispatch(eventName: string, eventData: BaseEvent): Promise<void> {
        this.eventEmitter.emit(this.withPrefix(eventName), eventData);
    }
}
