import { FileStorageResolver } from "eridu-tech/file-storage";
import { MemoryFileStorageAdapter } from "eridu-tech/file-storage/memory-file-storage-adapter";
import { FsFileStorageAdapter } from "eridu-tech/file-storage/fs-file-storage-adapter";
import { SignedFileStorageAdapter } from "eridu-tech/file-storage/signed-file-storage-adapter";

export const fileStorageResolver = new FileStorageResolver({
    adapters: {
        memory: new SignedFileStorageAdapter({
            adapter: new MemoryFileStorageAdapter(),
            urlAdapter: {},
        }),
        fs: new SignedFileStorageAdapter({
            adapter: new FsFileStorageAdapter(),
            urlAdapter: {},
        }),
    },
    // You can set an optional default adapter
    defaultAdapter: "memory",
});
