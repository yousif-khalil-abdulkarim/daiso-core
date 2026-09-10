import { executionContext } from "./execution_context_initial_config";
import { contextToken } from "eridu-tech/execution-context/contracts";

type User = { id: string; name: string };
const userToken = contextToken<User>("user");
const requestIdToken = contextToken<string>("requestId");

executionContext
    .put(userToken, { id: "123", name: "Alice" })
    .put(requestIdToken, "req-456");
