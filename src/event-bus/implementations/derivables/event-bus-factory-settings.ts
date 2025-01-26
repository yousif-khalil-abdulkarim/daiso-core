/**
 * @module EventBus
 */

import type { BackoffPolicy, RetryPolicy } from "@/async/_module";
import type {
    IGroupableEventBus,
    IEventBusAdapter,
} from "@/event-bus/contracts/_module";
import type { IFlexibleSerde } from "@/serde/contracts/_module";
import type { OneOrMore, TimeSpan } from "@/utilities/_module";
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
    /**
     * You can pass one or more <i>{@link IFlexibleSerde}</i> that will be used to register all <i>{@link IGroupableEventBus}</i> related errors.
     * @default {true}
     */
    serde: OneOrMore<IFlexibleSerde>;

    /**
     * If set to true, all <i>{@link IGroupableEventBus}</i> related errors will be registered with the specified <i>IFlexibleSerde</i> during constructor initialization.
     * This ensures that all <i>{@link IGroupableEventBus}</i> related errors will be serialized correctly.
     * @default {true}
     */
    shouldRegisterErrors?: boolean;

    adapters: EventBusAdapters<TAdapters>;

    defaultAdapter?: NoInfer<TAdapters>;

    /**
     * In order to listen to events of <i>{@link Cache}</i> class you must pass in <i>{@link IGroupableEventBus}</i>.
     */
    eventBus?: IGroupableEventBus<any>;

    /**
     * The default retry attempt to use in the returned <i>LazyPromise</i>.
     * @default {null}
     */
    retryAttempts?: number | null;

    /**
     * The default backof policy to use in the returned <i>LazyPromise</i>.
     * @default {null}
     */
    backoffPolicy?: BackoffPolicy | null;

    /**
     * The default retry policy to use in the returned <i>LazyPromise</i>.
     * @default {null}
     */
    retryPolicy?: RetryPolicy | null;

    /**
     * The default timeout to use in the returned <i>LazyPromise</i>.
     * @default {null}
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
    setShouldRegisterErrors(shouldRegisterErrors: boolean) {
        return new EventBusFactorySettingsBuilder({
            ...this.settings,
            shouldRegisterErrors,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setSerde(serde: OneOrMore<IFlexibleSerde>) {
        return new EventBusFactorySettingsBuilder({
            ...this.settings,
            serde,
        });
    }

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
