import { fileStorageResolver } from "./file_storage_resolver_initial_config.js";

await fileStorageResolver
    .setDefaultCacheControl("public, max-age=31536000")
    .use("fs")
    .create("file.txt")
    .add({ data: "Text file content" });
