# Measurement

Last updated 26 October 2026.

## What runs today

- The repository adds **no analytics, tracking or event code**. `index.html` has only the theme pre-paint script,
  the single-page-app redirect helper and the app bundle.
- The hosting provider (Lovable) injects its own scripts on the live site and compiles aggregate visitor
  statistics. The Privacy Policy describes this ("Lovable and its cloud backend"; "visitor statistics").
- The calculator and worksheets keep inputs in the browser. Nothing in this code sends calculator values, worksheet
  answers or contact-form text anywhere except the contact form's own submission.

Not yet verified: what the host-injected scripts send. Before adding any analytics, do a staged network review on
the live site (browser dev tools, Network tab, filtered to non-jmiseikis.com requests) while using the calculator,
a worksheet and the contact form, and record the destinations and payload categories here.

## Proposed event model (not implemented)

If an analytics tool is added later, keep it to coarse page/action events:

| Event | Properties |
| --- | --- |
| `service_choice` | service id (e.g. `scouting-diligence`) |
| `calculator_step` | step number (1 to 4), first edit yes/no |
| `calculator_comparison_viewed` | none |
| `calculator_export_requested` | format (`json` or `csv`); a click is not proof a file was saved |
| `worksheet_opened` / `worksheet_print_requested` | worksheet slug |
| `enquiry_started` | enquiry type (`advisory`, `scouting`, `diligence`, `representation`, `speaking`, `other`) and source page |
| `enquiry_submitted` | enquiry type; only after the server confirms the submission |

Never include financial amounts, calculator inputs, worksheet text, names, email addresses, organisations or
message text. Update the Privacy Policy in the same change.

## What to look at

- Lovable project analytics: visitors, page views, sources and pages.
- Google Search Console: indexing (URL Inspection), search performance, and its AI-feature reporting if available.
- Bing Webmaster Tools: AI performance reporting if available.

Measure completed tasks (worksheets used, calculator comparisons, qualified enquiries), not time on page. With low
traffic, observed sessions are more useful than A/B tests. Do not claim ranking, AI-citation or conversion gains
without before/after data.
