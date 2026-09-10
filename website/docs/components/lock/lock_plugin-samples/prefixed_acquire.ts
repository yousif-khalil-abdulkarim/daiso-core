import { withPlugin } from "eridu-tech/middleware";
import { MemoryLockAdapter } from "eridu-tech/lock/memory-lock-adapter";
import { withLockPrefix } from "eridu-tech/lock/plugins";

const adapter = new MemoryLockAdapter();

// Apply the prefix plugin to the adapter
const prefixedAdapter = withPlugin(adapter, withLockPrefix("tenant-42:"));

const ttl = new Date(Date.now() + 60_000);

prefixedAdapter.acquire("resource:42", "lock-id", ttl);
// -> acquires lock on "tenant-42:resource:42"
