import type { RestrictedPaths, PathValue } from "eridu-tech/config-accessor/contracts";
import type { Get } from "type-fest";
import type { OneOrArray } from "eridu-tech/utilities";

type FieldConfigValue = string | number | boolean;

type BaseConfig = Partial<
    Record<
        string,
        OneOrArray<FieldConfigValue | Partial<Record<string, FieldConfigValue>>>
    >
>;

type IConfigAccessor<TConfig extends BaseConfig = BaseConfig> = {
    get<TPath extends RestrictedPaths<TConfig>>(
        path: TPath,
    ): PathValue<TConfig, TPath>;

    getOr<TPath extends RestrictedPaths<TConfig>>(
        path: TPath,
        defaultValue: NonNullable<Get<TConfig, TPath>>,
    ): NonNullable<PathValue<TConfig, TPath>>;
};
