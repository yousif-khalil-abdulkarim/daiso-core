import { withPlugin } from "eridu-tech/middleware";
import { MemoryFileStorageAdapter } from "eridu-tech/file-storage/memory-file-storage-adapter";
import { withFileStorageKeyValidator } from "eridu-tech/file-storage/plugins";

const adapter = new MemoryFileStorageAdapter();

// Apply the key validator plugin with a custom validator
const validatedAdapter = withPlugin(
    adapter,
    withFileStorageKeyValidator((key) => {
        if (key.startsWith("temp/")) {
            return "Keys under temp/ are not allowed";
        }
        return null;
    }),
);
