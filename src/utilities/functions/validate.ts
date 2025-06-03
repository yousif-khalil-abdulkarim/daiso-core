import type { StandardSchemaV1 } from "@standard-schema/spec";

export class ValidationError extends Error {
    constructor(issues: ReadonlyArray<StandardSchemaV1.Issue>) {
        const jsonMessage = JSON.stringify(issues, null, 2);
        super(
            `A validation error occured with the following issues:\n${jsonMessage}`,
        );
        this.name = ValidationError.name;
    }
}

/**
 * @throws {ValidationError} {@link ValidationError}
 */
export async function validate<TValue>(
    schema: StandardSchemaV1<TValue, TValue> | undefined,
    value: TValue,
): Promise<void> {
    const result = await schema?.["~standard"].validate(value);
    if (result?.issues) {
        throw new ValidationError(result.issues);
    }
}
