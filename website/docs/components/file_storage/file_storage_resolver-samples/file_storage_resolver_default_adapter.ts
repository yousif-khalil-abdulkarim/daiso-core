import { fileStorageResolver } from "./file_storage_resolver_initial_config";

await fileStorageResolver.use().create("file.txt").add({ data: "Text file content" });
