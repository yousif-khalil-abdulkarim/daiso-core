/**
 * @module FileStorage
 */
import { type IEventListenable } from "@/event-bus/contracts/_module.js";
import { type FileStorageEventMap } from "@/file-storage/contracts/file-storage.events.js";
import { type IFile } from "@/file-storage/contracts/file.contract.js";
import { type ITask } from "@/task/contracts/_module.js";

/**
 * IMPORT_PATH: `"@daiso-tech/core/file-storage/contracts"`
 * @group Contracts
 */
export type IFileListenable = IEventListenable<FileStorageEventMap>;

/**
 * IMPORT_PATH: `"@daiso-tech/core/file-storage/contracts"`
 * @group Contracts
 */
export type IFileProvider = {
    create(key: string): IFile;
};

/**
 * IMPORT_PATH: `"@daiso-tech/core/file-storage/contracts"`
 * @group Contracts
 */
export type IFileStorageBase = IFileProvider & {
    clear(): ITask<void>;

    removeMany(files: Iterable<string | IFile>): ITask<boolean>;
};

/**
 * IMPORT_PATH: `"@daiso-tech/core/file-storage/contracts"`
 * @group Contracts
 */
export type IFileStorage = IFileStorageBase & {
    readonly events: IFileListenable;
};
