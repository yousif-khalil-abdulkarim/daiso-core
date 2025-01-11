/**
 * @module Storage
 */

import { TypeStorageError } from "@/storage/contracts/storage.errors";
import { type IStorageAdapter } from "@/storage/contracts/storage-adapter.contract";

/**
 * @group Adapters
 */
export class MemoryStorageAdapter<TType> implements IStorageAdapter<TType> {
    constructor(private readonly map: Map<string, TType> = new Map()) {}

    // eslint-disable-next-line @typescript-eslint/require-await
    async get(key: string): Promise<TType | null> {
        return this.map.get(key) ?? null;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async add(key: string, value: TType): Promise<boolean> {
        const hasNotkey = !this.map.has(key);
        if (hasNotkey) {
            this.map.set(key, value);
        }
        return hasNotkey;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async update(key: string, value: TType): Promise<boolean> {
        const haskey = this.map.has(key);
        if (haskey) {
            this.map.set(key, value);
        }
        return haskey;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async put(key: string, value: TType): Promise<boolean> {
        const haskey = this.map.has(key);
        this.map.set(key, value);
        return haskey;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async remove(key: string): Promise<boolean> {
        return this.map.delete(key);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async increment(key: string, value: number): Promise<boolean> {
        const mapValue = this.map.get(key);
        if (mapValue === undefined) {
            return false;
        }
        if (typeof mapValue !== "number") {
            throw new TypeStorageError("!!__message__!!");
        }
        this.map.set(key, (mapValue + value) as TType);
        return true;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async clear(prefix: string): Promise<void> {
        if (prefix === "") {
            this.map.clear();
        }
        for (const [key] of this.map) {
            if (key.startsWith(prefix)) {
                this.map.delete(key);
            }
        }
    }
}
