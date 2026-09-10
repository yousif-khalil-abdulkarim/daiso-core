import { fileStorage } from "./file_storage_initial_config.js";

const exists = await fileStorage.create("file.txt").exists();
