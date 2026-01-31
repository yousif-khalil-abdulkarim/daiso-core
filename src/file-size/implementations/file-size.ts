/**
 * @module FileSize
 */

import { type IFileSize, TO_BYTES } from "@/file-size/contracts/_module.js";
import { type ISerializable } from "@/serde/contracts/_module.js";
import { type IComparable } from "@/utilities/_module.js";

/**
 * IMPORT_PATH: `"@daiso-tech/core/file-size"`
 * @group Implementations
 */
export type SerializedFileSize = {
    version: "1";
    fileSizeInBytes: number;
};

/**
 * IMPORT_PATH: `"@daiso-tech/core/file-size"`
 * @group Implementations
 */
export class FileSize
    implements
        IFileSize,
        ISerializable<SerializedFileSize>,
        IComparable<IFileSize>
{
    static deserialize(serializedValue: SerializedFileSize): FileSize {
        return new FileSize(serializedValue.fileSizeInBytes);
    }

    static fromBytes(bytes: number): FileSize {
        throw new Error("Method not implemented.");
    }

    static fromKiloBytes(kiloBytes: number): FileSize {
        throw new Error("Method not implemented.");
    }

    static fromMegaBytes(megaBytes: number): FileSize {
        throw new Error("Method not implemented.");
    }

    static fromGigaBytes(gigaBytes: number): FileSize {
        throw new Error("Method not implemented.");
    }

    static fromTeraBytes(teraBytes: number): FileSize {
        throw new Error("Method not implemented.");
    }

    static fromPetaBytes(petaBytes: number): FileSize {
        throw new Error("Method not implemented.");
    }

    private constructor(private readonly fileSizeInBytes: number) {}

    [TO_BYTES](): number {
        return this.fileSizeInBytes;
    }

    equals(value: IFileSize): boolean {
        return value[TO_BYTES]() === this.toBytes();
    }

    gt(value: IFileSize): boolean {
        return value[TO_BYTES]() < this.toBytes();
    }

    gte(value: IFileSize): boolean {
        return value[TO_BYTES]() <= this.toBytes();
    }

    lt(value: IFileSize): boolean {
        return value[TO_BYTES]() > this.toBytes();
    }

    lte(value: IFileSize): boolean {
        return value[TO_BYTES]() >= this.toBytes();
    }

    serialize(): SerializedFileSize {
        return {
            version: "1",
            fileSizeInBytes: this.fileSizeInBytes,
        };
    }

    toBytes(): number {
        return this[TO_BYTES]();
    }

    toKiloBytes(): number {
        throw new Error("Method not implemented.");
    }

    toMegaBytes(): number {
        throw new Error("Method not implemented.");
    }

    toGigaBytes(): number {
        throw new Error("Method not implemented.");
    }

    toTeraBytes(): number {
        throw new Error("Method not implemented.");
    }

    toPetaBytes(): number {
        throw new Error("Method not implemented.");
    }
}
