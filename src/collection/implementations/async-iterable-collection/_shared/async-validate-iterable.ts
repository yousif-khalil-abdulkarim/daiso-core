import type { StandardSchemaV1 } from "@standard-schema/spec";

export class AsyncValidateIterable<TInput, TOutput>
    implements AsyncIterable<TOutput>
{
    constructor(
        private readonly iterable: AsyncIterable<TInput>,
        private readonly schema: StandardSchemaV1<TInput, TOutput>,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TOutput> {
        for await (const item of this.iterable) {
            const result = await this.schema["~standard"].validate(item);

            if (!result.issues) {
                yield result.value;
            }
        }
    }
}
