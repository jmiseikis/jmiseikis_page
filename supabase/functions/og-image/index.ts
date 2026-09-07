// Dynamic Open Graph image generator (1200x630 PNG).
// Query params:
//   title  - main headline (required, falls back to site name)
//   image  - absolute URL of a hero visual to embed on the right side (optional)
//   subtitle - small kicker line above title (optional)
// Uses Satori for SVG layout + Resvg (WASM) for rasterization.

import satori from "npm:satori@0.10.13";
import { Resvg, initWasm } from "npm:@resvg/[email protected]";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const WIDTH = 1200;
const HEIGHT = 630;

const ANTON_URL =
  "https://raw.githubusercontent.com/google/fonts/main/ofl/anton/Anton-Regular.ttf";
const BARLOW_URL =
  "https://raw.githubusercontent.com/google/fonts/main/ofl/barlowcondensed/BarlowCondensed-Medium.ttf";
const WASM_URL =
  "https://unpkg.com/@resvg/[email protected]/index_bg.wasm";

let wasmReady: Promise<void> | null = null;
function ensureWasm() {
  if (!wasmReady) {
    wasmReady = (async () => {
      const wasm = await fetch(WASM_URL).then((r) => r.arrayBuffer());
      await initWasm(wasm);
    })();
  }
  return wasmReady;
}

let fontsCache: { anton: ArrayBuffer; barlow: ArrayBuffer } | null = null;
async function loadFonts() {
  if (fontsCache) return fontsCache;
  const [anton, barlow] = await Promise.all([
    fetch(ANTON_URL).then((r) => r.arrayBuffer()),
    fetch(BARLOW_URL).then((r) => r.arrayBuffer()),
  ]);
  fontsCache = { anton, barlow };
  return fontsCache;
}

// Hosts we trust as image sources. Anything else is rejected to prevent
// this public endpoint being used as an open proxy / SSRF oracle.
const ALLOWED_IMAGE_HOSTS = new Set([
  "jmiseikis.lovable.app",
  "id-preview--71583109-f511-481b-9510-6ec54c78397f.lovable.app",
  "uwdastthzqjbiyrxucci.supabase.co",
]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB cap
const FETCH_TIMEOUT_MS = 5000;

// Reject loopback, link-local and private/special-use IPv4 ranges.
function isPrivateIp(host: string): boolean {
  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const [a, b] = [Number(m[1]), Number(m[2])];
    if (a === 10 || a === 127 || a === 0) return true; // loopback / private / "this" net
    if (a === 169 && b === 254) return true; // link-local (cloud metadata)
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    return false;
  }
  const h = host.toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".internal")) return true;
  if (h === "::1" || h === "[::1]") return true;
  return false;
}

function validateImageUrl(raw: string): URL | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch (_) {
    return null;
  }
  if (url.protocol !== "https:") return null;
  if (!ALLOWED_IMAGE_HOSTS.has(url.hostname.toLowerCase())) return null;
  if (isPrivateIp(url.hostname)) return null;
  return url;
}

async function tryFetchImage(raw: string): Promise<string | null> {
  const url = validateImageUrl(raw);
  if (!url) return null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    // Manual redirect handling so every hop is re-validated.
    let current = url;
    let res: Response | null = null;
    for (let hop = 0; hop < 3; hop++) {
      res = await fetch(current.toString(), {
        redirect: "manual",
        signal: controller.signal,
      });
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get("location");
        const next = loc ? validateImageUrl(new URL(loc, current).toString()) : null;
        if (!next) return null;
        current = next;
        continue;
      }
      break;
    }
    clearTimeout(timer);
    if (!res || !res.ok) return null;
    const type = res.headers.get("content-type") || "image/jpeg";
    if (!type.startsWith("image/")) return null;
    const len = Number(res.headers.get("content-length") || 0);
    if (len > MAX_IMAGE_BYTES) return null;
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.length > MAX_IMAGE_BYTES) return null;
    // Base64 encode
    let bin = "";
    for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
    const b64 = btoa(bin);
    return `data:${type};base64,${b64}`;
  } catch (_) {
    return null;
  }
}

function truncate(s: string, max: number) {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const url = new URL(req.url);
    const title = truncate(
      (url.searchParams.get("title") || "Dr. Justinas Mišeikis").trim(),
      110,
    );
    const subtitle = truncate(
      (url.searchParams.get("subtitle") || "DR. JUSTINAS MIŠEIKIS · ZURICH").trim(),
      80,
    );
    const imageParam = url.searchParams.get("image");
    const imageDataUrl = imageParam ? await tryFetchImage(imageParam) : null;

    const [{ anton, barlow }] = await Promise.all([loadFonts(), ensureWasm()]);

    const tree = {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          backgroundColor: "#0E0E10",
          color: "#FFFFFF",
          fontFamily: "Barlow Condensed",
          position: "relative",
        },
        children: [
          // Red vertical accent bar
          {
            type: "div",
            props: {
              style: {
                width: 14,
                height: "100%",
                backgroundColor: "#EC1313",
              },
            },
          },
          // Text column
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "60px 60px 60px 50px",
                flex: 1,
                minWidth: 0,
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      fontFamily: "Barlow Condensed",
                      fontSize: 26,
                      letterSpacing: 6,
                      textTransform: "uppercase",
                      color: "#EC1313",
                    },
                    children: subtitle,
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      fontFamily: "Anton",
                      fontSize: title.length > 60 ? 78 : title.length > 30 ? 100 : 128,
                      lineHeight: 1.02,
                      textTransform: "uppercase",
                      letterSpacing: -1,
                      color: "#FFFFFF",
                      display: "flex",
                    },
                    children: title,
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      fontFamily: "Barlow Condensed",
                      fontSize: 24,
                      letterSpacing: 4,
                      textTransform: "uppercase",
                      color: "#CFD2D6",
                    },
                    children: "jmiseikis.lovable.app",
                  },
                },
              ],
            },
          },
          // Optional visual
          imageDataUrl
            ? {
                type: "div",
                props: {
                  style: {
                    width: 380,
                    height: 630,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 40,
                    backgroundColor: "#141416",
                    borderLeft: "1px solid #2A2A2E",
                  },
                  children: [
                    {
                      type: "img",
                      props: {
                        src: imageDataUrl,
                        style: {
                          width: 300,
                          height: 300,
                          borderRadius: 999,
                          objectFit: "cover",
                          border: "4px solid #EC1313",
                        },
                      },
                    },
                  ],
                },
              }
            : null,
        ].filter(Boolean),
      },
    };

    const svg = await satori(tree as unknown as Parameters<typeof satori>[0], {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: "Anton", data: anton, weight: 400, style: "normal" },
        { name: "Barlow Condensed", data: barlow, weight: 500, style: "normal" },
      ],
    });

    const png = new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } })
      .render()
      .asPng();

    return new Response(png, {
      headers: {
        ...corsHeaders,
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable",
      },
    });
  } catch (err) {
    console.error("og-image error", err);
    // Redirect to static fallback so crawlers never get a broken image
    return Response.redirect(
      "https://jmiseikis.lovable.app/og-image.png",
      302,
    );
  }
});