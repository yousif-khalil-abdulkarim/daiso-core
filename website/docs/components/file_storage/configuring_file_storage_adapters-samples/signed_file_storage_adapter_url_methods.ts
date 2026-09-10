import { SignedFileStorageAdapter } from "eridu-tech/file-storage/signed-file-storage-adapter";
import { MemoryFileStorageAdapter } from "eridu-tech/file-storage/memory-file-storage-adapter";
import type {
    FileAdapterSignedDownloadUrlSettings,
    FileAdapterSignedUploadUrlSettings,
} from "eridu-tech/file-storage/contracts";

// The following helpers generate the signed URLs for your storage backend.
// Implement them using your storage provider SDK (e.g. AWS S3 presigned URLs).
async function generateSignedDownloadUrl(
    key: string,
    settings: FileAdapterSignedDownloadUrlSettings,
): Promise<string | null> {
    // ... generate the signed download URL
    return null;
}

async function generateSignedUploadUrl(
    key: string,
    settings: FileAdapterSignedUploadUrlSettings,
): Promise<string> {
    // ... generate the signed upload URL
    return "";
}

const signedFileStorageAdapter = new SignedFileStorageAdapter({
    adapter: new MemoryFileStorageAdapter(),
    urlAdapter: {
        async getPublicUrl(key: string): Promise<string | null> {
            return `https://cdn.example.com/${key}`;
        },
        async getSignedDownloadUrl(
            key: string,
            settings: FileAdapterSignedDownloadUrlSettings,
        ): Promise<string | null> {
            return generateSignedDownloadUrl(key, settings);
        },
        async getSignedUploadUrl(
            key: string,
            settings: FileAdapterSignedUploadUrlSettings,
        ): Promise<string> {
            return generateSignedUploadUrl(key, settings);
        },
    },
});
