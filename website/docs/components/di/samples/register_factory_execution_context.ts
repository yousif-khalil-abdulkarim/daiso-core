import { LIFETIME } from "eridu-tech/di/contracts";
import { container } from "./container.js";
import { REQUEST_ID } from "./request_id.js";

class RequestService {
    constructor(private requestId: string) {
        /* ... */
    }
}

container.registerFactory({
    token: RequestService,
    deps: {},
    factory: (deps, executionContext) => {
        // Read a contextual value propagated through the resolution chain
        const requestId = executionContext.get(REQUEST_ID) ?? "unknown";
        return new RequestService(requestId);
    },
    lifetime: LIFETIME.TRANSIENT,
});
