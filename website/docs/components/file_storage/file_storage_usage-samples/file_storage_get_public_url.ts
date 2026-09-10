import { fileStorage } from "./file_storage_initial_config.js";

const file = fileStorage.create("source.txt");
await file.add({ data: "CONTENT" });

const publicUrl = await file.getPublicUrl();

console.log(publicUrl);
