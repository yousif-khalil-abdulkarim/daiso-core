import { contextToken } from "eridu-tech/execution-context/contracts";
import { router } from "./http_router_initial_config";

type IUser = {
    id: string;
    firstName: string;
    lastName: string;
};

async function loadUser(): Promise<IUser> {
    const res = await fetch("/api/user");
    return res.json();
}

const token = contextToken<IUser>("USER");

router.use(async ({ context, next }) => {
    context.put(token, await loadUser());
    return await next();
});

router.endpoint({
    url: "/profile",
    method: ["GET"],
    handler: async ({ context, json }) => {
        const user = context.getOrFail(token);
        return json(user);
    },
});
