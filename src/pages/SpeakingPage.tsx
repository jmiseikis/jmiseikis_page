import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import PageMeta from "@/components/site/PageMeta";
import {
  Actions,
  ButtonLink,
  ContactCta,
  Eyebrow,
  Note,
  PageHero,
  RuleBlock,
  SectionHead,
  ServiceRow,
  SmartLink,
  TextLink,
} from "@/components/site/primitives";
import { supabase } from "@/integrations/supabase/client";
import {
  COLLABORATIONS,
  FEATURED_TALK,
  PERSONAL_FALLBACK,
  TECHDRIVE_FALLBACK,
  mergeVideos,
  normaliseVideo,
  type VideoItem,
} from "@/content/media";
import { PAST_ENGAGEMENTS, SIGNATURE_TOPICS, WIDER_TOPICS } from "@/content/services";
import {
  PREMIUM_SPEAKERS_URL,
  TECHDRIVE_CHANNEL_URL,
  TECHDRIVE_URL,
  YOUTUBE_CHANNEL_URL,
  contactPath,
} from "@/lib/site";

interface YoutubeFeed {
  videos?: VideoItem[];
  techdrive?: { episodes?: VideoItem[] };
}

// Structured data kept from the previous page, with owner-confirmed roles. Wisdom House was independently organised
// during WEF week, so it is not presented as part of the official WEF programme.
const PERSON_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Dr. Justinas Mišeikis",
  jobTitle: ["Strategy and Partnerships Manager at Sony AI", "Founder and Host of TechDrive Zürich"],
  worksFor: {
    "@type": "Organization",
    name: "Sony AI",
    url: "https://ai.sony",
    parentOrganization: { "@type": "Organization", name: "Sony", url: "https://www.sony.com" },
  },
  url: "https://jmiseikis.com/speaking",
  sameAs: [YOUTUBE_CHANNEL_URL, PREMIUM_SPEAKERS_URL, TECHDRIVE_URL],
  knowsAbout: ["Artificial Intelligence", "Robotics", "Computer Vision", "AI Commercialization", "AI Ethics", "Physical AI", "Deep Tech Investment"],
  performerIn: [
    {
      "@type": "Event",
      name: "Wisdom House @ Davos 2026",
      location: "Davos, Switzerland",
      description: "Independently organised during WEF week",
    },
    { "@type": "Event", name: "GenAI Zürich", location: "Zurich, Switzerland" },
    { "@type": "Event", name: "LOGIN Conference", location: "Vilnius, Lithuania" },
    { "@type": "Event", name: "ETH Zürich & ETH Entrepreneurship Club", location: "Zurich, Switzerland" },
    { "@type": "Event", name: "Sony AI Conference" },
  ],
};

const PODCAST_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "PodcastSeries",
  name: "TechDrive Zürich",
  url: TECHDRIVE_URL,
  description:
    "Interview and podcast series hosted by Dr. Justinas Mišeikis, spotlighting founders, researchers and operators shaping Switzerland's AI, robotics and deep tech ecosystem, recorded in and around Zürich.",
  inLanguage: "en",
  author: { "@type": "Person", name: "Dr. Justinas Mišeikis", url: "https://jmiseikis.com/" },
  host: { "@type": "Person", name: "Dr. Justinas Mišeikis", url: "https://jmiseikis.com/" },
  about: ["Artificial Intelligence", "Robotics", "Deep Tech", "Swiss Startups", "Greater Zurich Area"],
};

const formatDate = (iso: string) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Zurich" });
};

const MediaCard = ({ item, eyebrow, featured = false }: { item: VideoItem; eyebrow?: string; featured?: boolean }) => (
  <article className="min-w-0">
    <SmartLink href={item.url} className="group relative block overflow-hidden bg-muted no-underline">
      <img
        src={item.thumbnail}
        alt=""
        width={480}
        height={360}
        loading={featured ? "eager" : "lazy"}
        decoding="async"
        className="aspect-video h-auto w-full object-cover grayscale-[15%] transition-[filter] group-hover:grayscale-0"
      />
      <span aria-hidden="true" className="absolute bottom-4 left-4 bg-primary px-4 py-2 text-sm text-primary-foreground">
        ▶
      </span>
      <span className="sr-only">Watch {item.title}</span>
    </SmartLink>
    {!featured && (
      <>
        <p className="eyebrow mb-2 mt-4 text-[9px] md:text-[10px]">{eyebrow ?? formatDate(item.publishedAt)}</p>
        <h3 className="max-w-[38ch] text-[17px] leading-snug tracking-[-0.02em] md:text-lg">{item.title}</h3>
        <div className="mt-4">
          <TextLink href={item.url} className="text-xs">
            Watch on YouTube
          </TextLink>
        </div>
      </>
    )}
  </article>
);

const MediaGrid = ({ items }: { items: VideoItem[] }) => (
  <div className="mt-8 grid grid-cols-1 gap-x-5 gap-y-8 min-[451px]:grid-cols-2 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-9">
    {items.map((item) => (
      <MediaCard key={item.id} item={item} />
    ))}
  </div>
);

const useYoutubeFeed = () =>
  useQuery({
    queryKey: ["youtube-videos"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("youtube-videos");
      if (error) throw error;
      return (data ?? {}) as YoutubeFeed;
    },
  });

const SpeakingPage = () => {
  const { data, isLoading, isError } = useYoutubeFeed();

  const liveVideos = (data?.videos ?? []).map(normaliseVideo);
  const usingFallback = !isLoading && (isError || liveVideos.length === 0);
  const personal = usingFallback ? PERSONAL_FALLBACK : liveVideos;
  const talks = personal.filter((v) => !v.isShort);
  const shorts = personal.filter((v) => v.isShort);
  const techdrive = mergeVideos(data?.techdrive?.episodes ?? [], TECHDRIVE_FALLBACK);
  const latestEpisodes = techdrive.slice(0, 6);
  const olderEpisodes = techdrive.slice(6);

  return (
    <>
      <PageMeta
        path="/speaking"
        title="Speaking | Dr. Justinas Mišeikis"
        description="Keynotes, panels and workshops on physical AI, research commercialisation and technology partnerships. Based in Switzerland, delivered in English."
        ogTitle="Speaking"
        ogSubtitle="DR. JUSTINAS MIŠEIKIS · SPEAKING"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(PERSON_JSON_LD)}</script>
        <script type="application/ld+json">{JSON.stringify(PODCAST_JSON_LD)}</script>
      </Helmet>
      <PageHero
        eyebrow="Keynotes | Panels | Workshops"
        title="AI and robotics, with technical depth and business context."
        lead="Practical perspectives for audiences making decisions about physical AI, innovation and research commercialisation."
      >
        <Actions>
          <ButtonLink href={contactPath("speaking")}>Enquire about speaking</ButtonLink>
          <ButtonLink href="#recordings" variant="secondary">
            Watch a talk
          </ButtonLink>
        </Actions>
      </PageHero>

      <section
        id="recordings"
        className="site-wrap grid grid-cols-1 items-center gap-7 pb-7 pt-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-12"
        aria-labelledby="featured-talk-title"
      >
        <MediaCard item={FEATURED_TALK} featured />
        <div>
          <Eyebrow>Featured stage recording | CAIRO Forum, Zürich</Eyebrow>
          <h2 id="featured-talk-title" className="h2">
            Physical AI goes corporate.
          </h2>
          <p className="mt-4 max-w-[50ch] text-muted-foreground">
            Watch a recorded talk to get a sense of the ideas, depth and delivery.
          </p>
          <Actions>
            <ButtonLink href={FEATURED_TALK.url} variant="secondary">
              Watch the talk
            </ButtonLink>
          </Actions>
        </div>
      </section>

      <section className="site-wrap section-y" aria-labelledby="topics-title">
        <SectionHead id="topics-title" eyebrow="Signature topics" title="Designed around your audience." />
        <div data-testid="signature-topics">
          {SIGNATURE_TOPICS.map((topic, index) => (
            <ServiceRow key={topic.title} number={`0${index + 1}`} title={topic.title} fine={topic.audience}>
              <p>{topic.description}</p>
              <ul>
                {topic.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </ServiceRow>
          ))}
        </div>
        <details className="mt-9 border-y border-border">
          <summary className="py-5 text-[15px] font-semibold text-foreground">Explore the wider topic catalogue</summary>
          <div className="grid grid-cols-1 gap-7 pb-8 pt-2 sm:grid-cols-2 sm:gap-8">
            {WIDER_TOPICS.map((topic) => (
              <article key={topic.title} className="min-w-0">
                <h3 className="text-lg leading-tight">{topic.title}</h3>
                <p className="mt-2 text-[15px] text-muted-foreground">{topic.description}</p>
              </article>
            ))}
          </div>
        </details>
      </section>

      <section className="section-y bg-muted" aria-labelledby="engagements-title">
        <div className="site-wrap">
          <SectionHead id="engagements-title" eyebrow="Selected past engagements" title="Conversations across technology and business." />
          <ul className="grid list-none grid-cols-1 gap-x-10 p-0 md:grid-cols-2">
            {PAST_ENGAGEMENTS.map((event) => (
              <li key={event} className="border-b border-border py-4 text-sm text-foreground">
                {event}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="site-wrap section-y" aria-labelledby="talks-title">
        <SectionHead id="talks-title" eyebrow="Talks & interviews" title="Watch the work." />
        {isLoading ? (
          <p role="status" className="text-muted-foreground">
            Loading the latest recordings…
          </p>
        ) : (
          <>
            {usingFallback && (
              <p className="fine" role="status">
                The live video feed is unavailable right now, so recordings captured on 6 October 2026 are shown. Browse the{" "}
                <SmartLink href={YOUTUBE_CHANNEL_URL} className="underline underline-offset-4">
                  YouTube channel
                </SmartLink>{" "}
                for the latest uploads.
              </p>
            )}
            {talks.length > 0 ? (
              <MediaGrid items={talks} />
            ) : (
              <p className="text-muted-foreground">No talks are available right now. The channel has the latest uploads.</p>
            )}
            {shorts.length > 0 && (
              <details className="mt-10 border-y border-border">
                <summary className="py-5 text-[15px] font-semibold text-foreground">
                  Shorts & quick insights ({shorts.length})
                </summary>
                <div className="pb-8">
                  <MediaGrid items={shorts} />
                </div>
              </details>
            )}
          </>
        )}

        <div className="mt-10 max-w-[500px]">
          <Eyebrow>Featured collaboration</Eyebrow>
          {COLLABORATIONS.map((item) => (
            <MediaCard key={item.id} item={item} eyebrow={item.channel} />
          ))}
        </div>
      </section>

      <section id="techdrive" className="section-y bg-muted" aria-labelledby="techdrive-title">
        <div className="site-wrap">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-20">
            <div>
              <Eyebrow>Interviews & media</Eyebrow>
              <h2 id="techdrive-title" className="h2">
                TechDrive Zürich
              </h2>
            </div>
            <div>
              <p className="max-w-[50ch] text-muted-foreground">
                As Founder and Host of TechDrive Zürich, I speak with founders, researchers and operators across the Swiss AI
                and robotics ecosystem.
              </p>
              <Actions>
                <TextLink href={TECHDRIVE_URL}>Visit TechDrive Zürich</TextLink>
                <TextLink href={TECHDRIVE_CHANNEL_URL}>YouTube channel</TextLink>
              </Actions>
            </div>
          </div>
          <MediaGrid items={latestEpisodes} />
          {olderEpisodes.length > 0 && (
            <details className="mt-10 border-y border-border">
              <summary className="py-5 text-[15px] font-semibold text-foreground">
                More episodes ({olderEpisodes.length})
              </summary>
              <div className="pb-8">
                <MediaGrid items={olderEpisodes} />
              </div>
            </details>
          )}
        </div>
      </section>

      <section className="site-wrap section-y" aria-labelledby="formats-title">
        <SectionHead id="formats-title" eyebrow="Formats & booking" title="A format that fits the room." />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
          <RuleBlock title="Keynotes">
            <p>A focused perspective shaped around your audience and event brief.</p>
          </RuleBlock>
          <RuleBlock title="Panels and moderation">
            <p>Technical fluency and clear discussion across research, business and investment.</p>
          </RuleBlock>
          <RuleBlock title="Executive workshops">
            <p>An interactive session built around your organisation's questions and decisions.</p>
          </RuleBlock>
        </div>
        <p className="mt-8 text-muted-foreground">
          Delivered in English. Based in Switzerland; format and location agreed for each engagement.
        </p>
        <Actions>
          <TextLink href={PREMIUM_SPEAKERS_URL}>Book via Premium Speakers</TextLink>
          <TextLink href={YOUTUBE_CHANNEL_URL}>Personal YouTube channel</TextLink>
        </Actions>
        <Note title="Company representation at Swiss events">
          <p>
            Looking for local presence on behalf of your company? A separate advisory brief can cover event preparation,
            agreed representation, technical messaging and follow-up. Event access, sponsorship and speaking slots are agreed
            with organisers.
          </p>
          <div className="mt-4">
            <TextLink href="/advisory#swiss-presence">Explore Swiss representation</TextLink>
          </div>
        </Note>
      </section>

      <ContactCta
        title="What should your audience take away?"
        lead="Tell me about your audience, event, date and the ideas you want to explore."
        intent="speaking"
        label="Enquire about speaking"
      />
    </>
  );
};

export default SpeakingPage;
