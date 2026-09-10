import { fileStorage } from "./file_storage_initial_config";

const metadata = await fileStorage.create("file.txt").getMetadata();
console.log(metadata);
