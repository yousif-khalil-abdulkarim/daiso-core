/**
 * @module Cache
 */

import type { IGroupableEventBus } from "@/event-bus/contracts/_module";
import type { ICacheAdapter } from "@/cache/contracts/_module";
import type { TimeSpan } from "@/utilities/_module";
import type { BackoffPolicy, RetryPolicy } from "@/async/_module";

/**
 * @group Derivables
 */
export type CacheAdapters<TAdapters extends string> = Partial<
    Record<TAdapters, ICacheAdapter<any>>
>;

/**
 * @group Derivables
 */
export type CacheFactorySettings<TAdapters extends string = string> = {
    adapters: CacheAdapters<TAdapters>;
    defaultAdapter?: NoInfer<TAdapters>;

    /**
     * You can decide the default ttl value. If null is passed then no ttl will be used by default.
     */
    defaultTtl?: TimeSpan;

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
 * The <i>CacheFactorySettingsBuilder</i> is an immutable builder class, meaning that each method invocation creates a new instance.
 * @group Derivables
 */
export class CacheFactorySettingsBuilder<
    TSettings extends CacheFactorySettings,
> {
    constructor(private readonly settings: TSettings = {} as TSettings) {}

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setEventBus(eventBus: IGroupableEventBus<any>) {
        return new CacheFactorySettingsBuilder({
            ...this.settings,
            eventBus,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setDefultTtl(time: TimeSpan) {
        return new CacheFactorySettingsBuilder({
            ...this.settings,
            defaultTtl: time,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setRetryAttempts(attempts: number | null) {
        return new CacheFactorySettingsBuilder({
            ...this.settings,
            retryAttempts: attempts,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setBackoffPolicy(policy: BackoffPolicy | null) {
        return new CacheFactorySettingsBuilder({
            ...this.settings,
            backoffPolicy: policy,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setRetryPolicy(policy: RetryPolicy | null) {
        return new CacheFactorySettingsBuilder({
            ...this.settings,
            retryPolicy: policy,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setTimeout(time: TimeSpan | null) {
        return new CacheFactorySettingsBuilder({
            ...this.settings,
            timeout: time,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setAdapter<TName extends string>(name: TName, adapter: ICacheAdapter<any>) {
        return new CacheFactorySettingsBuilder({
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
        return new CacheFactorySettingsBuilder({
            ...this.settings,
            defaultAdapter: adapter,
        });
    }

    build(
        this: CacheFactorySettingsBuilder<CacheFactorySettings>,
    ): CacheFactorySettings {
        return this.settings;
    }
}
