import { LIFETIME } from "eridu-tech/di/contracts";
import { container } from "./container.js";
import { IDATABASE } from "./generic_token.js";
import { UserProvider } from "./user_provider.js";

// `UserProvider` service requires `IDATABASE` dependency
container.registerFactory({
    token: UserProvider,
    deps: { db: IDATABASE },
    factory: (deps) => new UserProvider(deps.db),
    lifetime: LIFETIME.SINGLETON,
});
