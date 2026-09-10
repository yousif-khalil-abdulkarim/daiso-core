import { fileStorage } from "./file_storage_initial_config";

const file = fileStorage.create("file.txt");

// Will return the file name
console.log(file.key);
