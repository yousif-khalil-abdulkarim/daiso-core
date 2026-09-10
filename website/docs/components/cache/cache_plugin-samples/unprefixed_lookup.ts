import { MemoryCacheAdapter } from "eridu-tech/cache/memory-cache-adapter";

const adapter = new MemoryCacheAdapter();

adapter.get("user:123");
// -> looks up key "user:123"
