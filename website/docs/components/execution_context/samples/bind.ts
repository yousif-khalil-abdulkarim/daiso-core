import { executionContext } from "./execution_context_initial_config.js";
import { contextToken } from "eridu-tech/execution-context/contracts";

type User = { id: string; name: string };
const userToken = contextToken<User>("user");
const requestIdToken = contextToken<string>("requestId");

executionContext.run(() => {
    executionContext.put(userToken, { id: "123", name: "Alice" });
    executionContext.put(requestIdToken, "req-456");

    const logData = executionContext.bind((msg: string): void => {
        // Access context values later in the call chain
        const user = executionContext.get(userToken); // { id: "123", name: "Alice" }
        const reqId = executionContext.get(requestIdToken); // "req-456"
        console.log("message:", msg);
        console.log("user:", user);
        console.log("reqId:", reqId);
    });

    logData("hello");
});
