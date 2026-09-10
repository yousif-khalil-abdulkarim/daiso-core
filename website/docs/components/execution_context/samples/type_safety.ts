import { executionContext } from "./execution_context_initial_config.js";
import { contextToken } from "eridu-tech/execution-context/contracts";

const userToken = contextToken<{ id: string; name: string }>("user");
executionContext.put(userToken, { id: "123", name: "Alice" });
// TypeScript will error if you try to put a value of the wrong type.
