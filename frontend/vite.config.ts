import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The FastAPI orchestrator listens on 127.0.0.1:8000 during local development.
// The frontend always calls `/api/...`; the proxy strips the prefix so FastAPI
// receives the paths it actually registers (e.g. `/api/health` -> `/health`).
const BACKEND_ORIGIN = "http://127.0.0.1:8000";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: BACKEND_ORIGIN,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
