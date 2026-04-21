import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Play, Youtube, Mic, Video, Mail, Award } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface VideoItem {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  publishedAt: string;
  isShort: boolean;
  views: number;
}

const CHANNEL_URL = "https://www.youtube.com/@JustinasMiseikis";
const PREMIUM_SPEAKERS_URL = "https://premium-speakers.com/en/speaker-presenter/justinas-miseikis/";

const openExternal = (url: string) => (e: React.MouseEvent) => {
  e.preventDefault();
  window.open(url, "_blank", "noopener,noreferrer");
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const topics = [
  {
    title: "Startup and Corporation Collaboration",
    description: "What are the pitfalls, and how to avoid them? Practical lessons on partnerships, pilots, and joint value creation.",
    audiences: ["Corporate Innovation", "Startup Forums", "Open Innovation"],
  },
  {
    title: "AI Commercialization & Ethics",
    description: "From research lab to market leadership: strategies for turning AI breakthroughs into business value while addressing ethical considerations.",
    audiences: ["Tech Conferences", "Corporate Events", "Startup Forums"],
  },
  {
    title: "Scaling AI from Pilots to Real Business Impact",
    description: "How to move beyond proof-of-concepts and embed AI into core operations to deliver measurable ROI.",
    audiences: ["Enterprise Leadership", "Digital Transformation", "C-Suite Forums"],
  },
  {
    title: "Physical AI and Robotics",
    description: "The next wave of innovation: how embodied AI and robotics are reshaping industries from manufacturing to healthcare.",
    audiences: ["Industry Events", "Robotics Summits", "Innovation Forums"],
  },
  {
    title: "Strategic Use of AI for Sustainable Value Creation",
    description: "Long-term AI strategy that aligns business goals with sustainability, governance, and stakeholder value.",
    audiences: ["Executive Events", "ESG Forums", "Strategy Conferences"],
  },
  {
    title: "Bringing Research to Commercialization",
    description: "Balancing cutting-edge research with commercial realities: lessons from Sony AI and beyond.",
    audiences: ["Executive Events", "MBA Programs", "Corporate Strategy"],
  },
  {
    title: "Investment & Due Diligence in Deep Tech",
    description: "Evaluating AI and robotics ventures: what investors need to know beyond the hype.",
    audiences: ["VC Forums", "Investment Conferences", "Corporate Investors"],
  },
  {
    title: "Future of Human-Robot Interaction",
    description: "How robots are becoming collaborative partners across industries, from healthcare to manufacturing.",
    audiences: ["Industry Events", "Academic Conferences", "Innovation Summits"],
  },
];

const pastEvents = [
  "LOGIN Conference (biggest tech event in Baltics)",
  "Innovation Roundtable",
  "ETH Zürich & ETH Entrepreneurship Club",
  "Sony AI Conference",
  "VentureLab Engineering Ecosystem Event",
];

const SpeakingPage = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke("youtube-videos");
        if (fnError) throw fnError;
        if (!cancelled) setVideos((data?.videos ?? []) as VideoItem[]);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load videos");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const longForm = videos.filter((v) => !v.isShort);
  const shorts = videos.filter((v) => v.isShort);

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>AI Keynote Speaker & Talks | Dr. Justinas Mišeikis – Zurich, Europe</title>
        <meta name="description" content="Watch keynotes by Dr. Justinas Mišeikis on AI, robotics, and innovation, and book him for your next conference. Available across DACH and Europe — partnerships with Greater Zurich Area and Swisscom Ventures." />
        <meta name="keywords" content="AI keynote speaker, robotics speaker Europe, AI conference speaker Zurich, technology keynote DACH, innovation speaker, computer vision speaker, deep tech speaker, Greater Zurich Area, Swisscom Ventures" />
        <link rel="canonical" href="https://jmiseikis.lovable.app/speaking" />
        <meta property="og:title" content="AI Keynote Speaker | Dr. Justinas Mišeikis" />
        <meta property="og:description" content="Watch keynote talks and book a speaker on AI, robotics, and innovation for your conference or corporate event." />
        <meta property="og:image" content="https://jmiseikis.lovable.app/og-image.png" />
        <meta property="og:type" content="video.other" />
      </Helmet>

      <Navigation />

      <main className="pt-32 pb-16">
        <div className="container px-4 max-w-6xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          {/* Header */}
          <div className="mb-12">
            <span className="text-primary font-medium tracking-wider uppercase text-sm">
              Keynote Speaking & Public Speaking
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
              Insights That <span className="text-primary">Inspire Action</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mb-8 leading-relaxed">
              Engaging keynotes and talks on AI strategy, robotics, computer vision, and innovation.
              Available for conferences, corporate events, panels, and workshops across Europe.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="swiss">
                <Link to="/#contact">
                  <Mail className="w-4 h-4" />
                  Book Directly
                </Link>
              </Button>
              <Button asChild variant="outline">
                <a href={PREMIUM_SPEAKERS_URL} target="_blank" rel="noopener noreferrer" onClick={openExternal(PREMIUM_SPEAKERS_URL)}>
                  <Award className="w-4 h-4" />
                  Book at Premium Speakers Agency
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer" onClick={openExternal(CHANNEL_URL)}>
                  <Youtube className="w-4 h-4" />
                  YouTube Channel
                </a>
              </Button>
            </div>
          </div>

          {/* Videos: Talks & Interviews */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
              <span className="w-1 h-7 bg-primary" />
              Talks & Interviews
            </h2>

            {loading && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="border-2 border-border bg-card animate-pulse">
                    <div className="aspect-video bg-muted" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-muted w-3/4" />
                      <div className="h-3 bg-muted w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && !loading && (
              <div className="border-2 border-destructive bg-card p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Couldn't load the latest videos. You can still browse them directly on YouTube.
                </p>
                <Button asChild variant="outline">
                  <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer" onClick={openExternal(CHANNEL_URL)}>
                    <Youtube className="w-4 h-4" /> Open YouTube Channel
                  </a>
                </Button>
              </div>
            )}

            {!loading && !error && longForm.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {longForm.map((v) => (
                  <VideoCard key={v.id} video={v} aspect="aspect-video" />
                ))}
              </div>
            )}

            {!loading && !error && longForm.length === 0 && (
              <p className="text-muted-foreground">No talks available right now — check the channel for the latest uploads.</p>
            )}
          </section>

          {/* Shorts */}
          {!loading && !error && shorts.length > 0 && (
            <section className="mb-16">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                <span className="w-1 h-7 bg-primary" />
                Shorts & Quick Insights
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {shorts.map((v) => (
                  <VideoCard key={v.id} video={v} aspect="aspect-[9/16]" />
                ))}
              </div>
            </section>
          )}

          {/* Speaking Topics */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
              <span className="w-1 h-7 bg-primary" />
              Speaking Topics
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {topics.map((topic, index) => (
                <div key={index} className="bg-card p-6 border-2 border-border hover:border-primary transition-all duration-300 group">
                  <div className="flex items-start gap-4 mb-4">
                    <Mic className="w-6 h-6 text-primary flex-shrink-0 mt-1 group-hover:scale-110 transition-transform" />
                    <div>
                      <h3 className="text-lg font-bold mb-2">{topic.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{topic.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-10">
                    {topic.audiences.map((audience, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-secondary text-secondary-foreground">{audience}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Past Events */}
          <section className="mb-16">
            <div className="bg-card p-8 border-2 border-border">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Video className="w-6 h-6 text-primary" />
                Past Speaking Engagements
              </h2>
              <div className="space-y-3">
                {pastEvents.map((event, index) => (
                  <div key={index} className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span>{event}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section>
            <div className="bg-primary text-primary-foreground p-8 md:p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Looking for a speaker who bridges tech and business?</h2>
              <p className="text-primary-foreground/90 mb-8 text-lg max-w-2xl mx-auto">
                Available for keynotes, panels, workshops, and corporate events across Europe.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button asChild size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  <Link to="/#contact">
                    <Mail className="w-4 h-4" />
                    Book Directly
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  <a href={PREMIUM_SPEAKERS_URL} target="_blank" rel="noopener noreferrer" onClick={openExternal(PREMIUM_SPEAKERS_URL)}>
                    <Award className="w-4 h-4" />
                    Premium Speakers Agency
                  </a>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const VideoCard = ({ video, aspect }: { video: VideoItem; aspect: string }) => (
  <a
    href={video.url}
    target="_blank"
    rel="noopener noreferrer"
    onClick={openExternal(video.url)}
    className="group border-2 border-border bg-card hover:border-primary transition-all duration-300 flex flex-col"
  >
    <div className={`relative ${aspect} overflow-hidden bg-muted`}>
      <img
        src={video.thumbnail}
        alt={video.title}
        loading="lazy"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors flex items-center justify-center">
        <div className="w-14 h-14 bg-primary/95 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="w-6 h-6 text-primary-foreground fill-primary-foreground ml-1" />
        </div>
      </div>
      {video.isShort && (
        <span className="absolute top-2 left-2 text-xs font-medium px-2 py-1 bg-primary text-primary-foreground">
          Short
        </span>
      )}
    </div>
    <div className="p-4 flex-1 flex flex-col">
      <h3 className="font-semibold leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
        {video.title}
      </h3>
      <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground pt-2">
        <span>{formatDate(video.publishedAt)}</span>
        <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  </a>
);

export default SpeakingPage;
