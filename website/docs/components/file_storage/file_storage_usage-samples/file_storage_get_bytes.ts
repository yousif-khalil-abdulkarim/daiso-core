import { fileStorage } from "./file_storage_initial_config.js";

const content = await fileStorage.create("file.txt").getBytes();

console.log(content);
