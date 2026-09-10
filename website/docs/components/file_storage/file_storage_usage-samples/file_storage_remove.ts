import { fileStorage } from "./file_storage_initial_config";

const hasRemoved = await fileStorage.create("file.txt").remove();
console.log(hasRemoved);
