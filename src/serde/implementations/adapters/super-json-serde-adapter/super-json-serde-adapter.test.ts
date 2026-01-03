import { describe, expect, test } from "vitest";

import { SuperJsonSerdeAdapter } from "@/serde/implementations/adapters/_module.js";
import { flexibleSerdeAdapterTestSuite } from "@/serde/implementations/test-utilities/_module.js";

describe("class: SuperJsonSerdeAdapter", () => {
    flexibleSerdeAdapterTestSuite({
        createAdapter: () => new SuperJsonSerdeAdapter(),
        expect,
        test,
    });
});
