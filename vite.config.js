import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
export default defineConfig(function (_a) {
    var command = _a.command;
    return ({
        base: command === "build" ? "/wardrobe-catalog/" : "/",
        plugins: [react()],
        resolve: {
            alias: {
                "@": fileURLToPath(new URL("./src", import.meta.url))
            }
        }
    });
});
