import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  const adminApiProxyTarget =
    env.VITE_ADMIN_API_PROXY_TARGET ?? "http://127.0.0.1:8000";
  const adminPort = Number(env.VITE_ADMIN_PORT ?? "5173");
  if (!Number.isInteger(adminPort) || adminPort < 1 || adminPort > 65535) {
    throw new Error("VITE_ADMIN_PORT must be a valid TCP port");
  }

  return {
    plugins: [react()],
    build: { sourcemap: true },
    server: {
      host: "0.0.0.0",
      port: adminPort,
      strictPort: true,
      allowedHosts: true,
      proxy: {
        "/api": adminApiProxyTarget,
      },
    },
  };
});
