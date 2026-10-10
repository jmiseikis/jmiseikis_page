import { Link } from "react-router-dom";
import { LINKEDIN_URL, contactPath } from "@/lib/site";
import { TextLink } from "@/components/site/primitives";

const COLUMNS = [
  {
    title: "Work together",
    links: [
      { label: "Advisory", to: "/advisory" },
      { label: "Due diligence", to: "/due-diligence" },
      { label: "Speaking", to: "/speaking" },
      { label: "About", to: "/about" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Resource hub", to: "/resources" },
      { label: "Publications & patents", to: "/publications" },
      { label: "Swiss ecosystem guide", to: "/swiss-ai-robotics-ecosystem" },
      { label: "Market-entry guide", to: "/swiss-baltic-market-entry" },
      { label: "Internal AI & workflows", to: "/ai-agents-strategy" },
    ],
  },
  {
    title: "Directories & tools",
    links: [
      { label: "Swiss tech events", to: "/tech-events" },
      { label: "Swiss VCs & funds", to: "/swiss-vcs" },
      { label: "GZA robotics", to: "/gza-robotics" },
      { label: "RaaS calculator", to: "/raas-calculator" },
    ],
  },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted pb-7 pt-9 md:pt-14">
      <div className="site-wrap">
        <div className="grid grid-cols-2 gap-6 md:gap-10 lg:grid-cols-[1.35fr_repeat(3,minmax(0,1fr))]">
          <div className="col-span-2 lg:col-span-1">
            <p className="text-base font-bold text-foreground">Dr. Justinas Mišeikis</p>
            <p className="mt-4 text-sm text-muted-foreground">
              AI & robotics advisory.
              <br />
              Swiss ecosystem expertise.
            </p>
            <p className="fine mt-4">
              Zurich, Switzerland.
              <br />
              Working internationally in English.
            </p>
            <div className="mt-4">
              <TextLink href={LINKEDIN_URL}>Connect on LinkedIn</TextLink>
            </div>
          </div>
          {COLUMNS.map((column) => (
            <div key={column.title} className="min-w-0">
              <p className="eyebrow text-[9px] md:text-[10px]">{column.title}</p>
              <ul className="space-y-0">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="inline-flex min-h-9 items-center text-[12px] text-foreground no-underline hover:text-primary hover:underline md:min-h-8"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-2 border-t border-border pt-5 text-[11px] md:mt-8">
          <span className="w-full text-muted-foreground md:mr-auto md:w-auto">© {year} Dr. Justinas Mišeikis</span>
          <Link to="/de" lang="de" hrefLang="de" className="inline-flex min-h-9 items-center text-foreground no-underline hover:underline">
            Deutsch
          </Link>
          <Link to={contactPath("other")} className="inline-flex min-h-9 items-center text-foreground no-underline hover:underline">
            Contact
          </Link>
        </div>
        <p className="fine mt-3 max-w-[80ch] text-[11px]">
          Professional experience and named organisations do not imply endorsement of independent services.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
