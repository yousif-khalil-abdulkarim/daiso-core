import type { Validator } from "@/utilities/_module";
import type { IStorageAdapter } from "@/storage/contracts/_module";

/**
 * @internal
 */
export class WithValidationStorageAdapter<TType>
    implements IStorageAdapter<TType>
{
    constructor(
        private readonly storageAdapter: IStorageAdapter<TType>,
        private readonly validator: Validator<TType>,
    ) {}

    private validateOutput<TKeys extends string>(
        values: Record<TKeys, TType | null>,
    ): Record<TKeys, TType | null> {
        return Object.fromEntries(
            Object.entries(values).map(([key, value]) => {
                if (value === null) {
                    return [key, value];
                }
                return [key, this.validator(value)];
            }),
        ) as Record<TKeys, TType>;
    }

    private validateInput<TKeys extends string>(
        values: Record<TKeys, TType>,
    ): Record<TKeys, TType> {
        return Object.fromEntries(
            Object.entries(values).map(([key, value]) => [
                key,
                this.validator(value),
            ]),
        ) as Record<TKeys, TType>;
    }

    async getMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, TType | null>> {
        return this.validateOutput(await this.storageAdapter.getMany(keys));
    }

    async addMany<TKeys extends string>(
        values: Record<TKeys, TType>,
    ): Promise<Record<TKeys, boolean>> {
        return await this.storageAdapter.addMany(this.validateInput(values));
    }

    async updateMany<TKeys extends string>(
        values: Record<TKeys, TType>,
    ): Promise<Record<TKeys, boolean>> {
        return await this.storageAdapter.updateMany(this.validateInput(values));
    }

    async putMany<TKeys extends string>(
        values: Record<TKeys, TType>,
    ): Promise<Record<TKeys, boolean>> {
        return await this.storageAdapter.putMany(this.validateInput(values));
    }

    async removeMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>> {
        return await this.storageAdapter.removeMany(keys);
    }

    async increment(key: string, value: number): Promise<boolean> {
        return await this.storageAdapter.increment(
            key,
            this.validator(value) as number,
        );
    }

    async clear(prefix: string): Promise<void> {
        await this.storageAdapter.clear(prefix);
    }
}
