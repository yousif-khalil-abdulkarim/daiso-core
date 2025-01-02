/**
 * @module Collection
 */

export class AsyncErrorHandlerIterable<TInput>
    implements AsyncIterable<TInput>
{
    constructor(
        private readonly iterable: AsyncIterable<TInput>,
        private readonly errorPasser: (error: unknown) => boolean,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TInput> {
        const iterator = this.iterable[Symbol.asyncIterator]();
        try {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            while (true) {
                const result = await iterator.next();
                if (result.done) {
                    return;
                }
                yield result.value;
            }
        } catch (error: unknown) {
            if (this.errorPasser(error)) {
                return;
            }
            throw error;
        }
    }
}
