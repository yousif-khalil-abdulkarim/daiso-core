import { withDispatchOnErrorFactory } from "eridu-tech/event-bus/middlewares";
import { EventBus } from "eridu-tech/event-bus";
import { use } from "eridu-tech/middleware";
import { MemoryEventBusAdapter } from "eridu-tech/event-bus/memory-event-bus-adapter";

const eventBus = new EventBus({
    adapter: new MemoryEventBusAdapter(),
});
const withDispatchOnError = withDispatchOnErrorFactory(eventBus);

const createUser = async (userId: string): Promise<string> => {
    // ... create the user
    throw new Error("boom");
};

// Wrap with an error dispatch
const wrappedCreateUser = use(
    createUser,
    withDispatchOnError({
        type: "user.error",
        payload: ({ args, error }) => ({
            userId: args[0],
            error,
        }),
    }),
);

try {
    await wrappedCreateUser("123");
} catch (error) {
    // The "user.error" event is dispatched with the caught error,
    // then the original error is re-thrown
}
