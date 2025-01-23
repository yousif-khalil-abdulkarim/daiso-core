import { describe, expect, test } from "vitest";
import { flexibleSerdeTestSuite } from "@/serde/implementations/_shared/test-utilities/_module";
import { SuperJsonSerde } from "@/serde/implementations/super-json-serde/super-json-serde";

describe("class: SuperJsonSerde", () => {
    flexibleSerdeTestSuite({
        createAdapter: () => new SuperJsonSerde(),
        expect,
        test,
    });
});
