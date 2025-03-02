/**
 * @module EventBus
 */

import type { BackoffPolicy, RetryPolicy } from "@/async/_module-exports.js";
import {
    type IEventBusAdapter,
    type IGroupableEventBus,
    type IEventBusFactory,
    type BaseEvent,
} from "@/event-bus/contracts/_module-exports.js";
import {
    EventBus,
    type EventBusSettingsBase,
} from "@/event-bus/implementations/derivables/event-bus/event-bus.js";
import type { KeyPrefixer, TimeSpan } from "@/utilities/_module-exports.js";
import {
    DefaultAdapterNotDefinedError,
    UnregisteredAdapterError,
} from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/implementations/derivables"```
 * @group Derivables
 */
export type EventBusAdapters<TAdapters extends string = string> = Partial<
    Record<TAdapters, IEventBusAdapter>
>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/implementations/derivables"```
 * @group Derivables
 */
export type EventBusFactorySettings<TAdapters extends string = string> =
    EventBusSettingsBase & {
        adapters: EventBusAdapters<TAdapters>;

        defaultAdapter?: NoInfer<TAdapters>;
    };

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/implementations/derivables"```
 * @group Derivables
 */
export class EventBusFactory<TAdapters extends string = string>
    implements IEventBusFactory<TAdapters>
{
    constructor(
        private readonly settings: EventBusFactorySettings<TAdapters>,
    ) {}

    setKeyPrefixer(keyPrefixer: KeyPrefixer): EventBusFactory<TAdapters> {
        return new EventBusFactory({
            ...this.settings,
            keyPrefixer,
        });
    }

    setRetryAttempts(attempts: number): EventBusFactory<TAdapters> {
        return new EventBusFactory({
            ...this.settings,
            retryAttempts: attempts,
        });
    }

    setBackoffPolicy(policy: BackoffPolicy): EventBusFactory<TAdapters> {
        return new EventBusFactory({
            ...this.settings,
            backoffPolicy: policy,
        });
    }

    setRetryPolicy(policy: RetryPolicy): EventBusFactory<TAdapters> {
        return new EventBusFactory({
            ...this.settings,
            retryPolicy: policy,
        });
    }

    setTimeout(timeout: TimeSpan): EventBusFactory<TAdapters> {
        return new EventBusFactory({
            ...this.settings,
            timeout,
        });
    }

    use<TEvents extends BaseEvent = BaseEvent>(
        adapterName: TAdapters | undefined = this.settings.defaultAdapter,
    ): IGroupableEventBus<TEvents> {
        if (adapterName === undefined) {
            throw new DefaultAdapterNotDefinedError(EventBusFactory.name);
        }
        const adapter = this.settings.adapters[adapterName];
        if (adapter === undefined) {
            throw new UnregisteredAdapterError(adapterName);
        }
        return new EventBus({
            adapter,
            ...this.settings,
        });
    }
}
