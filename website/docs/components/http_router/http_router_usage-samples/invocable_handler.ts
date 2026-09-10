import {
    type IHttpHandlerObject,
    type HttpHandlerArgs,
    type IHttpRes,
} from "eridu-tech/http-router/contracts";
import { router } from "./http_router_initial_config.js";

class GreetingHandler implements IHttpHandlerObject {
    constructor(private readonly greeting: string) {}

    invoke(args: HttpHandlerArgs): IHttpRes {
        const { text } = args;
        return text(this.greeting);
    }
}

router.endpoint({
    url: "/greet",
    method: ["GET"],
    handler: new GreetingHandler("Hello from a class handler!"),
});
