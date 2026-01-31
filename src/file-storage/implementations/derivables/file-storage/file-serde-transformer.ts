/**
 * @module File
 */

import { type IEventBus } from "@/event-bus/contracts/_module.js";
import {
    type FileStorageEventMap,
    type IFileStorageAdapter,
} from "@/file-storage/contracts/_module.js";
import {
    File,
    type ISerializedFile,
} from "@/file-storage/implementations/derivables/file-storage/file.js";
import { type INamespace } from "@/namespace/contracts/_module.js";
import { type ISerdeTransformer } from "@/serde/contracts/_module.js";
import { getConstructorName, type OneOrMore } from "@/utilities/_module.js";

/**
 * @internal
 */
export type FileSerdeTransformerSettings = {
    adapter: IFileStorageAdapter;
    namespace: INamespace;
    eventBus: IEventBus<FileStorageEventMap>;
    serdeTransformerName: string;
};

/**
 * @internal
 */
export class FileSerdeTransformer
    implements ISerdeTransformer<File, ISerializedFile>
{
    private readonly adapter: IFileStorageAdapter;
    private readonly namespace: INamespace;
    private readonly eventBus: IEventBus<FileStorageEventMap>;
    private readonly serdeTransformerName: string;

    constructor(settings: FileSerdeTransformerSettings) {
        const { adapter, namespace, eventBus, serdeTransformerName } = settings;

        this.adapter = adapter;
        this.namespace = namespace;
        this.eventBus = eventBus;
        this.serdeTransformerName = serdeTransformerName;
    }

    get name(): OneOrMore<string> {
        return [
            "circuitBreaker",
            this.serdeTransformerName,
            getConstructorName(this.adapter),
            this.namespace.toString(),
        ].filter((str) => str !== "");
    }

    isApplicable(value: unknown): value is File {
        const isFile =
            value instanceof File && getConstructorName(value) === File.name;
        if (!isFile) {
            return false;
        }

        const isSerdTransformerNameMathcing =
            this.serdeTransformerName ===
            value._internal_getSerdeTransformerName();

        const isNamespaceMatching =
            this.namespace.toString() ===
            value._internal_getNamespace().toString();

        const isAdapterMatching =
            getConstructorName(this.adapter) ===
            getConstructorName(value._internal_getAdapter());

        return (
            isSerdTransformerNameMathcing &&
            isNamespaceMatching &&
            isAdapterMatching
        );
    }

    deserialize(serializedValue: ISerializedFile): File {
        const { key } = serializedValue;
        const keyObj = this.namespace.create(key);

        return new File({
            eventDispatcher: this.eventBus,
            adapter: this.adapter,
            key: keyObj,
            serdeTransformerName: this.serdeTransformerName,
            namespace: this.namespace,
        });
    }

    serialize(deserializedValue: File): ISerializedFile {
        return File._internal_serialize(deserializedValue);
    }
}
