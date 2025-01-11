/**
 * @module Storage
 */

import {
    DefaultDriverNotDefinedError,
    UnregisteredDriverError,
} from "@/utilities/global-errors";
import type { INamespacedEventBus } from "@/event-bus/contracts/_module";
import type {
    IStorageFactory,
    INamespacedStorage,
    IStorageAdapter,
} from "@/storage/contracts/_module";
import { Storage } from "@/storage/implementations/derivables/storage";
import type { Validator } from "@/utilities/_module";

/**
 * @group Derivables
 */
export type StorageDrivers<TDrivers extends string> = Partial<
    Record<TDrivers, IStorageAdapter<any>>
>;

/**
 * @group Derivables
 */
export type StorageFactorySettings<TDrivers extends string = string> = {
    drivers: StorageDrivers<TDrivers>;
    defaultDriver?: NoInfer<TDrivers>;
    eventBus?: INamespacedEventBus<any>;
    rootNamespace?: string;
};

/**
 * @group Derivables
 * @example
 * ```ts
 * import { StorageFactory } from "@daiso-tech/core";
 * import Redis from "ioredis"
 *
 * const storageFactory = new StorageFactory({
 *   drivers: {
 *     memory: new MemoryStorageAdapter(),
 *     redis: new RedisStorageAdapter(new Redis()),
 *   },
 *   defaultDriver: "memory",
 *   rootNamespace: "@events"
 * });
 * ```
 */
export class StorageFactory<TDrivers extends string = string, TType = unknown>
    implements IStorageFactory<TDrivers, TType>
{
    private readonly rootNamespace?: string;
    private readonly drivers: StorageDrivers<TDrivers>;
    private readonly defaultDriver?: TDrivers;
    private readonly eventBus?: INamespacedEventBus<any>;
    private validator: Validator<any> = (value) => value;

    constructor(settings: StorageFactorySettings<TDrivers>) {
        const { drivers, defaultDriver, eventBus, rootNamespace } = settings;
        this.drivers = drivers;
        this.defaultDriver = defaultDriver;
        this.eventBus = eventBus;
        this.rootNamespace = rootNamespace;
    }

    use(
        driverName: TDrivers | undefined = this.defaultDriver,
    ): INamespacedStorage<TType> {
        if (driverName === undefined) {
            throw new DefaultDriverNotDefinedError(StorageFactory.name);
        }
        const driver = this.drivers[driverName];
        if (driver === undefined) {
            throw new UnregisteredDriverError(driverName);
        }
        return new Storage(driver, {
            validator: this.validator,
            eventBus: this.eventBus,
            rootNamespace: this.rootNamespace,
        });
    }

    withValidation<TOutput extends TType = TType>(
        validator: Validator<TOutput>,
    ): IStorageFactory<TDrivers, TOutput> {
        this.validator = validator;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this as any;
    }

    withType<TOutput extends TType = TType>(): IStorageFactory<
        TDrivers,
        TOutput
    > {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this as any;
    }
}
