import { fileStorage } from "./file_storage_initial_config.js";

const metadata = await fileStorage.create("file.txt").getMetadata();
console.log(metadata);
