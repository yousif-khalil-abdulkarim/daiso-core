import { TimeSpan } from "eridu-tech/time-span";
import { MemoryFileStorageAdapter } from "eridu-tech/file-storage/memory-file-storage-adapter";
import { SignedFileStorageAdapter } from "eridu-tech/file-storage/signed-file-storage-adapter";
import { FileStorage } from "eridu-tech/file-storage";

export const fileStorage = new FileStorage({
    // You can choose the adapter to use
    adapter: new SignedFileStorageAdapter({
        adapter: new MemoryFileStorageAdapter(),
        urlAdapter: {},
    }),
});
