import { fileStorage } from "./file_storage_initial_config";

const exists = await fileStorage.create("file.txt").exists();
