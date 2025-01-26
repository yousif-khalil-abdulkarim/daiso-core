/**
 * @module Cache
 */

import type { ICacheAdapter } from "@/cache/contracts/_module";
import type { IBuildable, OneOrMore } from "@/utilities/_module";
import type { TimeSpan } from "@/utilities/_module";
import type { BackoffPolicy, RetryPolicy } from "@/async/_module";
import type { IGroupableEventBus } from "@/event-bus/contracts/_module";
import type { IFlexibleSerde } from "@/serde/contracts/_module";

/**
 * @group Derivables
 */
export type CacheSettings = {
    serde: OneOrMore<IFlexibleSerde>;

    adapter: ICacheAdapter<any>;

    /**
     * In order to listen to events of <i>{@link Cache}</i> class you must pass in <i>{@link IGroupableEventBus}</i>.
     */
    eventBus?: IGroupableEventBus<any>;

    /**
     * You can decide the default ttl value. If null is passed then no ttl will be used by default.
     */
    defaultTtl?: TimeSpan | null;

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
 * The <i>CacheSettingsBuilder</i> is an immutable builder class, meaning that each method invocation creates a new instance.
 * @group Derivables
 */
export class CacheSettingsBuilder<TSettings extends Partial<CacheSettings>>
    implements IBuildable<CacheSettings>
{
    constructor(private readonly settings: TSettings = {} as TSettings) {}

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setSerde(serde: OneOrMore<IFlexibleSerde>) {
        return new CacheSettingsBuilder({
            ...this.settings,
            serde,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setAdapter(adapter: ICacheAdapter<any>) {
        return new CacheSettingsBuilder({
            ...this.settings,
            adapter,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setEventBus(eventBus: IGroupableEventBus<any>) {
        return new CacheSettingsBuilder({
            ...this.settings,
            eventBus,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setDefultTtl(time: TimeSpan) {
        return new CacheSettingsBuilder({
            ...this.settings,
            defaultTtl: time,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setRetryAttempts(attempts: number | null) {
        return new CacheSettingsBuilder({
            ...this.settings,
            retryAttempts: attempts,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setBackoffPolicy(policy: BackoffPolicy | null) {
        return new CacheSettingsBuilder({
            ...this.settings,
            backoffPolicy: policy,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setRetryPolicy(policy: RetryPolicy | null) {
        return new CacheSettingsBuilder({
            ...this.settings,
            retryPolicy: policy,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setTimeout(time: TimeSpan | null) {
        return new CacheSettingsBuilder({
            ...this.settings,
            timeout: time,
        });
    }

    build(this: CacheSettingsBuilder<CacheSettings>): CacheSettings {
        return this.settings;
    }
}
