import { withPlugin } from "eridu-tech/middleware";
import { MemoryCacheAdapter } from "eridu-tech/cache/memory-cache-adapter";
import { withCacheWriteLock } from "eridu-tech/cache/plugins";
import { LockFactory } from "eridu-tech/lock";
import { MemoryLockAdapter } from "eridu-tech/lock/memory-lock-adapter";

const adapter = new MemoryCacheAdapter();
const lockFactory = new LockFactory({
    adapter: new MemoryLockAdapter(),
});

// Apply the write lock plugin to the adapter
const lockedAdapter = withPlugin(adapter, withCacheWriteLock({ lockFactory }));
