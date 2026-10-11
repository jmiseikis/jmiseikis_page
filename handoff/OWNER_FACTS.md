# Owner-confirmed facts (11 October 2026)

These answers replace the "pending" items and "safe defaults" in the Codex package
(`reference/CLAUDE_CODE_PROMPT.txt`, `reference/IMPLEMENTATION_AND_QA.txt`). Where the package
says to stay neutral, omit counts or avoid a title, follow this file instead.

| Topic | Confirmed answer | What it changes |
|---|---|---|
| Current role | **Strategy and Partnerships Manager at Sony AI (Sony)**, and **Founder and Host of TechDrive Zürich** | Both company names are correct: Sony AI is part of Sony. Use "Sony AI" for the current role and the team context, and "Sony" where the company as a whole is meant (for example the earlier technology-scouting role). In JSON-LD use `worksFor` Sony AI with `parentOrganization` Sony. Do not invent an end date or an immediate-availability claim. |
| TechDrive Zürich link | **https://techdrive.tv** | Replace every `techdrivezurich.lovable.app` link (in `index.html`, `public/llms.txt`, `src/components/Speaking.tsx`, `src/pages/SpeakingPage.tsx`, 12 occurrences) with `https://techdrive.tv`, keeping any path. |
| Privacy contact | **dr.miseikis@gmail.com** | The one permitted exception to "no owner email on the site": shown as plain text on `/privacy` and `/terms` only. Not in the nav, footer, contact section, metadata or JSON-LD. |
| Swiss Tech Pulse subscribers | **Deleted: `digest_subscribers` confirmed empty (0 rows) on 11 Oct 2026** | Nothing left to do. The Privacy Policy says no subscriber data is held. The cloud session must not touch the table. |
| GZA and Swisscom Ventures | **Not partners.** Their resources are listed with mutual agreement. | Remove every "partner", "partner organisation", "in partnership with" and `affiliation` claim (index.html JSON-LD, FAQ answers, noscript block, `keywords` meta). Keep the data credits and links. Suggested wording: "Listed with the agreement of Greater Zurich Area" / "Directory by Swisscom Ventures". |
| Pricing | **Fees on request.** | No public rates anywhere, including JSON-LD offers. |
| LinkedIn | **https://www.linkedin.com/in/justinasmiseikis** | This is already the URL in the repo. Keep it everywhere and do not switch to `/in/justinas-miseikis/`. |
| Research counts | **700+ citations, 15+ peer-reviewed papers, 40+ patents** (confirmed) | These may be published. Keep the Google Scholar and Google Patents links next to them as evidence. |
| Privacy and Terms | **Publish both pages**, generated to match the actual site setup | Use the drafts in `legal/`. Wire the dead footer buttons to `/privacy` and `/terms`. |

Unchanged from the package: no owner email or `mailto:` on the site (except the privacy contact above), no testimonials or client
outcomes that were not supplied, consulting is cash-paid, based in Switzerland, working internationally in English.
