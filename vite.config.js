
import { readFileSync } from "node:fs";
import { nitro } from "nitro/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

const NOT_PREBUNDLED = new Set([
  "react",
  "react-dom",
  "@base44/vite-plugin",
  "@tanstack/react-start",
  "@tanstack/react-router",
  "@tanstack/react-router-ssr-query",
  "tailwindcss-animate",
]);

const { dependencies } = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8"),
);

const PREBUNDLE = Object.keys(dependencies).filter(
  (name) => !NOT_PREBUNDLED.has(name),
);

export default defineConfig({
   resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  optimizeDeps: { include: PREBUNDLE },
  environments: {
    ssr: {
      optimizeDeps: { include: PREBUNDLE },
      build: {
        sourcemap: true,
        rolldownOptions: {
          output: { sourcemapExcludeSources: true },
        },
      },
    },
  },
  plugins: [
    tanstackStart({ srcDirectory: "src" }),
    nitro(),
    react(),
  ],
});