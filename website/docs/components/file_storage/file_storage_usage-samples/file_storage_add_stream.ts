import { fileStorage } from "./file_storage_initial_config";
import { createReadStream } from "node:fs";

const fileStream = createReadStream("./file.txt");

const hasAdded = await fileStorage
    .create("file.txt")
    .addStream({ data: fileStream });
