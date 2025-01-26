/**
 * @module Cache
 */

import type { ICacheAdapter } from "@/cache/contracts/_module";
import type { IBuildable, OneOrMore } from "@/utilities/_module";
import type { TimeSpan } from "@/utilities/_module";
import type { BackoffPolicy, RetryPolicy } from "@/async/_module";
import type { IGroupableEventBus } from "@/event-bus/contracts/_module";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { IGroupableCache } from "@/cache/contracts/_module";
import type { IFlexibleSerde } from "@/serde/contracts/_module";

/**
 * @group Derivables
 */
export type CacheSettings = {
    /**
     * You can pass one or more <i>{@link IFlexibleSerde}</i> that will be used to register all <i>{@link IGroupableCache}</i> related errors and events.
     * @default {true}
     */
    serde: OneOrMore<IFlexibleSerde>;

    /**
     * If set to true, all <i>{@link IGroupableCache}</i> related errors will be registered with the specified <i>IFlexibleSerde</i> during constructor initialization.
     * This ensures that all <i>{@link IGroupableCache}</i> related errors will be serialized correctly.
     * @default {true}
     */
    shouldRegisterErrors?: boolean;

    /**
     * If set to true, all <i>{@link IGroupableCache}</i> related events will be registered with the specified <i>IFlexibleSerde</i> during constructor initialization.
     * This ensures that all <i>{@link IGroupableCache}</i> related events will be serialized correctly.
     * @default {true}
     */
    shouldRegisterEvents?: boolean;

    adapter: ICacheAdapter<any>;

    /**
     * In order to listen to events of <i>{@link Cache}</i> class you must pass in <i>{@link IGroupableEventBus}</i>.
     */
    eventBus?: IGroupableEventBus<any>;

    /**
     * You can decide the default ttl value. If null is passed then no ttl will be used by default.
     * @default {null}
     */
    defaultTtl?: TimeSpan | null;

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
 * The <i>CacheSettingsBuilder</i> is an immutable builder class, meaning that each method invocation creates a new instance.
 * @group Derivables
 */
export class CacheSettingsBuilder<TSettings extends Partial<CacheSettings>>
    implements IBuildable<CacheSettings>
{
    constructor(private readonly settings: TSettings = {} as TSettings) {}

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setShouldRegisterErrors(shouldRegisterErrors: boolean) {
        return new CacheSettingsBuilder({
            ...this.settings,
            shouldRegisterErrors,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setShouldRegisterEvents(shouldRegisterEvents: boolean) {
        return new CacheSettingsBuilder({
            ...this.settings,
            shouldRegisterEvents,
        });
    }

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
