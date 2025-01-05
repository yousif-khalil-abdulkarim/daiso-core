/**
 * @module Storage
 */

import type { INamespacedEventBus } from "@/event-bus/contracts/_module";
import type {
    IStorageFactory,
    INamespacedStorage,
    IStorageAdapter,
    IStorageManager,
} from "@/storage/contracts/_module";
import { Storage } from "@/storage/implementations/storage/storage";
import type { Validator } from "@/utilities/_module";

/**
 * @group Derivables
 */
export type StorageManagerSettings<TAdapters extends string = string> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adapters: Record<TAdapters, IStorageAdapter<any>>;
    defaultAdapter: NoInfer<TAdapters>;
    rootNamespace: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    eventBus?: INamespacedEventBus<any>;
};

/**
 * @group Derivables
 */
export class StorageManager<TAdapters extends string = string, TType = unknown>
    implements IStorageManager<TAdapters, TType>
{
    private readonly adapters: Record<TAdapters, IStorageAdapter>;
    private readonly defaultAdapter: TAdapters;
    private readonly rootNamespace: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly eventBus?: INamespacedEventBus<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private validator: Validator<any> = (value) => value;

    constructor(settings: StorageManagerSettings<TAdapters>) {
        const { adapters, defaultAdapter, rootNamespace, eventBus } = settings;
        this.adapters = adapters;
        this.defaultAdapter = defaultAdapter;
        this.rootNamespace = rootNamespace;
        this.eventBus = eventBus;
    }

    use(adapter: TAdapters = this.defaultAdapter): INamespacedStorage<TType> {
        return new Storage(this.adapters[adapter], {
            rootNamespace: this.rootNamespace,
            validator: this.validator,
            eventBus: this.eventBus,
        });
    }

    withValidation<TOutput extends TType = TType>(
        validator: Validator<TOutput>,
    ): IStorageFactory<TAdapters, TOutput> {
        this.validator = validator;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
        return this as any;
    }

    withType<TOutput extends TType = TType>(): IStorageFactory<
        TAdapters,
        TOutput
    > {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
        return this as any;
    }
}
