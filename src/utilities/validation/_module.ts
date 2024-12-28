import { type ZodSchema, type infer as Infer } from "zod";

/**
 * @module Validation
 */

export class ValidationError extends Error {
    constructor(message: string, cause: unknown) {
        super(message, { cause });
        this.name = ValidationError.name;
    }
}

/**
 * @throws {ValidationError} {@link ValidationError}
 */
export type Validator<TType> = (value: unknown) => TType;

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
