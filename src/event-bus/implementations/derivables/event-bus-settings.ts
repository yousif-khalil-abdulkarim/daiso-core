/**
 * @module EventBus
 */

import type { BackoffPolicy, RetryPolicy } from "@/async/_module";
import {
    type IGroupableEventBus,
    type IEventBusAdapter,
} from "@/event-bus/contracts/_module";
import type { IFlexibleSerde } from "@/serde/contracts/_module";

import type { IBuildable, OneOrMore, TimeSpan } from "@/utilities/_module";

/**
 * @group Derivables
 */
export type EventBusSettings = {
    serde: OneOrMore<IFlexibleSerde>;

    adapter: IEventBusAdapter;

    /**
     * The default retry attempt to use in the returned <i>LazyPromise</i>.
     */
    retryAttempts?: number | null;

    /**
     * The default backof policy to use in the returned <i>LazyPromise</i>.
     */
    backoffPolicy?: BackoffPolicy | null;

    /**
     * The default retry policy to use in the returned <i>LazyPromise</i>.
     */
    retryPolicy?: RetryPolicy | null;

    /**
     * The default timeout to use in the returned <i>LazyPromise</i>.
     */
    timeout?: TimeSpan | null;
};

/**
 * The <i>EventBusSettingsBuilder</i> is an immutable builder class, meaning that each method invocation creates a new instance.
 * @group Derivables
 */
export class EventBusSettingsBuilder<
    TSettings extends Partial<EventBusSettings>,
> implements IBuildable<EventBusSettings>
{
    constructor(private readonly settings: TSettings = {} as TSettings) {}

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setSerde(serde: OneOrMore<IFlexibleSerde>) {
        return new EventBusSettingsBuilder({
            ...this.settings,
            serde,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setAdapter(adapter: IEventBusAdapter) {
        return new EventBusSettingsBuilder({
            ...this.settings,
            adapter,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setEventBus(eventBus: IGroupableEventBus<any>) {
        return new EventBusSettingsBuilder({
            ...this.settings,
            eventBus,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setDefultTtl(time: TimeSpan) {
        return new EventBusSettingsBuilder({
            ...this.settings,
            defaultTtl: time,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setRetryAttempts(attempts: number | null) {
        return new EventBusSettingsBuilder({
            ...this.settings,
            retryAttempts: attempts,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setBackoffPolicy(policy: BackoffPolicy | null) {
        return new EventBusSettingsBuilder({
            ...this.settings,
            backoffPolicy: policy,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setRetryPolicy(policy: RetryPolicy | null) {
        return new EventBusSettingsBuilder({
            ...this.settings,
            retryPolicy: policy,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setTimeout(time: TimeSpan | null) {
        return new EventBusSettingsBuilder({
            ...this.settings,
            timeout: time,
        });
    }

    build(this: EventBusSettingsBuilder<EventBusSettings>): EventBusSettings {
        return this.settings;
    }
}
