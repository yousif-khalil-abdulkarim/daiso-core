import { MemorySemaphoreAdapter } from "eridu-tech/semaphore/memory-semaphore-adapter";

const adapter = new MemorySemaphoreAdapter();

adapter.acquire({ key: "connections", slotId: "slot-1", limit: 1, ttl: null });
// -> acquires slot on "connections"
