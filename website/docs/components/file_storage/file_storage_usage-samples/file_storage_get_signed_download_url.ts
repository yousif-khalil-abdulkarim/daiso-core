import { TimeSpan } from "eridu-tech/time-span";
import { fileStorage } from "./file_storage_initial_config";

const file = fileStorage.create("source.txt");
await file.add({
    data: "CONTENT",
});

const donwloadUrl = await file.getSignedDownloadUrl({
    // All settings are optional
    ttl: TimeSpan.fromMinutes(10),
    // The content type will be infered from the filename by default
    contentType: "text/plain",
    contentDisposition: "inline",
});
console.log(donwloadUrl);
