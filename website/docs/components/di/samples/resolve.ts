import { container } from "./container.js";
import { Logger } from "./logger.js";

container.registerValue({
    token: Logger,
    value: new Logger(),
});

await container.init();

const logger = await container.resolve(Logger);
if (logger) {
    logger.log("Logger is available");
}
