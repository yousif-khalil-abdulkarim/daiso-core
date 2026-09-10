import { fileStorage } from "./file_storage_initial_config.js";

const hasAdded = await fileStorage.create("file.txt").add({ data: "CONTENT" });
