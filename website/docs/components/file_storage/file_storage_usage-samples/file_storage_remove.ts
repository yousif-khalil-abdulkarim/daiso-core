import { fileStorage } from "./file_storage_initial_config.js";

const hasRemoved = await fileStorage.create("file.txt").remove();
console.log(hasRemoved);
