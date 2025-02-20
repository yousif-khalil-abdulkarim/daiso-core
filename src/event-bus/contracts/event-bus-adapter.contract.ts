/**
 * @module EventBus
 */

import type { BaseEvent } from "@/event-bus/contracts/_shared.js";
import type { InvokableFn } from "@/utilities/_module-exports.js";

/**
 * The <i>IEventBusAdapter</i> contract defines a way for dispatching and listening to events independent of underlying technology.
 * This contract is not meant to be used directly, instead you should use <i>IEventBus</i>
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/contracts"```
 * @group Contracts
 */
export type IEventBusAdapter = {
    /**
     * The <i>addListener</i> method is used for adding <i>{@link InvokableFn | listener}</i> for certain <i>eventName</i>.
     */
    addListener(
        eventName: string,
        listener: InvokableFn<BaseEvent>,
    ): PromiseLike<void>;

    /**
     * The <i>removeListener</i> method is used for removing <i>{@link InvokableFn | listener}</i> for certain <i>eventName</i>.
     */
    removeListener(
        eventName: string,
        listener: InvokableFn<BaseEvent>,
    ): PromiseLike<void>;

    /**
     * The <i>dispatch</i> method is used for dispatching one or multiple <i>events</i>.
     */
    dispatch(eventName: string, eventData: BaseEvent): PromiseLike<void>;

    /**
     * The <i>getGroup</i> method returns the group name.
     */
    getGroup(): string;

    /**
     * The <i>withGroup</i> method returns a new <i>{@link IEventBusAdapter}</i> instance that groups events together.
     * Only events in the same group will be listened.
     */
    withGroup(group: string): IEventBusAdapter;
};
