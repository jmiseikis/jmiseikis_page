import { useState } from "react";
import headshot from "@/assets/profile.jpg";
import { ButtonLink, SectionHead } from "@/components/site/primitives";
import { contactPath } from "@/lib/site";

// Biographies for event organisers, built only from facts already published on /about and /publications.
export const SHORT_BIO =
  "Dr. Justinas Mišeikis is Strategy and Partnerships Manager at Sony AI and Founder and Host of TechDrive Zürich. With a PhD in robotics and computer vision, he speaks about physical AI, research commercialisation and technology partnerships. He is based in Zurich and speaks in English.";

export const LONG_BIO =
  "Dr. Justinas Mišeikis works where AI and robotics research meets product direction and partnerships. As Strategy and Partnerships Manager at Sony AI, he leads research commercialisation strategy, project direction and external partnerships across four R&D teams, after earlier technology scouting work for Sony. Before that, he led AI work at F&P Robotics on human-robot interaction, perception and manipulation. He is the Founder and Host of TechDrive Zürich, an interview and podcast series on Switzerland's AI, robotics and deep tech ecosystem. He holds a PhD in robotics and computer vision from the University of Oslo and an Executive MBA, and has 15+ peer-reviewed papers, 700+ citations and 40+ patents. He is based in Zurich and speaks in English.";

const BIOS = [
  { id: "short", title: "Short biography", text: SHORT_BIO },
  { id: "long", title: "Long biography", text: LONG_BIO },
];

const CopyButton = ({ text, label }: { text: string; label: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="min-h-11 border-b border-primary text-sm text-foreground hover:text-primary"
    >
      {copied ? "Copied" : `Copy ${label}`}
      <span className="sr-only" role="status">
        {copied ? `${label} copied` : ""}
      </span>
    </button>
  );
};

/** Material an event organiser can reuse accurately: biographies, headshot and practical details. */
const OrganiserKit = () => (
  <section id="organisers" className="site-wrap section-y" aria-labelledby="organisers-title">
    <SectionHead
      id="organisers-title"
      eyebrow="For event organisers"
      title="Speaker kit."
      intro="Biographies and a headshot to use in programmes and announcements. Please keep the role titles as written."
    />
    <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:gap-12">
      <div className="space-y-8">
        {BIOS.map((bio) => (
          <article key={bio.id} className="min-w-0 border-t-2 border-primary pt-5" aria-labelledby={`bio-${bio.id}`}>
            <h3 id={`bio-${bio.id}`} className="text-[21px] leading-tight">
              {bio.title}
            </h3>
            <p className="mt-3 max-w-[70ch] text-[15px] text-muted-foreground">{bio.text}</p>
            <div className="mt-3">
              <CopyButton text={bio.text} label={bio.title.toLowerCase()} />
            </div>
          </article>
        ))}
      </div>
      <aside className="min-w-0 space-y-6 border-t-2 border-primary pt-5">
        <div>
          <h3 className="text-[21px] leading-tight">Headshot</h3>
          <p className="mt-3 text-[15px] text-muted-foreground">Colour photograph, JPEG, 1.8 MB.</p>
          <a
            href={headshot}
            download="Justinas-Miseikis-headshot.jpg"
            className="mt-3 inline-flex min-h-11 items-center border-b border-primary text-sm text-foreground hover:text-primary"
          >
            Download headshot
          </a>
        </div>
        <div>
          <h3 className="text-[21px] leading-tight">Practical details</h3>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] text-muted-foreground">
            <li>Keynotes, panels and moderation, or executive workshops; format and location agreed for each event.</li>
            <li>All talks are in English. Based in Zurich.</li>
            <li>
              Please do not describe a talk as given on behalf of, or endorsed by, Sony or Sony AI unless that has been
              agreed for your event.
            </li>
          </ul>
        </div>
        <ButtonLink href={contactPath("speaking")}>Enquire with date, audience and format</ButtonLink>
      </aside>
    </div>
  </section>
);

export default OrganiserKit;
