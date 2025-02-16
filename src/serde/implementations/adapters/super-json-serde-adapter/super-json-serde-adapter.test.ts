import { describe, expect, test } from "vitest";
import { flexibleSerdeAdapterTestSuite } from "@/serde/implementations/test-utilities/flexible-serde-adapter.test-suite";
import { SuperJsonSerdeAdapter } from "@/serde/implementations/adapters/super-json-serde-adapter/super-json-serde-adapter";

describe("class: SuperJsonSerdeAdapter", () => {
    flexibleSerdeAdapterTestSuite({
        createAdapter: () => new SuperJsonSerdeAdapter(),
        expect,
        test,
    });
});
