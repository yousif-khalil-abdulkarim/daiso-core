import { timeout } from "eridu-tech/resilience";
import { use } from "eridu-tech/middleware";
import { TimeSpan } from "eridu-tech/time-span";

async function fetchData(): Promise<Response> {
    const response = await fetch("ENDPOINT");
    return response;
}
const fn = use(fetchData, [
    timeout({
        waitTime: TimeSpan.fromSeconds(2),
        onTimeout: (data) => console.log(data),
    }),
]);

await fn();
