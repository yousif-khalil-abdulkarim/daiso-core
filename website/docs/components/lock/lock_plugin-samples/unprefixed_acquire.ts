import { MemoryLockAdapter } from "eridu-tech/lock/memory-lock-adapter";

const adapter = new MemoryLockAdapter();

const ttl = new Date(Date.now() + 60_000);

adapter.acquire("resource:42", "lock-id", ttl);
// -> acquires lock on "resource:42"
