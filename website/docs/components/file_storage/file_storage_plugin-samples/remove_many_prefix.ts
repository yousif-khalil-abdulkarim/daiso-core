import { withPlugin } from "eridu-tech/middleware";
import { MemoryFileStorageAdapter } from "eridu-tech/file-storage/memory-file-storage-adapter";
import { withFileStoragePrefix } from "eridu-tech/file-storage/plugins";

const adapter = new MemoryFileStorageAdapter();

// Apply the prefix plugin to the adapter
const prefixedAdapter = withPlugin(adapter, withFileStoragePrefix("tenant-42/"));

prefixedAdapter.removeMany(["a.pdf", "b.pdf"]);
// -> prefixedAdapter.removeMany(["tenant-42/a.pdf", "tenant-42/b.pdf"])
