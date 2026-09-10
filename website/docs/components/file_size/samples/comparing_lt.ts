import { FileSize } from "eridu-tech/file-size";

// Returns true
FileSize.fromBytes(20_000).lt(FileSize.fromBytes(40_000));
