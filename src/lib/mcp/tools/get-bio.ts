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
          "Dr. Justinas Mišeikis - AI strategy advisor, keynote speaker and researcher (PhD in Robotics and Computer Vision).",
          "Strategy and Partnerships Manager at Sony AI, and Founder and Host of TechDrive Zürich (https://techdrive.tv). Based in Zurich, Switzerland.",
          "Services: Advisory, Speaking, Technical Due Diligence. Fees on request.",
          "Website: https://jmiseikis.com",
          "LinkedIn: https://www.linkedin.com/in/justinasmiseikis",
          "Contact via the website contact form.",
        ].join("\n"),
      },
    ],
  }),
});