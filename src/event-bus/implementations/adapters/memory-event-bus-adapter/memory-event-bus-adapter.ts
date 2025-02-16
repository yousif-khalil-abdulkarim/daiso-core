/**
 * @module EventBus
 */

import { simplifyOneOrMoreStr } from "@/utilities/_module-exports.js";
import type {
    BaseEvent,
    IEventBusAdapter,
    Listener,
} from "@/event-bus/contracts/_module-exports.js";
import { EventEmitter } from "node:events";

/**
 * @group Adapters
 */
export type MemoryEventBusAdapterSettings = {
    rootGroup: string;
    eventEmitter?: EventEmitter;
};

/**
 * To utilize the <i>MemoryEventBusAdapter</i>, you must create instance of it.
 * @group Adapters
 */
export class MemoryEventBusAdapter implements IEventBusAdapter {
    private readonly group: string;
    private readonly eventEmitter: EventEmitter;

    /**
     * @example
     * ```ts
     * import { MemoryEventBusAdapter } from "@daiso-tech/core";
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
     * import { MemoryCacheAdapter } from "@daiso-tech/core";
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
            rootGroup: simplifyOneOrMoreStr([this.group, group]),
            eventEmitter: this.eventEmitter,
        });
    }

    private withPrefix(event: string): string {
        return simplifyOneOrMoreStr([this.group, event]);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async addListener(
        eventName: string,
        listener: Listener<BaseEvent>,
    ): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.eventEmitter.on(this.withPrefix(eventName), listener);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async removeListener(
        eventName: string,
        listener: Listener<BaseEvent>,
    ): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.eventEmitter.off(this.withPrefix(eventName), listener);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async dispatch(eventName: string, eventData: BaseEvent): Promise<void> {
        this.eventEmitter.emit(this.withPrefix(eventName), eventData);
    }
}
