/* eslint-disable @typescript-eslint/require-await */
import {
    CacheError,
    type InserItem,
    UnexpectedCacheError,
} from "@/contracts/cache/_shared";
import { ICacheAdapter } from "@/contracts/cache/cache-adapter.contract";

export type MemoryCacheAdapterSettings = {
    namespace: string;
};
export class MemoryCacheAdapter<TType> implements ICacheAdapter<TType> {
    private setTimeoutIds: Map<string, ReturnType<typeof setTimeout>> =
        new Map();

    constructor(
        private readonly map: Map<string, TType>,
        private readonly settings: MemoryCacheAdapterSettings,
    ) {}

    private withNamespace(key: string): string {
        return `${this.settings.namespace}${key}`;
    }

    private isNamespaceKey(rawKey: string): boolean {
        return rawKey.startsWith(this.settings.namespace);
    }

    async getMany<TValues extends TType, TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, TValues | null>> {
        try {
            const result = {} as Record<TKeys, TValues | null>;
            for (const key of keys) {
                result[key] = (this.map.get(this.withNamespace(key)) ??
                    null) as TValues;
            }
            return result;
        } catch (error: unknown) {
            if (error instanceof CacheError) {
                throw error;
            }
            throw new UnexpectedCacheError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async insertMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, Required<InserItem<TValues>>>,
    ): Promise<Record<TKeys, boolean>> {
        try {
            const result = {} as Record<TKeys, boolean>;
            for (const key in values) {
                if (this.map.has(this.withNamespace(key))) {
                    result[key] = false;
                    continue;
                }
                const { value, ttlInMs } = values[key];
                this.map.set(this.withNamespace(key), value);
                result[key] = true;
                if (ttlInMs == null) {
                    continue;
                }
                const setTimeoutId = setTimeout(() => {
                    this.map.delete(this.withNamespace(key));
                    this.setTimeoutIds.delete(this.withNamespace(key));
                }, ttlInMs);
                this.setTimeoutIds.set(this.withNamespace(key), setTimeoutId);
            }
            return result;
        } catch (error: unknown) {
            if (error instanceof CacheError) {
                throw error;
            }
            throw new UnexpectedCacheError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async updateMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, TValues>,
    ): Promise<Record<TKeys, boolean>> {
        try {
            const result = {} as Record<TKeys, boolean>;
            for (const key in values) {
                const hasKey = this.map.has(this.withNamespace(key));
                if (!hasKey) {
                    continue;
                }
                const value = values[key];
                result[key] = hasKey;
                this.map.set(this.withNamespace(key), value);
            }
            return result;
        } catch (error: unknown) {
            if (error instanceof CacheError) {
                throw error;
            }
            throw new UnexpectedCacheError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async removeMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>> {
        try {
            const result = {} as Record<TKeys, boolean>;
            for (const key of keys) {
                result[key] = this.map.delete(this.withNamespace(key));

                const setTimeoutId = this.setTimeoutIds.get(key);
                clearTimeout(setTimeoutId);
                this.setTimeoutIds.delete(this.withNamespace(key));
            }
            return result;
        } catch (error: unknown) {
            if (error instanceof CacheError) {
                throw error;
            }
            throw new UnexpectedCacheError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async clear(): Promise<void> {
        try {
            for (const key of this.map.keys()) {
                if (this.isNamespaceKey(key)) {
                    this.map.delete(key);
                }
            }
        } catch (error: unknown) {
            if (error instanceof CacheError) {
                throw error;
            }
            throw new UnexpectedCacheError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }
}
