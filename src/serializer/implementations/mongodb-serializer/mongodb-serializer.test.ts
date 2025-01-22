import { describe, expect, test } from "vitest";
import { serdeTestSuite } from "@/serializer/implementations/_shared/test-utilities/_module";
import { MongodbSerializer } from "@/serializer/implementations/mongodb-serializer/_module";
import { SuperJsonSerializer } from "@/serializer/implementations/super-json-serializer/_module";

describe("class: MongodbSerializer", () => {
    serdeTestSuite({
        createAdapter: () => new MongodbSerializer(new SuperJsonSerializer()),
        expect,
        test,
    });
});
