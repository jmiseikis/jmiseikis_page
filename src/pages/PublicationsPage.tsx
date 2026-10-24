import { useMemo, useState } from "react";
import PageMeta from "@/components/site/PageMeta";
import { Actions, ButtonLink, ContactCta, Eyebrow, PageHero, SectionHead, TextLink } from "@/components/site/primitives";
import { PATENTS_URL, SCHOLAR_URL } from "@/lib/site";

// The three papers featured on the website, with their exact Scholar records.
// This is a selection, not the complete bibliography.
const PAPERS = [
  {
    year: "2020",
    type: "Journal article",
    title: "Lio-a personal robot assistant for human-robot interaction and care applications",
    venue: "IEEE Robotics and Automation Letters",
    url: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=KeZ1-AwAAAAJ&citation_for_view=KeZ1-AwAAAAJ:WF5omc3nYNoC",
  },
  {
    year: "2017",
    type: "Preprint",
    title: "3D vision guided robotic charging station for electric and plug-in hybrid vehicles",
    venue: "arXiv:1703.05381",
    url: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=KeZ1-AwAAAAJ&citation_for_view=KeZ1-AwAAAAJ:IjCSPb-OGe4C",
  },
  {
    year: "2016",
    type: "Conference paper",
    title: "Automatic calibration of a robot manipulator and multi 3d camera system",
    venue: "IEEE/SICE International Symposium on System Integration",
    url: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=KeZ1-AwAAAAJ&citation_for_view=KeZ1-AwAAAAJ:qjMakFHDy7sC",
  },
];

// Owner-confirmed counts (handoff/OWNER_FACTS.md), each shown next to the record that evidences it.
const COUNTS = [
  { value: "15+", label: "Peer-reviewed papers", record: "Google Scholar", href: SCHOLAR_URL },
  { value: "700+", label: "Citations", record: "Google Scholar", href: SCHOLAR_URL },
  { value: "40+", label: "Patents", record: "Google Patents", href: PATENTS_URL },
];

const TYPES = [...new Set(PAPERS.map((p) => p.type))];

const PublicationsPage = () => {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return PAPERS.filter(
      (paper) =>
        (!type || paper.type === type) &&
        (!q || [paper.title, paper.venue, paper.type, paper.year].join(" ").toLocaleLowerCase().includes(q)),
    );
  }, [query, type]);

  const reset = () => {
    setQuery("");
    setType("");
  };

  return (
    <>
      <PageMeta path="/publications" />

      <PageHero
        eyebrow="Research & innovation"
        title="Publications & patents."
        lead="Selected work in robotics, computer vision and human-robot interaction. The full records are linked below."
      >
        <Actions>
          <ButtonLink href={SCHOLAR_URL}>Full publication record</ButtonLink>
          <ButtonLink href={PATENTS_URL} variant="secondary">
            Published patent record
          </ButtonLink>
        </Actions>
      </PageHero>

      <section className="site-wrap pt-8 md:pt-12" aria-label="Research record">
        <dl className="grid grid-cols-1 sm:grid-cols-3">
          {COUNTS.map((count) => (
            <div
              key={count.label}
              className="grid min-w-0 grid-cols-[5.5rem_minmax(0,1fr)] items-start gap-x-4 border-b border-border py-5 sm:block sm:pr-4 md:py-7"
            >
              <dt className="col-start-2 row-start-1 text-[13px] font-semibold text-foreground">{count.label}</dt>
              <dd className="col-start-1 row-span-2 row-start-1 text-[34px] font-bold leading-none tracking-[-0.035em] text-primary sm:mt-1 md:text-[44px]">
                {count.value}
              </dd>
              <dd className="col-start-2 mt-2 sm:mt-3">
                <TextLink href={count.href}>
                  {count.record}
                  <span className="sr-only">: {count.label.toLowerCase()}</span>
                </TextLink>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="site-wrap pb-12 pt-10 md:pb-20" aria-labelledby="papers-title">
        <SectionHead
          id="papers-title"
          title="Selected publications."
          intro="Three papers featured on this website. Search the selection, or explore the full record on Google Scholar."
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr] sm:gap-4">
          <label className="block min-w-0 text-[13px] font-semibold text-foreground">
            Search papers
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Title, topic or venue"
              className="mt-2 block w-full border border-input bg-background px-3 py-3 text-base font-normal text-foreground placeholder:text-muted-foreground md:text-sm"
            />
          </label>
          <label className="block min-w-0 text-[13px] font-semibold text-foreground">
            Type
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-2 block w-full border border-input bg-background px-3 py-3 text-base font-normal text-foreground md:text-sm"
            >
              <option value="">All types</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p role="status" className="my-4 text-[13px] text-muted-foreground">
          {visible.length} of {PAPERS.length} selected publications
        </p>

        {visible.length > 0 ? (
          <ol className="list-none p-0">
            {visible.map((paper) => (
              <li
                key={paper.url}
                className="grid grid-cols-1 gap-3 border-t border-border py-6 xs:grid-cols-[48px_minmax(0,1fr)] xs:gap-5 md:grid-cols-[100px_minmax(0,1fr)] md:gap-8 md:py-8"
              >
                <span className="text-[19px] font-semibold leading-none text-primary md:text-[26px]">{paper.year}</span>
                <div className="min-w-0">
                  <Eyebrow className="mb-3 text-[10px]">{paper.type}</Eyebrow>
                  <h3 className="max-w-[38ch] text-[21px] leading-tight md:text-[25px]">{paper.title}</h3>
                  <p className="my-3 text-sm text-muted-foreground">{paper.venue}</p>
                  <TextLink href={paper.url}>
                    View publication record<span className="sr-only">: {paper.title}</span>
                  </TextLink>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="mt-6 border border-border bg-muted px-6 py-12 text-center">
            <h3 className="text-2xl">No matching papers.</h3>
            <p className="mx-auto my-4 max-w-[54ch] text-muted-foreground">Try another term or clear the filters.</p>
            <button
              type="button"
              onClick={reset}
              className="min-h-11 border border-foreground px-4 text-sm font-semibold text-foreground hover:bg-foreground hover:text-background"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      <section className="section-y bg-muted" aria-labelledby="patents-title">
        <div className="site-wrap grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-20">
          <div>
            <Eyebrow>Patented work</Eyebrow>
            <h2 id="patents-title" className="h2">
              Explore the underlying inventions.
            </h2>
          </div>
          <div>
            <p className="max-w-[50ch] text-muted-foreground">
              My research background includes patented work in AI and robotics. The published record provides inventors,
              applicants, filing information and the details of each invention.
            </p>
            <div className="mt-5">
              <TextLink href={PATENTS_URL}>Browse published patent records</TextLink>
            </div>
            <p className="fine mt-5 max-w-[50ch]">
              Patent applications, grants and patent families are different measures. Refer to the record for the status of
              an individual filing.
            </p>
          </div>
        </div>
      </section>

      <ContactCta
        title="Need a technical perspective on the evidence?"
        lead="I help teams assess capabilities, technical risks and the assumptions behind AI and robotics opportunities."
        intent="diligence"
        label="Discuss an assessment"
      />
    </>
  );
};

export default PublicationsPage;
