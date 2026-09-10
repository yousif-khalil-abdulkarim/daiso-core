import { FileSize } from "eridu-tech/file-size";

// Returns false
FileSize.fromBytes(20_000).gt(FileSize.fromBytes(40_000));
