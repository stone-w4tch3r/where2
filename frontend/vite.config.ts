import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "manifest.json",
          dest: ".",
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      "@/": `${path.resolve(__dirname, "src")}/`,
    },
  },
  define: {
    "process.env": {},
  },
  build: {
    rollupOptions: {
      input: {
        background: path.resolve(__dirname, "src/background.ts"),
        content: path.resolve(__dirname, "src/content.tsx"),
        popup: path.resolve(__dirname, "src/popup.ts"),
        index: path.resolve(__dirname, "index.html"),
      },
      output: {
        entryFileNames: (chunk) => {
          return chunk.name === "index"
            ? "assets/[name]-[hash].js"
            : "[name].js";
        },
      },
    },
    emptyOutDir: process.env.WATCH !== "true", // Don't empty output dir in watch mode
    sourcemap: true,
    watch:
      process.env.WATCH === "true"
        ? {
            include: "src/**",
            exclude: "node_modules/**",
          }
        : null,
  },
  server: {
    port: 5173,
    hmr: {
      port: 5173,
    },
  },
});
