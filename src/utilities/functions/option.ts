/**
 * @internal
 */
export const OPTION = {
    SOME: "some",
    NONE: "none",
} as const;

/**
 * @internal
 */
export type OptionSome<TValue = unknown> = {
    type: (typeof OPTION)["SOME"];
    value: TValue;
};

/**
 * @internal
 */
export type OptionNone = {
    type: (typeof OPTION)["NONE"];
};

/**
 * @internal
 */
export type Option<TValue = unknown> = OptionSome<TValue> | OptionNone;

/**
 * @internal
 */
export function optionSome<TValue = unknown>(
    value: TValue,
): OptionSome<TValue> {
    return {
        type: OPTION.SOME,
        value,
    };
}

/**
 * @internal
 */
export function optionNone(): OptionNone {
    return {
        type: OPTION.NONE,
    };
}
