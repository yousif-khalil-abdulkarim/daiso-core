/**
 * @module EventBus
 */

import { simplifyGroupName, type OneOrMore } from "@/utilities/_module";
import type {
    BaseEvent,
    IEventBusAdapter,
    Listener,
} from "@/event-bus/contracts/_module";
import { EventEmitter } from "node:events";

/**
 * To utilize the <i>MemoryEventBusAdapter</i>, you must create instance of it.
 * @group Adapters
 */
export class MemoryEventBusAdapter implements IEventBusAdapter {
    private readonly group: string;

    /**
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
     * const eventBusAdapter = new MemoryCacheAdapter("@global", eventEmitter);
     * ```
     */
    constructor(
        defaultGroup: OneOrMore<string>,
        private readonly eventEmiter = new EventEmitter(),
    ) {
        this.group = simplifyGroupName(defaultGroup);
    }

    getGroup(): string {
        return this.group;
    }

    withGroup(group: OneOrMore<string>): IEventBusAdapter {
        return new MemoryEventBusAdapter(
            [this.group, simplifyGroupName(group)],
            this.eventEmiter,
        );
    }

    private withPrefix(event: string): string {
        return simplifyGroupName([this.group, event]);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async addListener(
        eventName: string,
        listener: Listener<BaseEvent>,
    ): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.eventEmiter.on(this.withPrefix(eventName), listener);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async removeListener(
        eventName: string,
        listener: Listener<BaseEvent>,
    ): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.eventEmiter.off(this.withPrefix(eventName), listener);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async dispatch(eventName: string, eventData: BaseEvent): Promise<void> {
        this.eventEmiter.emit(this.withPrefix(eventName), eventData);
    }
}
