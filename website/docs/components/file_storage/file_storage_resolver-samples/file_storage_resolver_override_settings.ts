import { fileStorageResolver } from "./file_storage_resolver_initial_config";

await fileStorageResolver
    .setDefaultCacheControl("public, max-age=31536000")
    .use("fs")
    .create("file.txt")
    .add({ data: "Text file content" });
