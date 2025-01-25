/**
 * @module EventBus
 */

import type { BackoffPolicy, RetryPolicy } from "@/async/_module";
import type {
    IGroupableEventBus,
    IEventBusAdapter,
} from "@/event-bus/contracts/_module";
import type { TimeSpan } from "@/utilities/_module";
/**
 * @group Derivables
 */
export type EventBusAdapters<TAdapters extends string = string> = Partial<
    Record<TAdapters, IEventBusAdapter>
>;

/**
 * The <i>EventBusFactorySettings</i> is an immutable builder class, meaning that each method invocation creates a new instance.
 * @group Derivables
 */
export type EventBusFactorySettings<TAdapters extends string = string> = {
    adapters: EventBusAdapters<TAdapters>;
    defaultAdapter?: NoInfer<TAdapters>;

    /**
     * In order to listen to events of <i>{@link Cache}</i> class you must pass in <i>{@link IGroupableEventBus}</i>.
     */
    eventBus?: IGroupableEventBus<any>;

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
 * The <i>EventBusFactorySettingsBuilder</i> is an immutable builder class, meaning that each method invocation creates a new instance.
 * @group Derivables
 */
export class EventBusFactorySettingsBuilder<
    TSettings extends EventBusFactorySettings,
> {
    constructor(private readonly settings: TSettings = {} as TSettings) {}

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setEventBus(eventBus: IGroupableEventBus<any>) {
        return new EventBusFactorySettingsBuilder({
            ...this.settings,
            eventBus,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setRetryAttempts(attempts: number | null) {
        return new EventBusFactorySettingsBuilder({
            ...this.settings,
            retryAttempts: attempts,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setBackoffPolicy(policy: BackoffPolicy | null) {
        return new EventBusFactorySettingsBuilder({
            ...this.settings,
            backoffPolicy: policy,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setRetryPolicy(policy: RetryPolicy | null) {
        return new EventBusFactorySettingsBuilder({
            ...this.settings,
            retryPolicy: policy,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setTimeout(time: TimeSpan | null) {
        return new EventBusFactorySettingsBuilder({
            ...this.settings,
            timeout: time,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setAdapter<TName extends string>(name: TName, adapter: IEventBusAdapter) {
        return new EventBusFactorySettingsBuilder({
            ...this.settings,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            adapters: {
                ...this.settings.adapters,
                [name]: adapter,
            } as const,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setDefaultAdapter(adapter: string) {
        return new EventBusFactorySettingsBuilder({
            ...this.settings,
            defaultAdapter: adapter,
        });
    }

    build(
        this: EventBusFactorySettingsBuilder<EventBusFactorySettings>,
    ): EventBusFactorySettings {
        return this.settings;
    }
}
