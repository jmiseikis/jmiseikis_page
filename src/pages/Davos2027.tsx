import { useEffect, useRef, useState } from "react";
import PageMeta from "@/components/site/PageMeta";
import { mountDavosDirectory } from "@/features/davos/directory.mjs";
import { DAVOS_EVENTS_CSV_URL } from "@/features/davos/sheets-config.mjs";
import "@/features/davos/directory.css";
import "@/features/davos/site-theme.css";

// The owner's public Google Sheet (Events tab) is the only data source. The directory reads it in the browser on
// load, every five minutes while visible and on Refresh, and replaces the list on each successful read. There is
// no bundled fallback: a failed read shows a labelled error, or a labelled local copy under 24 hours old.
const csvUrl = import.meta.env.VITE_DAVOS_EVENTS_CSV_URL?.trim() || DAVOS_EVENTS_CSV_URL;

/** Kept out of search (noindex in src/content/seo.json) and not linked from the site until the owner releases it. */
const Davos2027 = () => {
  const mount = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!mount.current) return;
    const directory = mountDavosDirectory(mount.current, { csvUrl, mode: "live" });
    setMounted(true);
    // Cancels the request and the refresh timer, including the first unmount under React Strict Mode.
    return () => directory.destroy();
  }, []);

  return (
    <div className="davos-page site-wrap section-y">
      <PageMeta path="/davos-2027" />
      {/* Static introduction for the prerendered HTML and for visitors without JavaScript. The live directory
          renders its own heading, so this is removed once the directory has mounted. */}
      {!mounted && (
        <section aria-labelledby="davos-static-title" className="max-w-[70ch]">
          <p className="eyebrow mb-3">Davos attendee directory</p>
          <h1 id="davos-static-title" className="text-[34px] leading-tight md:text-[48px]">
            Davos events during WEF 2027
          </h1>
          <p className="mt-4 text-[17px] text-muted-foreground">
            Attendee applications for events in Davos during the World Economic Forum week, 18 to 22 January 2027, and
            selected adjacent dates. Each listing states who the organiser accepts, whether a price or a separate badge
            has been published, what the application covers and where to apply.
          </p>
          <p className="mt-4 text-[15px] text-muted-foreground">
            The listings are read in your browser from a public sheet maintained by Dr. Justinas Mišeikis, so edits and
            removals appear without a new release. &ldquo;Interest open&rdquo; is not admission, an undisclosed cost is
            not free, and a side-event application does not provide a WEF Annual Meeting credential. Organisers decide
            eligibility and admission. This directory is independent and not affiliated with the World Economic Forum.
          </p>
          <noscript>
            <p className="mt-4 text-[15px]">Enable JavaScript to load and search the live directory.</p>
          </noscript>
        </section>
      )}
      <div ref={mount} />
    </div>
  );
};

export default Davos2027;
