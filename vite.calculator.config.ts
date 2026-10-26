import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const ssr = mode === "calculator-preview-ssr";
  return {
    root,
    base: "./",
    publicDir: false,
    plugins: [react()],
    resolve: { alias: { "@": path.join(root, "src") } },
    build: {
      ssr: ssr ? path.join(root, "src/calculator-preview.tsx") : false,
      outDir: path.join(root, "dist-calculator/.build", ssr ? "server" : "client"),
      emptyOutDir: true,
      copyPublicDir: false,
      sourcemap: false,
      cssCodeSplit: false,
      modulePreload: false,
      assetsInlineLimit: Number.MAX_SAFE_INTEGER,
      rollupOptions: {
        input: ssr ? undefined : path.join(root, "calculator-preview/index.html"),
        output: { inlineDynamicImports: true, entryFileNames: ssr ? "preview-server.js" : "assets/preview.js" },
      },
    },
  };
});
