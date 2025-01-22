import { describe, expect, test } from "vitest";
import { serdeTestSuite } from "@/serializer/implementations/_shared/test-utilities/_module";
import { SuperJsonSerializer } from "@/serializer/implementations/super-json-serializer/super-json-serializer";

describe("class: SuperJsonSerializer", () => {
    serdeTestSuite({
        createAdapter: () => new SuperJsonSerializer(),
        expect,
        test,
    });
});
