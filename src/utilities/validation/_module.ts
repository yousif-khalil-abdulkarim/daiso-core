/**
 * @module Utilities
 */

import { type ZodSchema, type infer as Infer } from "zod";

/**
 * @group Validation
 */
export class ValidationError extends Error {
    constructor(message: string, cause: unknown) {
        super(message, { cause });
        this.name = ValidationError.name;
    }
}

/**
 * @group Validation
 * @throws {ValidationError} {@link ValidationError}
 */
export type Validator<TType> = (value: unknown) => TType;

/**
 * @group Validation
 * @example
 * ```ts
 * import { zodValidator } from "@daiso-tech/core";
 * import { z } from "zod";
 *
 * const validator = zodValidator(z.string().trim());
 *
 * // Will throw error
 * validator(2);
 *
 * const validatedValue = validator(" a ");
 * // Will be "a"
 * ```
 */
export function zodValidator<TSchema extends ZodSchema>(
    schema: TSchema,
): Validator<Infer<TSchema>> {
    return (value) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return schema.parse(value);
        } catch (error: unknown) {
            throw new ValidationError(
                `Validation error occured "${String(error)}"`,
                error,
            );
        }
    };
}
