import { fileStorage } from "./file_storage_initial_config";

const content = await fileStorage.create("file.txt").getText();

console.log(content);
