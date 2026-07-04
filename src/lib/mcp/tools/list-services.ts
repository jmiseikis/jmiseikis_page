import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "list_services",
  title: "List services",
  description: "List the professional services Justinas Mišeikis offers (Advisory, Speaking, Technical Due Diligence) with page URLs.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(
          [
            {
              name: "AI Strategy Advisory",
              url: "https://jmiseikis.lovable.app/advisory",
              summary: "Fractional AI advisory for founders and executives: strategy, roadmap, agent architecture.",
            },
            {
              name: "Keynote Speaking",
              url: "https://jmiseikis.lovable.app/speaking",
              summary: "Keynotes and workshops on applied AI, robotics, and AI agents.",
            },
            {
              name: "Technical Due Diligence",
              url: "https://jmiseikis.lovable.app/due-diligence",
              summary: "Independent AI/ML technical due diligence for VCs and acquirers.",
            },
            {
              name: "AI Agents Strategy Guide",
              url: "https://jmiseikis.lovable.app/ai-agents-strategy",
              summary: "Guide for enterprises adopting AI agents.",
            },
          ],
          null,
          2,
        ),
      },
    ],
  }),
});