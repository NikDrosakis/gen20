// vite.config.js (κοινό για όλα τα moon)
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const host = env.MOON_HOST;   // π.χ. gen20.net, από το prebuild/.env

  return {
    plugins: [react({ jsxRuntime: "automatic" })],
    esbuild: { jsxInject: `import React from "react"` },
    resolve: {
      alias: {
        "@":      path.resolve(process.cwd(), "src"),
        "@cubos": path.resolve(process.cwd(), "src/cubos")
      },
    },
    server: { fs: { allow: ["/var/www/gs/data", "."] } },
  };
});