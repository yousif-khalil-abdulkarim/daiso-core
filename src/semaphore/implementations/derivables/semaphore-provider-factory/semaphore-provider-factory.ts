/**
 * @module Semaphore
 */
import type { IEventBus } from "@/event-bus/contracts/_module-exports.js";
import type {
    ISemaphoreProviderFactory,
    ISemaphoreProvider,
    SemaphoreAdapterVariants,
} from "@/semaphore/contracts/_module-exports.js";
import {
    DefaultAdapterNotDefinedError,
    Namespace,
    resolveOneOrMore,
    UnregisteredAdapterError,
} from "@/utilities/_module-exports.js";
import type {
    AsyncLazy,
    Factory,
    TimeSpan,
} from "@/utilities/_module-exports.js";
import {
    SemaphoreProvider,
    type SemaphoreProviderSettingsBase,
} from "@/semaphore/implementations/derivables/semaphore-provider/_module.js";
import type { LazyPromise } from "@/async/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore"`
 * @group Derivables
 */
export type SemaphoreAdapters<TAdapters extends string> = Partial<
    Record<TAdapters, SemaphoreAdapterVariants>
>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore"`
 * @group Derivables
 */
export type SemaphoreProviderFactorySettings<TAdapters extends string> =
    SemaphoreProviderSettingsBase & {
        adapters: SemaphoreAdapters<TAdapters>;

        defaultAdapter?: NoInfer<TAdapters>;
    };

/**
 * The `SemaphoreProviderFactory` class is immutable.
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore"`
 * @group Derivables
 */
export class SemaphoreProviderFactory<TAdapters extends string>
    implements ISemaphoreProviderFactory<TAdapters>
{
    constructor(
        private readonly settings: SemaphoreProviderFactorySettings<TAdapters>,
    ) {}

    setNamespace(namespace: Namespace): SemaphoreProviderFactory<TAdapters> {
        return new SemaphoreProviderFactory({
            ...this.settings,
            namespace,
        });
    }

    setEventBus(eventBus: IEventBus): SemaphoreProviderFactory<TAdapters> {
        return new SemaphoreProviderFactory({
            ...this.settings,
            eventBus,
        });
    }

    setDefaultTtl(ttl: TimeSpan): SemaphoreProviderFactory<TAdapters> {
        return new SemaphoreProviderFactory({
            ...this.settings,
            defaultTtl: ttl,
        });
    }

    setDefaultBlockingInterval(
        interval: TimeSpan,
    ): SemaphoreProviderFactory<TAdapters> {
        return new SemaphoreProviderFactory({
            ...this.settings,
            defaultBlockingInterval: interval,
        });
    }

    setDefaultBlockingTime(
        time: TimeSpan,
    ): SemaphoreProviderFactory<TAdapters> {
        return new SemaphoreProviderFactory({
            ...this.settings,
            defaultBlockingTime: time,
        });
    }

    setDefaultRefreshTime(time: TimeSpan): SemaphoreProviderFactory<TAdapters> {
        return new SemaphoreProviderFactory({
            ...this.settings,
            defaultRefreshTime: time,
        });
    }

    setLazyPromiseFactory(
        factory: Factory<AsyncLazy<any>, LazyPromise<any>>,
    ): SemaphoreProviderFactory<TAdapters> {
        return new SemaphoreProviderFactory({
            ...this.settings,
            lazyPromiseFactory: factory,
        });
    }

    use(
        adapterName: TAdapters | undefined = this.settings.defaultAdapter,
    ): ISemaphoreProvider {
        if (adapterName === undefined) {
            throw new DefaultAdapterNotDefinedError(
                SemaphoreProviderFactory.name,
            );
        }
        const adapter = this.settings.adapters[adapterName];
        if (adapter === undefined) {
            throw new UnregisteredAdapterError(adapterName);
        }
        const { namespace = new Namespace(["@", "lock"]) } = this.settings;
        return new SemaphoreProvider({
            ...this.settings,
            adapter,
            namespace: new Namespace([
                ...resolveOneOrMore(namespace._getInternal().original),
                adapterName,
            ]),
            serdeTransformerName: adapterName,
        });
    }
}
