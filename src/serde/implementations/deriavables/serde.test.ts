import { flexibleSerdeTestSuite } from "@/serde/implementations/test-utilities/flexible-serde.test-suite";
import { describe, test, expect } from "vitest";
import { Serde } from "@/serde/implementations/deriavables/serde";
import { SuperJsonSerdeAdapter } from "@/serde/implementations/adapters/_module-exports";

describe("class: Serde", () => {
    flexibleSerdeTestSuite({
        create: () => new Serde(new SuperJsonSerdeAdapter()),
        test,
        expect,
    });
});
