import { fileStorageResolver } from "./file_storage_resolver_initial_config.js";

await fileStorageResolver.use().create("file.txt").add({ data: "Text file content" });
