import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    visualizer({ filename: "./dist/stats.html", open: false }),
  ],
  server: {
    port: 5173,
  },
  build: {
    // Increase warning threshold slightly and add deterministic per-package chunking
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id || !id.includes("node_modules")) return;
          try {
            const parts = id.split("node_modules/")[1].split("/");
            let pkg = parts[0];
            if (pkg.startsWith("@") && parts.length > 1)
              pkg = `${pkg}/${parts[1]}`;
            const safeName = pkg
              .replace("@", "")
              .replace("/", "_")
              .replace(/[^a-zA-Z0-9_\-\.]/g, "_");
            return `vendor.${safeName}`;
          } catch (e) {
            return "vendor";
          }
        },
      },
    },
    outDir: "dist",
  },
});
