import { fileStorage } from "./file_storage_initial_config.js";

const hasUpdated = await fileStorage.create("file.txt").put({ data: "TEXT 1" });
await fileStorage.create("file.txt").put({ data: "TEXT 2" });
