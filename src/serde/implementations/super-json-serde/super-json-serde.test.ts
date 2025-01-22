import { describe, expect, test } from "vitest";
import { serdeTestSuite } from "@/serde/implementations/_shared/test-utilities/_module";
import { SuperJsonSerde } from "@/serde/implementations/super-json-serde/super-json-serde";

describe("class: SuperJsonSerde", () => {
    serdeTestSuite({
        createAdapter: () => new SuperJsonSerde(),
        expect,
        test,
    });
});
