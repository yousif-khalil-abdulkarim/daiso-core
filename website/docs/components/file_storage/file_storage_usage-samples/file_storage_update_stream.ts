import { fileStorage } from "./file_storage_initial_config";
import { createReadStream } from "node:fs";

const fileStream = createReadStream("./file.txt");

const hasUpdated = await fileStorage
    .create("file.txt")
    .updateStream({ data: fileStream });
