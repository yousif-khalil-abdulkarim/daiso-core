import { fileStorage } from "./file_storage_initial_config";

const missing = await fileStorage.create("file.txt").missing();
