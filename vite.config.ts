import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

// https://vite.dev/config/

export default defineConfig({
  plugins: [
    react({ babel: { plugins: ["babel-plugin-react-compiler"] } }),
    tailwindcss(),
    process.env.ANALYZE ? visualizer({ filename: "./dist/bundle-stats.html", open: false, gzipSize: true }) : null,
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2022",
    cssCodeSplit: true,
    sourcemap: false,
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: {
          "react-core": ["react", "react-dom"],
          "query-router": ["@tanstack/react-query", "@tanstack/react-router"],
          "ui-libs": [
            "lucide-react",
            "sonner",
            "@radix-ui/react-accordion",
            "@radix-ui/react-toggle",
            "@radix-ui/react-slot",
          ],
          crypto: ["jsencrypt"],
        },
      },
    },
  },
  esbuild: {
    drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
  },
});
