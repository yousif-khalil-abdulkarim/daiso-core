import { LIFETIME } from "eridu-tech/di/contracts";
import { container } from "./container.js";
import { Database } from "./database.js";
import { IDATABASE } from "./generic_token.js";

// `IDATABASE` service requires no dependency
container.registerFactory({
    token: IDATABASE,
    deps: {}, // No dependencies
    factory: (deps) => new Database(),
    lifetime: LIFETIME.SINGLETON,
});
