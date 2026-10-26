import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Server bundle used only at build time by scripts/prerender-meta.mjs to render each route's static HTML.
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: { ssr: "src/entry-server.tsx", outDir: ".ssr", emptyOutDir: true, copyPublicDir: false },
});
