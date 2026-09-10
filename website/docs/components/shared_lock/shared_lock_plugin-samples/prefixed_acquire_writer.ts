import { withPlugin } from "eridu-tech/middleware";
import { MemorySharedLockAdapter } from "eridu-tech/shared-lock/memory-shared-lock-adapter";
import { withSharedLockPrefix } from "eridu-tech/shared-lock/plugins";

const adapter = new MemorySharedLockAdapter();

// Apply the prefix plugin to the adapter
const prefixedAdapter = withPlugin(adapter, withSharedLockPrefix("tenant-42:"));

const ttl = new Date(Date.now() + 60_000);

prefixedAdapter.acquireWriter("doc:42", "writer-1", ttl);
// -> acquires writer lock on "tenant-42:doc:42"
