import { fileStorage } from "./file_storage_initial_config";

await fileStorage.create("source.txt").moveAndReplace("destination.txt");
