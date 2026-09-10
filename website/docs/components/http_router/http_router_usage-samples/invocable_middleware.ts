import {
    type IHttpMiddlewareObject,
    type HttpMiddlewareArgs,
    type IHttpRes,
} from "eridu-tech/http-router/contracts";
import { router } from "./http_router_initial_config";

class AuthMiddleware implements IHttpMiddlewareObject {
    constructor(private readonly apiKey: string) {}

    async invoke(args: HttpMiddlewareArgs): Promise<IHttpRes> {
        const { req, res, next } = args;
        const authHeader = req.headers()["authorization"];
        if (authHeader !== `Bearer ${this.apiKey}`) {
            return res.setStatus(401).setBody("Unauthorized");
        }
        return await next();
    }
}

router.use(new AuthMiddleware("sk-1234"));
