import { withPlugin } from "eridu-tech/middleware";
import { MemoryFileStorageAdapter } from "eridu-tech/file-storage/memory-file-storage-adapter";
import { withFileStorageLock } from "eridu-tech/file-storage/plugins";
import { LockFactory } from "eridu-tech/lock";
import { MemoryLockAdapter } from "eridu-tech/lock/memory-lock-adapter";

const adapter = new MemoryFileStorageAdapter();
const lockFactory = new LockFactory({
    adapter: new MemoryLockAdapter(),
});

// Apply the lock plugin to the adapter
const lockedAdapter = withPlugin(adapter, withFileStorageLock({ lockFactory }));
