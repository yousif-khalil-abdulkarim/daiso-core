/**
 * @module EventBus
 */

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/contracts"```
 * @group Contracts
 */
export abstract class MessageBase<
    TFields extends Record<string, unknown> = Record<string, unknown>,
> {
    constructor(readonly fields: TFields) {}
}
