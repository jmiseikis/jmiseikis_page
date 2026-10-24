import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { contactPath, type EnquiryIntent } from "@/lib/site";

const isExternal = (href: string) => /^https?:\/\//i.test(href);
// Static files such as /gza-robotics-map.pdf must bypass the client router.
const isStaticFile = (href: string) => /\.(pdf|txt|png|jpe?g|webp|svg|xml)$/i.test(href.split(/[?#]/)[0]);

type LinkTarget = {
  /** Internal route ("/advisory", "/?enquiry=speaking#contact"), in-page hash ("#brief") or absolute URL. */
  href: string;
  children: ReactNode;
  className?: string;
  /** For same-origin files such as worksheets: renders a plain <a download>. */
  download?: boolean;
  "aria-label"?: string;
};

/** Renders a router link, an in-page anchor, a download or a new-tab external link as appropriate. */
export const SmartLink = ({ href, children, className, download, ...rest }: LinkTarget) => {
  if (download) {
    return (
      <a href={href} download className={className} {...rest}>
        {children}
      </a>
    );
  }
  if (isExternal(href) || isStaticFile(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} {...rest}>
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  if (href.startsWith("#")) {
    return (
      <a href={href} className={className} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link to={href} className={className} {...rest}>
      {children}
    </Link>
  );
};

const Arrow = ({ download }: { download?: boolean }) => (
  <span aria-hidden="true" className="shrink-0 text-[19px] leading-none">
    {download ? "↓" : "↗"}
  </span>
);

export const ButtonLink = ({
  variant = "primary",
  className,
  children,
  ...props
}: LinkTarget & { variant?: "primary" | "secondary" }) => (
  <SmartLink
    {...props}
    className={cn(
      "inline-flex min-h-12 max-w-full items-center justify-between gap-4 border px-4 py-3 text-[13px] font-semibold leading-snug no-underline transition-colors max-[374px]:w-full md:gap-5 md:px-5 md:text-sm",
      variant === "primary"
        ? "border-primary bg-primary text-primary-foreground hover:border-foreground hover:bg-foreground hover:text-background"
        : "border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background",
      className,
    )}
  >
    <span>{children}</span>
    <Arrow download={props.download} />
  </SmartLink>
);

export const TextLink = ({ className, children, arrow = true, ...props }: LinkTarget & { arrow?: boolean }) => (
  <SmartLink {...props} className={cn("text-link", className)}>
    <span>{children}</span>
    {arrow && (
      <span aria-hidden="true" className="text-[12px]">
        {props.download ? "↓" : "↗"}
      </span>
    )}
  </SmartLink>
);

export const Actions = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("mt-7 flex flex-wrap items-center gap-x-4 gap-y-3", className)}>{children}</div>
);

export const Eyebrow = ({
  children,
  className,
  as: Tag = "p",
}: {
  children: ReactNode;
  className?: string;
  as?: "p" | "span";
}) => <Tag className={cn("eyebrow mb-4 block", className)}>{children}</Tag>;

export const PageHero = ({
  eyebrow,
  title,
  lead,
  breadcrumb,
  children,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  breadcrumb?: { to: string; label: string };
  children?: ReactNode;
}) => (
  <section className="site-wrap border-b border-border pb-9 pt-10 md:pb-14 md:pt-[70px]">
    {breadcrumb && (
      <Link
        to={breadcrumb.to}
        className="mb-7 inline-flex min-h-6 items-center text-xs text-muted-foreground no-underline hover:text-primary"
      >
        <span aria-hidden="true">←&nbsp;</span>
        {breadcrumb.label}
      </Link>
    )}
    <Eyebrow>{eyebrow}</Eyebrow>
    <h1 className="max-w-[20ch] text-[34px] leading-[1.08] tracking-[-0.035em] [overflow-wrap:break-word] xs:text-[38px] md:text-[clamp(2.6rem,4.6vw,4rem)]">
      {title}
    </h1>
    {lead && <p className="lead mt-5 md:max-w-[67ch]">{lead}</p>}
    {children}
  </section>
);

export const SectionHead = ({
  eyebrow,
  title,
  intro,
  id,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  intro?: ReactNode;
  id?: string;
  className?: string;
}) => (
  <div className={cn("mb-6 md:mb-10", className)}>
    {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
    <h2 id={id} className="h2">
      {title}
    </h2>
    {intro && <p className="mt-4 max-w-[62ch] text-muted-foreground">{intro}</p>}
  </div>
);

/** Column with a red top rule, used for formats, outputs and compact explainer blocks. */
export const RuleBlock = ({ title, children, eyebrow }: { title: ReactNode; children: ReactNode; eyebrow?: ReactNode }) => (
  <article className="min-w-0 border-t-2 border-primary pt-5">
    {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
    <h3 className="text-[21px] leading-tight">{title}</h3>
    <div className="mt-3 text-[15px] text-muted-foreground [&>p+p]:mt-3">{children}</div>
  </article>
);

/** Closing call to action used at the end of most pages. Links to the protected form on the home page. */
export const ContactCta = ({
  title,
  lead,
  intent,
  label,
  eyebrow = "Put the context to work",
}: {
  title: ReactNode;
  lead: ReactNode;
  intent: EnquiryIntent;
  label: string;
  eyebrow?: ReactNode;
}) => (
  <section className="section-y border-t-[3px] border-primary bg-muted">
    <div className="site-wrap grid gap-8 md:grid-cols-2 md:gap-20">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="h2">{title}</h2>
      </div>
      <div>
        <p className="lead">{lead}</p>
        <Actions>
          <ButtonLink href={contactPath(intent)}>{label}</ButtonLink>
        </Actions>
      </div>
    </div>
  </section>
);
