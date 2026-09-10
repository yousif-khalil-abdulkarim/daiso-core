import { MemoryFileStorageAdapter } from "eridu-tech/file-storage/memory-file-storage-adapter";

const adapter = new MemoryFileStorageAdapter();

adapter.getBytes("uploads/report.pdf");
// -> retrieves "uploads/report.pdf"
