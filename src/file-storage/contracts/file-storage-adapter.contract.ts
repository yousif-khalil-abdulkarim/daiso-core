/**
 * @module FileStorage
 */

/**
 * IMPORT_PATH: `"@daiso-tech/core/file-storage/contracts"`
 * @group Contracts
 */
export type BaseMetadata = Partial<Record<string, string>>;

/**
 * IMPORT_PATH: `"@daiso-tech/core/file-storage/contracts"`
 * @group Contracts
 */
export type FileAdapterMetadata = {
    etag: string;
    contentType: string;
    fileSizeInBytes: number;
    createdAt: Date;
    updatedAt: Date | null;
};

/**
 * IMPORT_PATH: `"@daiso-tech/core/file-storage/contracts"`
 * @group Contracts
 */
export type FileAdapterStream = AsyncIterable<Uint8Array>;

/**
 * IMPORT_PATH: `"@daiso-tech/core/file-storage/contracts"`
 * @group Contracts
 */
export type IFileStorageAdapter = {
    exists(key: string): Promise<boolean>;

    getStream(key: string): Promise<FileAdapterStream | null>;

    getBytes(key: string): Promise<Uint8Array | null>;

    getMetaData(key: string): Promise<FileAdapterMetadata | null>;

    add(
        key: string,
        content: Uint8Array,
        metadata?: FileAdapterMetadata,
    ): Promise<boolean>;

    addStream(
        key: string,
        stream: FileAdapterStream,
        metadata?: FileAdapterMetadata,
    ): Promise<boolean>;

    update(key: string, content: Uint8Array): Promise<boolean>;

    updateStream(key: string, stream: FileAdapterStream): Promise<boolean>;

    put(
        key: string,
        content: Uint8Array,
        metadata?: FileAdapterMetadata,
    ): Promise<boolean>;

    putStream(
        key: string,
        stream: FileAdapterStream,
        metadata?: FileAdapterMetadata,
    ): Promise<boolean>;

    copy(source: string, destination: string): Promise<boolean>;

    move(source: string, destination: string): Promise<boolean>;

    removeMany(key: Array<string>): Promise<boolean>;

    removeByPrefix(prefix: string): Promise<boolean>;
};
