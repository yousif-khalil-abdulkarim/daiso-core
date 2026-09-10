import { enhance } from "eridu-tech/middleware";
import { loggingMiddleware } from "./enhance_greeter";

class MathUtils {
    static multiply(a: number, b: number) {
        return a * b;
    }
}

enhance(MathUtils, "multiply", loggingMiddleware());
MathUtils.multiply(4, 5);
// Logs:
// Calling greet with: [4, 5]
// Result: 20
