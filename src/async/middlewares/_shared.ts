/**
 * @module Async
 */
import { type Invokable } from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type ErrorPolicy = Invokable<[error: unknown], boolean>;
