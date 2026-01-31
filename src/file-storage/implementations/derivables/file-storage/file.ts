/**
 * @module FileStorage
 */

import { Readable } from "stream";

import { type IEventDispatcher } from "@/event-bus/contracts/_module.js";
import { FileSize } from "@/file-size/implementations/_module.js";
import {
    type IFile,
    type IFileStorageAdapter,
    type FileMetadata,
    type FileContent,
    type FileStream,
    type ArrayBufferLikeable,
    KeyExistsFileStorageError,
    KeyNotFoundFileStorageError,
} from "@/file-storage/contracts/_module.js";
import { type IKey, type INamespace } from "@/namespace/contracts/_module.js";
import { type ITask } from "@/task/contracts/_module.js";
import { Task } from "@/task/implementations/_module.js";

/**
 * @internal
 */
export type FileSettings = {
    adapter: IFileStorageAdapter;
    key: IKey;
    eventDispatcher: IEventDispatcher;
    serdeTransformerName: string;
    namespace: INamespace;
};

/**
 * @internal
 */
export type ISerializedFile = {
    version: "1";
    key: string;
};

/**
 * @internal
 */
function isArrayBufferLikeable(
    buffer: ArrayBufferLike | ArrayBufferLikeable,
): buffer is ArrayBufferLikeable {
    return typeof buffer === "object" && "buffer" in buffer;
}

/**
 * @internal
 */
function resolveFileContent(fileContent: FileContent): Uint8Array {
    if (typeof fileContent === "string") {
        return new TextEncoder().encode(fileContent);
    }
    if (isArrayBufferLikeable(fileContent)) {
        fileContent = fileContent.buffer;
    }
    return new Uint8Array(fileContent);
}

/**
 * @internal
 */
class ResolveFileStream implements AsyncIterable<Uint8Array> {
    constructor(private readonly fileStream: FileStream) {}

    async *[Symbol.asyncIterator](): AsyncIterator<Uint8Array> {
        for await (const content of this.fileStream) {
            yield resolveFileContent(content);
        }
    }
}

/**
 * @internal
 */
export class File implements IFile {
    /**
     * @internal
     */
    static _internal_serialize(deserializedValue: File): ISerializedFile {
        return {
            version: "1",
            key: deserializedValue._key.get(),
        };
    }

    private readonly adapter: IFileStorageAdapter;
    private readonly _key: IKey;
    private readonly eventDispatcher: IEventDispatcher;
    private readonly serdeTransformerName: string;
    private readonly namespace: INamespace;

    constructor(settings: FileSettings) {
        const {
            adapter,
            key,
            eventDispatcher,
            serdeTransformerName,
            namespace,
        } = settings;

        this.adapter = adapter;
        this._key = key;
        this.eventDispatcher = eventDispatcher;
        this.serdeTransformerName = serdeTransformerName;
        this.namespace = namespace;
    }

    _internal_getNamespace(): INamespace {
        return this.namespace;
    }

    _internal_getSerdeTransformerName(): string {
        return this.serdeTransformerName;
    }

    _internal_getAdapter(): IFileStorageAdapter {
        return this.adapter;
    }

    get key(): IKey {
        return this._key;
    }

    asText(): ITask<string | null> {
        return new Task(async () => {
            const bytes = await this.asBytes();
            if (bytes === null) {
                return null;
            }
            return new TextDecoder().decode(bytes);
        });
    }

    asTextOrFail(): ITask<string> {
        return new Task(async () => {
            const text = await this.asText();
            if (text === null) {
                throw KeyNotFoundFileStorageError.create(this._key);
            }
            return text;
        });
    }

    asBytes(): ITask<Uint8Array | null> {
        return new Task(async () => {
            return await this.adapter.getBytes(this._key.toString());
        });
    }

    asBytesOrFail(): ITask<Uint8Array> {
        return new Task(async () => {
            const bytes = await this.asBytes();
            if (bytes === null) {
                throw KeyNotFoundFileStorageError.create(this._key);
            }
            return bytes;
        });
    }

    asBuffer(): ITask<Buffer | null> {
        return new Task<Buffer | null>(async () => {
            const bytes = await this.asBytes();
            if (bytes === null) {
                return null;
            }
            return Buffer.from(bytes);
        });
    }

    asBufferOrFail(): ITask<Buffer> {
        return new Task(async () => {
            const buffer = await this.asBuffer();
            if (buffer === null) {
                throw KeyNotFoundFileStorageError.create(this._key);
            }
            return buffer;
        });
    }

    asArrayBuffer(): ITask<ArrayBuffer | null> {
        return new Task<ArrayBuffer | null>(async () => {
            const bytes = await this.asBuffer();
            if (bytes === null) {
                return null;
            }
            return Buffer.from(bytes).buffer;
        });
    }

    asArrayBufferOrFail(): ITask<ArrayBuffer> {
        return new Task(async () => {
            const arrayBuffer = await this.asArrayBuffer();
            if (arrayBuffer === null) {
                throw KeyNotFoundFileStorageError.create(this._key);
            }
            return arrayBuffer;
        });
    }

    asReadable(): ITask<Readable | null> {
        return new Task(async () => {
            const stream = await this.adapter.getStream(this._key.toString());
            if (stream === null) {
                return null;
            }
            return Readable.from(stream);
        });
    }

    asReadableOrFail(): ITask<Readable> {
        return new Task(async () => {
            const stream = await this.asReadable();
            if (stream === null) {
                throw KeyNotFoundFileStorageError.create(this._key);
            }
            return stream;
        });
    }

    asReadableStream(): ITask<ReadableStream<Uint8Array> | null> {
        return new Task(async () => {
            const stream = await this.adapter.getStream(this._key.toString());
            if (stream === null) {
                return null;
            }
            return ReadableStream.from(stream);
        });
    }

    asReadableStreamOrFail(): ITask<ReadableStream<Uint8Array>> {
        return new Task(async () => {
            const stream = await this.asReadableStream();
            if (stream === null) {
                throw KeyNotFoundFileStorageError.create(this._key);
            }
            return stream;
        });
    }

    getMetadata(): ITask<FileMetadata | null> {
        return new Task<FileMetadata | null>(async () => {
            const metadata = await this.adapter.getMetaData(
                this._key.toString(),
            );
            if (metadata === null) {
                throw KeyNotFoundFileStorageError.create(this.key);
            }
            return {
                contentType: metadata.contentType,
                etag: metadata.etag,
                createdAt: metadata.createdAt,
                updatedAt: metadata.updatedAt,
                fileSize: FileSize.fromBytes(metadata.fileSizeInBytes),
            };
        });
    }

    getMetadataOrFail(): ITask<FileMetadata> {
        return new Task(async () => {
            const metadata = await this.getMetadata();
            if (metadata === null) {
                throw KeyNotFoundFileStorageError.create(this._key);
            }
            return metadata;
        });
    }

    exists(): ITask<boolean> {
        return new Task(async () => {
            return await this.adapter.exists(this._key.toString());
        });
    }

    missing(): ITask<boolean> {
        return new Task(async () => {
            return await this.exists();
        });
    }

    add(content: FileContent): ITask<boolean> {
        return new Task(async () => {
            return await this.adapter.add(
                this._key.toString(),
                resolveFileContent(content),
            );
        });
    }

    addOrFail(content: FileContent): ITask<void> {
        return new Task(async () => {
            const hasAdded = await this.add(content);
            if (!hasAdded) {
                throw KeyExistsFileStorageError.create(this._key);
            }
        });
    }

    addStream(stream: FileStream): ITask<boolean> {
        return new Task(async () => {
            return await this.adapter.addStream(
                this._key.toString(),
                new ResolveFileStream(stream),
            );
        });
    }

    addStreamOrFail(stream: FileStream): ITask<void> {
        return new Task(async () => {
            const hasAdded = await this.addStream(stream);
            if (!hasAdded) {
                throw KeyExistsFileStorageError.create(this._key);
            }
        });
    }

    update(content: FileContent): ITask<boolean> {
        return new Task(async () => {
            return await this.adapter.update(
                this._key.toString(),
                resolveFileContent(content),
            );
        });
    }

    updateOrFail(content: FileContent): ITask<void> {
        return new Task(async () => {
            const hasUpdated = await this.update(content);
            if (!hasUpdated) {
                throw KeyNotFoundFileStorageError.create(this._key);
            }
        });
    }

    updateStream(stream: FileStream): ITask<boolean> {
        return new Task(async () => {
            return await this.adapter.updateStream(
                this._key.toString(),
                new ResolveFileStream(stream),
            );
        });
    }

    updateStreamOrFail(stream: FileStream): ITask<void> {
        return new Task(async () => {
            const hasUpdated = await this.updateStream(stream);
            if (!hasUpdated) {
                throw KeyNotFoundFileStorageError.create(this._key);
            }
        });
    }

    put(content: FileContent): ITask<boolean> {
        return new Task(async () => {
            return await this.adapter.put(
                this._key.toString(),
                resolveFileContent(content),
            );
        });
    }

    putStream(stream: FileStream): ITask<boolean> {
        return new Task(async () => {
            return await this.adapter.putStream(
                this._key.toString(),
                new ResolveFileStream(stream),
            );
        });
    }
}
