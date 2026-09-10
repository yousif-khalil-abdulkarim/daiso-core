import { SmartRouter } from "hono/router/smart-router";
import { RegExpRouter } from "hono/router/reg-exp-router";
import { TrieRouter } from "hono/router/trie-router";

new SmartRouter({
    routers: [new RegExpRouter(), new TrieRouter()],
});
