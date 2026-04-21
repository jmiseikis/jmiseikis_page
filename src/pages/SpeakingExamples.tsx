import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Play, Youtube } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Video {
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

const SpeakingExamples = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke("youtube-videos");
        if (fnError) throw fnError;
        if (!cancelled) {
          setVideos((data?.videos ?? []) as Video[]);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load videos");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const longForm = videos.filter((v) => !v.isShort);
  const shorts = videos.filter((v) => v.isShort);

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Speaking Examples — Dr. Justinas Mišeikis | Keynote & Video Library</title>
        <meta
          name="description"
          content="Watch keynote talks, interviews, and short insights from Dr. Justinas Mišeikis on AI, robotics, deep tech investing, and innovation leadership."
        />
        <link rel="canonical" href="https://jmiseikis.lovable.app/speaking-examples" />
        <meta property="og:title" content="Speaking Examples — Dr. Justinas Mišeikis" />
        <meta
          property="og:description"
          content="Talks, interviews, and short insights on AI, robotics, and innovation leadership."
        />
        <meta property="og:type" content="video.other" />
      </Helmet>

      <Navigation />

      <main className="pt-32 pb-20">
        <div className="container px-4 max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <Link
            to="/speaking"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Speaking
          </Link>

          {/* Header */}
          <div className="mb-12">
            <span className="text-primary font-medium tracking-wider uppercase text-sm">
              Speaking Examples
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
              Talks, Interviews & <span className="text-primary">Insights</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mb-6">
              A growing collection of keynote talks, interviews, and short-form insights on AI commercialization,
              robotics, deep tech investing, and innovation leadership. New videos are pulled automatically from
              the YouTube channel.
            </p>
            <Button asChild variant="outline">
              <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer">
                <Youtube className="w-4 h-4" />
                Visit YouTube Channel
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>

          {/* Loading */}
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

          {/* Error */}
          {error && !loading && (
            <div className="border-2 border-destructive bg-card p-8 text-center">
              <p className="text-muted-foreground mb-4">
                Couldn't load the latest videos. You can still browse them directly on YouTube.
              </p>
              <Button asChild variant="outline">
                <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer">
                  <Youtube className="w-4 h-4" />
                  Open YouTube Channel
                </a>
              </Button>
            </div>
          )}

          {/* Long-form videos */}
          {!loading && !error && longForm.length > 0 && (
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-1 h-6 bg-primary" />
                Talks & Interviews
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {longForm.map((v) => (
                  <VideoCard key={v.id} video={v} aspect="aspect-video" />
                ))}
              </div>
            </section>
          )}

          {/* Shorts */}
          {!loading && !error && shorts.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-1 h-6 bg-primary" />
                Shorts & Quick Insights
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {shorts.map((v) => (
                  <VideoCard key={v.id} video={v} aspect="aspect-[9/16]" />
                ))}
              </div>
            </section>
          )}

          {/* Empty */}
          {!loading && !error && videos.length === 0 && (
            <div className="border-2 border-border bg-card p-8 text-center">
              <p className="text-muted-foreground mb-4">No videos available right now.</p>
              <Button asChild variant="outline">
                <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer">
                  <Youtube className="w-4 h-4" />
                  Open YouTube Channel
                </a>
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

const VideoCard = ({ video, aspect }: { video: Video; aspect: string }) => (
  <a
    href={video.url}
    target="_blank"
    rel="noopener noreferrer"
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

export default SpeakingExamples;
