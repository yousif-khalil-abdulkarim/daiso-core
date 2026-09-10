import { fileStorage } from "./file_storage_initial_config.js";

const missing = await fileStorage.create("file.txt").missing();
