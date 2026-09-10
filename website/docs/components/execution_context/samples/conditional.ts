import { executionContext } from "./execution_context_initial_config.js";
import { contextToken } from "eridu-tech/execution-context/contracts";

const userToken = contextToken<{ id: string; name: string }>("user");

executionContext.when(true, (ctx) =>
    ctx.put(userToken, { id: "conditional", name: "Bob" }),
);
