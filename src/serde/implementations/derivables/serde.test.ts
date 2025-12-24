import { describe, test, expect } from "vitest";
import { Serde } from "@/serde/implementations/derivables/serde.js";
import { flexibleSerdeTestSuite } from "@/serde/implementations/test-utilities/_module.js";
import { SuperJsonSerdeAdapter } from "@/serde/implementations/adapters/_module.js";

describe("class: Serde", () => {
    flexibleSerdeTestSuite({
        createSerde: () => new Serde(new SuperJsonSerdeAdapter()),
        test,
        expect,
    });
});
