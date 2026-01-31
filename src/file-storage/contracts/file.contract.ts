/**
 * @module FileStorage
 */

import { type Readable } from "node:stream";

import { type IFileSize } from "@/file-size/contracts/_module.js";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type KeyExistsFileStorageError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type KeyNotFoundFileStorageError,
} from "@/file-storage/contracts/file-storage.errors.js";
import { type IKey } from "@/namespace/contracts/_module.js";
import { type ITask } from "@/task/contracts/_module.js";

/**
 * IMPORT_PATH: `"@daiso-tech/core/file-storage/contracts"`
 * @group Contracts
 */
export type FileMetadata = {
    etag: string;
    contentType: string;
    fileSize: IFileSize;
    createdAt: Date;
    updatedAt: Date | null;
};

/**
 * IMPORT_PATH: `"@daiso-tech/core/file-storage/contracts"`
 * @group Contracts
 */
export type IReadableFile = {
    readonly key: IKey;

    asText(): ITask<string | null>;

    /**
     * @throws {KeyNotFoundFileStorageError} {@link KeyNotFoundFileStorageError}
     */
    asTextOrFail(): ITask<string>;

    asBytes(): ITask<Uint8Array | null>;

    /**
     * @throws {KeyNotFoundFileStorageError} {@link KeyNotFoundFileStorageError}
     */
    asBytesOrFail(): ITask<Uint8Array>;

    asBuffer(): ITask<Buffer | null>;

    /**
     * @throws {KeyNotFoundFileStorageError} {@link KeyNotFoundFileStorageError}
     */
    asBufferOrFail(): ITask<Buffer>;

    asArrayBuffer(): ITask<ArrayBuffer | null>;

    /**
     * @throws {KeyNotFoundFileStorageError} {@link KeyNotFoundFileStorageError}
     */
    asArrayBufferOrFail(): ITask<ArrayBuffer>;

    asReadable(): ITask<Readable | null>;

    /**
     * @throws {KeyNotFoundFileStorageError} {@link KeyNotFoundFileStorageError}
     */
    asReadableOrFail(): ITask<Readable>;

    asReadableStream(): ITask<ReadableStream<Uint8Array> | null>;

    /**
     * @throws {KeyNotFoundFileStorageError} {@link KeyNotFoundFileStorageError}
     */
    asReadableStreamOrFail(): ITask<ReadableStream<Uint8Array>>;

    getMetadata(): ITask<FileMetadata | null>;

    /**
     * @throws {KeyNotFoundFileStorageError} {@link KeyNotFoundFileStorageError}
     */
    getMetadataOrFail(): ITask<FileMetadata>;

    exists(): ITask<boolean>;

    missing(): ITask<boolean>;
};

/**
 * IMPORT_PATH: `"@daiso-tech/core/file-storage/contracts"`
 * @group Contracts
 */
export type ArrayBufferLikeable = { buffer: ArrayBufferLike };

/**
 * IMPORT_PATH: `"@daiso-tech/core/file-storage/contracts"`
 * @group Contracts
 */
export type FileContent = string | ArrayBufferLike | ArrayBufferLikeable;

/**
 * IMPORT_PATH: `"@daiso-tech/core/file-storage/contracts"`
 * @group Contracts
 */
export type FileStream = AsyncIterable<FileContent>;

/**
 * IMPORT_PATH: `"@daiso-tech/core/file-storage/contracts"`
 * @group Contracts
 */
export type IFile = IReadableFile & {
    add(content: FileContent): ITask<boolean>;

    /**
     * @throws {KeyExistsFileStorageError} {@link KeyExistsFileStorageError}
     */
    addOrFail(content: FileContent): ITask<void>;

    addStream(stream: FileStream): ITask<boolean>;

    /**
     * @throws {KeyExistsFileStorageError} {@link KeyExistsFileStorageError}
     */
    addStreamOrFail(stream: FileStream): ITask<void>;

    update(content: FileContent): ITask<boolean>;

    /**
     * @throws {KeyNotFoundFileStorageError} {@link KeyNotFoundFileStorageError}
     */
    updateOrFail(content: FileContent): ITask<void>;

    updateStream(stream: FileStream): ITask<boolean>;

    /**
     * @throws {KeyNotFoundFileStorageError} {@link KeyNotFoundFileStorageError}
     */
    updateStreamOrFail(stream: FileStream): ITask<void>;

    put(content: FileContent): ITask<boolean>;

    putStream(stream: FileStream): ITask<boolean>;
};
