import { container } from "./container.js";
import { Logger } from "./logger.js";

container.registerValue({
    token: Logger,
    value: new Logger(),
});

await container.init();

if (await container.has(Logger)) {
    console.log("Logger is resolvable");
}
