import { describe, expect, test } from "vitest";
import { serdeTestSuite } from "@/serde/implementations/_shared/test-utilities/_module";
import { MongodbSerde } from "@/serde/implementations/mongodb-serde/_module";
import { SuperJsonSerde } from "@/serde/implementations/super-json-serde/_module";

describe("class: MongodbSerde", () => {
    serdeTestSuite({
        createAdapter: () => new MongodbSerde(new SuperJsonSerde()),
        expect,
        test,
    });
});
