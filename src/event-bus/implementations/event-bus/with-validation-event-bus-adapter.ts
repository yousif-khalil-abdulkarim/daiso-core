/**
 * @module EventBus
 */

import type { Validator } from "@/utilities/_module";
import type {
    IBaseEvent,
    IEventBusAdapter,
    Listener,
} from "@/event-bus/contracts/_module";

/**
 * @internal
 */
export class WithValidationEventBusAdapter implements IEventBusAdapter {
    private readonly listenerMap = new Map<
        Listener<IBaseEvent>,
        Listener<IBaseEvent>
    >();

    constructor(
        private readonly eventBusAdapter: IEventBusAdapter,
        private readonly validator: Validator<IBaseEvent>,
    ) {}

    async addListener(
        event: string,
        listener: Listener<IBaseEvent>,
    ): Promise<void> {
        let wrappedListener = this.listenerMap.get(listener);
        if (wrappedListener === undefined) {
            wrappedListener = async (event: IBaseEvent) => {
                await listener(this.validator(event));
            };
            this.listenerMap.set(listener, wrappedListener);
        }

        await this.eventBusAdapter.addListener(event, wrappedListener);
    }

    async removeListener(
        event: string,
        listener: Listener<IBaseEvent>,
    ): Promise<void> {
        const wrappedListener = this.listenerMap.get(listener);
        if (wrappedListener === undefined) {
            return;
        }

        await this.eventBusAdapter.removeListener(event, wrappedListener);
        this.listenerMap.delete(listener);
    }

    async dispatch(events: IBaseEvent[]): Promise<void> {
        await this.eventBusAdapter.dispatch(events.map(this.validator));
    }
}
