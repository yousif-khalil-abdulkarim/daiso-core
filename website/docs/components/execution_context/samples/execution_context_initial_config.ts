import { ExecutionContext } from "eridu-tech/execution-context";
import { AlsExecutionContextAdapter } from "eridu-tech/execution-context/als-execution-context-adapter";

// Create an execution-context instance with an adapter
export const executionContext = new ExecutionContext(new AlsExecutionContextAdapter());
