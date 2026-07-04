import { defineMcp } from "@lovable.dev/mcp-js";
import getBio from "./tools/get-bio";
import listServices from "./tools/list-services";
import listTechEvents from "./tools/list-tech-events";
import listSwissVcs from "./tools/list-swiss-vcs";

export default defineMcp({
  name: "jmiseikis-mcp",
  title: "Justinas Mišeikis Portfolio MCP",
  version: "0.1.0",
  instructions:
    "Tools for the Dr. Justinas Mišeikis portfolio site. Use `get_bio` for a short bio and links, `list_services` for advisory/speaking/due-diligence offerings, `list_tech_events` for the curated European tech/AI/robotics events directory, and `list_swiss_vcs` for the Swiss VC directory. All tools are read-only and safe to call.",
  tools: [getBio, listServices, listTechEvents, listSwissVcs],
});