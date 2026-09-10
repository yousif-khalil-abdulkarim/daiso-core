import { withPlugin } from "eridu-tech/middleware";
import { MemoryCacheAdapter } from "eridu-tech/cache/memory-cache-adapter";
import { withCachePrefix } from "eridu-tech/cache/plugins";

const adapter = new MemoryCacheAdapter();

// Apply the prefix plugin to the adapter
const prefixedAdapter = withPlugin(adapter, withCachePrefix("tenant-42:"));

prefixedAdapter.get("user:123");
// -> looks up key "tenant-42:user:123"
