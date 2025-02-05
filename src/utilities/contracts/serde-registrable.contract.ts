/**
 * @module Utilities
 */

import type { IFlexibleSerde } from "@/serde/contracts/_module";
import type { OneOrMore } from "@/utilities/types";

/**
 * @group Contracts
 */
export type ISerdeRegistrable = {
    registerToSerde(serde: OneOrMore<IFlexibleSerde>): void;
};
