import { Link, useLocation } from "react-router-dom";
import { CONTACT_PATH, FOOTER_COLUMNS, LINKEDIN_URL, type FooterLink } from "@/lib/site";

const linkClass = "text-muted-foreground transition-colors hover:text-foreground hover:underline underline-offset-4";

const FooterItem = ({ link }: { link: FooterLink }) =>
  link.external ? (
    <a href={link.to} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {link.label} <span aria-hidden="true">↗</span>
    </a>
  ) : (
    <Link to={link.to} className={linkClass}>
      {link.label}
    </Link>
  );

const Footer = () => {
  const currentYear = new Date().getFullYear();
  // The German page links back to English; every other page offers the German page.
  const onGermanPage = useLocation().pathname.toLowerCase().replace(/\/+$/, "") === "/de";

  return (
    <footer className="border-t border-border bg-muted pb-7 pt-9 md:pt-14">
      <div className="site-wrap">
        <div className="grid grid-cols-2 gap-6 md:gap-9 nav:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,1fr))] nav:gap-10">
          <div className="col-span-2 space-y-3 nav:col-span-1">
            <p className="text-base font-bold text-foreground">Dr. Justinas Mišeikis</p>
            <p className="text-sm text-foreground">
              AI &amp; robotics advisory.
              <br />
              Swiss ecosystem expertise.
            </p>
            <p className="text-xs text-muted-foreground">
              Zurich, Switzerland.
              <br />
              Working internationally in English.
            </p>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border-b border-primary pb-1 text-[13px] font-semibold text-foreground hover:text-primary"
            >
              Connect on LinkedIn <span aria-hidden="true">↗</span>
            </a>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className="min-w-0">
              <h2 className="eyebrow mb-2 tracking-[0.12em]">{column.title}</h2>
              <ul className="text-[13px]">
                {column.links.map((link) => (
                  <li key={link.label} className="py-1.5">
                    <FooterItem link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-border pt-5 text-xs text-muted-foreground">
          <span className="w-full md:mr-auto md:w-auto">© {currentYear} Dr. Justinas Mišeikis</span>
          {onGermanPage ? (
            <Link to="/" lang="en" className={linkClass}>
              English
            </Link>
          ) : (
            <Link to="/de" lang="de" className={linkClass}>
              Deutsch
            </Link>
          )}
          <Link to={CONTACT_PATH} className={linkClass}>
            Contact
          </Link>
          <Link to="/privacy" className={linkClass}>
            Privacy Policy
          </Link>
          <Link to="/terms" className={linkClass}>
            Terms of Use
          </Link>
        </div>
        <p className="mt-3 max-w-[80ch] text-xs text-muted-foreground">
          Professional experience and named organisations do not imply endorsement of independent services.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
