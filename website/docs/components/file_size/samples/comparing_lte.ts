import { FileSize } from "eridu-tech/file-size";

// Returns true
FileSize.fromBytes(20_000).lte(FileSize.fromBytes(40_000));
