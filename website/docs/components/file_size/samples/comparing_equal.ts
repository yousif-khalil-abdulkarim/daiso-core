import { FileSize } from "eridu-tech/file-size";

// Returns false
FileSize.fromBytes(20_000).equals(FileSize.fromBytes(40_000));
