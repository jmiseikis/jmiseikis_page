import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Built pages arrive with their content already rendered (scripts/prerender-meta.mjs); hydrate it in place rather
// than replacing it. The host serves the home page's file for unknown URLs, so only hydrate when the rendered route
// is the one requested; otherwise start from an empty root, as the dev server does.
const root = document.getElementById("root")!;
const normalise = (path: string) => path.replace(/\/+$/, "").toLowerCase() || "/";
if (root.dataset.route && normalise(root.dataset.route) === normalise(window.location.pathname)) {
  hydrateRoot(root, <App />);
} else {
  root.replaceChildren();
  createRoot(root).render(<App />);
}
