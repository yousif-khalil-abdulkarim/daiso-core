import { enhance } from "eridu-tech/middleware";
import { loggingMiddleware } from "./enhance_greeter";

const obj = {
    add(a: number, b: number) {
        return a + b;
    },
};

enhance(obj, "add", loggingMiddleware());
obj.add(2, 3);
// Logs:
// Calling greet with: [2, 3]
// Result: 5
