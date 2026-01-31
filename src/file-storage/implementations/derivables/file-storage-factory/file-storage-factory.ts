/**
 * @module FileStorage
 */

import { type IEventBus } from "@/event-bus/contracts/_module.js";
import {
    type IFileStorage,
    type IFileStorageAdapter,
    type IFileStorageFactory,
} from "@/file-storage/contracts/_module.js";
import {
    FileStorage,
    type FileStorageSettingsBase,
} from "@/file-storage/implementations/derivables/_module.js";
import { type INamespace } from "@/namespace/contracts/_module.js";
import {
    DefaultAdapterNotDefinedError,
    UnregisteredAdapterError,
} from "@/utilities/_module.js";

/**
 * IMPORT_PATH: `"@daiso-tech/core/file-storage"`
 * @group Derivables
 */
export type FileStorageAdapters<TAdapters extends string = string> = Partial<
    Record<TAdapters, IFileStorageAdapter>
>;

/**
 * IMPORT_PATH: `"@daiso-tech/core/file-storage"`
 * @group Derivables
 */
export type FileStorageFactorySettings<TAdapters extends string = string> =
    FileStorageSettingsBase & {
        adapters: FileStorageAdapters<TAdapters>;

        defaultAdapter?: NoInfer<TAdapters>;
    };

/**
 * IMPORT_PATH: `"@daiso-tech/core/file-storage"`
 * @group Derivables
 */
export class FileStorageFactory<TAdapters extends string = string>
    implements IFileStorageFactory<TAdapters>
{
    constructor(
        private readonly settings: FileStorageFactorySettings<TAdapters>,
    ) {}

    setNamespace(namespace: INamespace): FileStorageFactory<TAdapters> {
        return new FileStorageFactory({
            ...this.settings,
            namespace,
        });
    }

    setEventBus(eventBus: IEventBus): FileStorageFactory<TAdapters> {
        return new FileStorageFactory({
            ...this.settings,
            eventBus,
        });
    }

    use(adapterName?: TAdapters): IFileStorage {
        if (adapterName === undefined) {
            throw new DefaultAdapterNotDefinedError(FileStorageFactory.name);
        }
        const adapter = this.settings.adapters[adapterName];
        if (adapter === undefined) {
            throw new UnregisteredAdapterError(adapterName);
        }
        return new FileStorage({
            ...this.settings,
            adapter,
        });
    }
}
