import { fileStorage } from "./file_storage_initial_config.js";

await fileStorage.create("source.txt").copy("destination.txt");
