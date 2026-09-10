import { rateLimiter } from "./rate_limiter_create";
import { RATE_LIMITER_STATE } from "eridu-tech/rate-limiter/contracts";

const state = await rateLimiter.getState();

if (state.type === RATE_LIMITER_STATE.EXPIRED) {
    console.log("The rate limiter key doesnt exists");
}
if (state.type === RATE_LIMITER_STATE.ALLOWED) {
    console.log("The rate limiter is allowing calls");
}
if (state.type === RATE_LIMITER_STATE.BLOCKED) {
    console.log("The rate limiter is blocking calls");
}
