import { fileStorage } from "./file_storage_initial_config";

const hasUpdated = await fileStorage
    .create("file.txt")
    .update({ data: "TEXT 1" });
