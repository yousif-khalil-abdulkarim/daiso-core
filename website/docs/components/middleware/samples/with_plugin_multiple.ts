import { withPlugin } from "eridu-tech/middleware";
import type { PluginFn } from "eridu-tech/middleware/contracts";
import { loggingPlugin, UserService } from "./with_plugin_class.js";

const monitoringPlugin: PluginFn<UserService> = (service, enhance) => {
    // Monitor methods...
};

const validationPlugin: PluginFn<UserService> = (service, enhance) => {
    // Validate methods...
};

const service = new UserService();
const enhancedService = withPlugin(service, [
    loggingPlugin,
    monitoringPlugin,
    validationPlugin,
]);
