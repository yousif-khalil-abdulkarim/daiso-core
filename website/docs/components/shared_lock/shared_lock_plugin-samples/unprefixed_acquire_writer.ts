import { MemorySharedLockAdapter } from "eridu-tech/shared-lock/memory-shared-lock-adapter";

const adapter = new MemorySharedLockAdapter();

const ttl = new Date(Date.now() + 60_000);

adapter.acquireWriter("doc:42", "writer-1", ttl);
// -> acquires writer lock on "doc:42"
