import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// The prerendered HTML carries static head tags (marked data-seo) for crawlers that
// don't run JavaScript. Remove them before React Helmet renders the live equivalents,
// so the hydrated document never has duplicate canonical, robots or OG tags.
document.head.querySelectorAll("[data-seo]").forEach((node) => node.remove());

createRoot(document.getElementById("root")!).render(<App />);
