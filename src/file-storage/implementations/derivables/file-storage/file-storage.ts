/**
 * @module FileStorage
 */
import { type Buffer } from "node:buffer";

import { type IEventBus } from "@/event-bus/contracts/_module.js";
import { NoOpEventBusAdapter } from "@/event-bus/implementations/adapters/_module.js";
import { EventBus } from "@/event-bus/implementations/derivables/_module.js";
import {
    type FileStorageEventMap,
    type IFile,
    type IFileListenable,
    type IFileStorage,
    type IFileStorageAdapter,
} from "@/file-storage/contracts/_module.js";
import { FileSerdeTransformer } from "@/file-storage/implementations/derivables/file-storage/file-serde-transformer.js";
import { File } from "@/file-storage/implementations/derivables/file-storage/file.js";
import { type INamespace } from "@/namespace/contracts/_module.js";
import { NoOpNamespace } from "@/namespace/implementations/_module.js";
import { type ISerderRegister } from "@/serde/contracts/_module.js";
import { NoOpSerdeAdapter } from "@/serde/implementations/adapters/_module.js";
import { Serde } from "@/serde/implementations/derivables/_module.js";
import { type ITask } from "@/task/contracts/_module.js";
import { Task } from "@/task/implementations/_module.js";
import { CORE, resolveOneOrMore, type OneOrMore } from "@/utilities/_module.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/file-storage"`
 * @group Derivables
 */
export type FileStorageSettingsBase = {
    /**
     * @default
     * ```ts
     * import { NoOpNamespace } from "@daiso-tech/core/namespace";
     *
     * new NoOpNamespace()
     * ```
     */
    namespace?: INamespace;

    /**
     * @default
     * ```ts
     * import { EventBus } from "@daiso-tech/core/event-bus";
     * import { NoOpEventBusAdapter } from "@daiso-tech/core/event-bus/no-op-event-bus-adapter";
     *
     * new EventBus({
     *   adapter: new NoOpEventBusAdapter()
     * })
     * ```
     */
    eventBus?: IEventBus;

    /**
     * @default
     * ```ts
     * import { Serde } from "@daiso-tech/serde";
     * import { NoOpSerdeAdapter } from "@daiso-tech/serde/no-op-serde-adapter";
     *
     * new Serde(new NoOpSerdeAdapter())
     * ```
     */
    serde?: OneOrMore<ISerderRegister>;

    /**
     * @default ""
     */
    serdeTransformerName?: string;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/file-storage"`
 * @group Derivables
 */
export type FileStorageSettings = FileStorageSettingsBase & {
    adapter: IFileStorageAdapter;
};

/**
 * `FileStorage` class can be derived from any {@link IFileStorageAdapter | `IFileStorageAdapter`}.
 *
 * Note the {@link IFile | `IFile`} instances created by the `FileStorage` class are serializable and deserializable,
 * allowing them to be seamlessly transferred across different servers, processes, and databases.
 * This can be done directly using {@link ISerderRegister | `ISerderRegister`} or indirectly through components that rely on {@link ISerderRegister | `ISerderRegister`} internally.
 *
 * IMPORT_PATH: `"@daiso-tech/core/file-storage"`
 * @group Derivables
 */
export class FileStorage implements IFileStorage {
    private readonly eventBus: IEventBus<FileStorageEventMap>;
    private readonly adapter: IFileStorageAdapter;
    private readonly namespace: INamespace;
    private readonly serde: OneOrMore<ISerderRegister>;
    private readonly serdeTransformerName: string;

    constructor(settings: FileStorageSettings) {
        const {
            adapter,
            namespace = new NoOpNamespace(),
            eventBus = new EventBus({
                adapter: new NoOpEventBusAdapter(),
            }),
            serde = new Serde(new NoOpSerdeAdapter()),
            serdeTransformerName = "",
        } = settings;

        this.adapter = adapter;
        this.namespace = namespace;
        this.eventBus = eventBus;
        this.serde = serde;
        this.serdeTransformerName = serdeTransformerName;
        this.registerToSerde();
    }

    private registerToSerde(): void {
        const transformer = new FileSerdeTransformer({
            adapter: this.adapter,
            eventBus: this.eventBus,
            namespace: this.namespace,
            serdeTransformerName: this.serdeTransformerName,
        });
        for (const serde of resolveOneOrMore(this.serde)) {
            serde.registerCustom(transformer, CORE);
        }
    }

    create(key: string): IFile {
        return new File({
            adapter: this.adapter,
            key: this.namespace.create(key),
            eventDispatcher: this.eventBus,
            serdeTransformerName: this.serdeTransformerName,
            namespace: this.namespace,
        });
    }

    clear(): ITask<void> {
        return new Task(async () => {
            await this.adapter.removeByPrefix(this.namespace.toString());
        });
    }

    removeMany(files: Iterable<string | IFile>): ITask<boolean> {
        return new Task(async () => {
            const namespacedKeys = [...files]
                .map((file) => {
                    if (typeof file === "string") {
                        return this.namespace.create(file);
                    }
                    return file.key;
                })
                .map((key) => {
                    return key.toString();
                });

            return await this.adapter.removeMany(namespacedKeys);
        });
    }

    get events(): IFileListenable {
        return this.eventBus;
    }
}

declare const fileStorage: IFileStorage;
declare const arrayBuffer: AsyncIterable<ArrayBuffer>;
declare const buffer: AsyncIterable<Buffer>;
declare const uint8Array: AsyncIterable<Uint8Array>;
declare const int8Array: AsyncIterable<Int8Array>;
declare const uint16Array: AsyncIterable<Uint16Array>;
declare const int16Array: AsyncIterable<Int16Array>;
declare const uint32Array: AsyncIterable<Uint32Array>;
declare const int32Array: AsyncIterable<Int32Array>;
declare const bigInt64Array: AsyncIterable<BigInt64Array>;
declare const bigUint64Array: AsyncIterable<BigUint64Array>;
declare const float32Array: AsyncIterable<Float32Array>;
declare const float64Array: AsyncIterable<Float64Array>;
declare const dataView: AsyncIterable<DataView>;
declare const sharedArrayBuffer: AsyncIterable<SharedArrayBuffer>;
declare const str: AsyncIterable<string>;

await fileStorage.create("abra").addStream(arrayBuffer);
await fileStorage.create("abra").addStream(buffer);
await fileStorage.create("abra").addStream(uint8Array);
await fileStorage.create("abra").addStream(int8Array);
await fileStorage.create("abra").addStream(uint16Array);
await fileStorage.create("abra").addStream(int16Array);
await fileStorage.create("abra").addStream(uint32Array);
await fileStorage.create("abra").addStream(int32Array);
await fileStorage.create("abra").addStream(bigInt64Array);
await fileStorage.create("abra").addStream(bigUint64Array);
await fileStorage.create("abra").addStream(float32Array);
await fileStorage.create("abra").addStream(float64Array);
await fileStorage.create("abra").addStream(dataView);
await fileStorage.create("abra").addStream(sharedArrayBuffer);
await fileStorage.create("abra").addStream(str);
