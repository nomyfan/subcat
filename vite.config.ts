import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    resolve: {
      alias: {
        subcat: path.resolve(__dirname, "src"),
      },
    },
    server: {
      port: 3000,
    },
    esbuild:
      mode === "development"
        ? undefined
        : {
            drop: ["debugger", "console"],
          },
  };
});
