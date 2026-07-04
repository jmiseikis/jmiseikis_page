import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "get_bio",
  title: "Get bio",
  description: "Return a concise bio and contact links for Dr. Justinas Mišeikis.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [
      {
        type: "text",
        text: [
          "Dr. Justinas Mišeikis - AI Strategy Advisor, speaker, and researcher (PhD in Robotics & AI).",
          "Currently at Sony AI. Based in Zurich, Switzerland.",
          "Services: Advisory, Speaking, Technical Due Diligence.",
          "Website: https://jmiseikis.lovable.app",
          "LinkedIn: https://www.linkedin.com/in/miseikis/",
          "Contact via the website contact form.",
        ].join("\n"),
      },
    ],
  }),
});