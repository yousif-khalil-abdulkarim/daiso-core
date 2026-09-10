import { LIFETIME } from "eridu-tech/di/contracts";
import { container } from "./container.js";
import { Database } from "./database.js";
import { UserProvider } from "./user_provider.js";

container.registerFactory({
    token: Database,
    factory: () => new Database(),
    deps: {},
    lifetime: LIFETIME.SINGLETON,
});

// ✅ Service is registered as `LIFETIME.TRANSIENT`
// and its `db` dependency is `LIFETIME.SINGLETON`
container.registerFactory({
    token: UserProvider,
    factory: ({ db }) => new UserProvider(db),
    deps: { db: Database },
    lifetime: LIFETIME.TRANSIENT,
});

container.init()  // will not throw InvalidGraphDiError
