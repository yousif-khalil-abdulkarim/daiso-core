import { router } from "./http_router_initial_config";

router.endpoint({
    url: "/posts/:id/comment/:commentId",
    method: ["GET"],
    handler: async ({ req, json }) => {
        const { id, commentId } = req.params();
        return json({ postId: id, commentId });
    },
});
