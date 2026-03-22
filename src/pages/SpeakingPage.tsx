import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mic, Video } from "lucide-react";

const SpeakingPage = () => {
  const topics = [
    {
      title: "AI Commercialization & Ethics",
      description: "From research lab to market leadership: strategies for turning AI breakthroughs into business value while addressing ethical considerations.",
      audiences: ["Tech Conferences", "Corporate Events", "Startup Forums"],
    },
    {
      title: "Future of Human-Robot Interaction",
      description: "How robots are becoming collaborative partners across industries, from healthcare to manufacturing.",
      audiences: ["Industry Events", "Academic Conferences", "Innovation Summits"],
    },
    {
      title: "Investment & Due Diligence in Deep Tech",
      description: "Evaluating AI and robotics ventures: what investors need to know beyond the hype.",
      audiences: ["VC Forums", "Investment Conferences", "Corporate Investors"],
    },
    {
      title: "Building Deep Tech Teams",
      description: "Attracting, retaining, and leading world-class researchers and engineers in competitive markets.",
      audiences: ["Leadership Forums", "Tech Companies", "Academic Institutions"],
    },
    {
      title: "Bringing Research to Commercialization",
      description: "Balancing cutting-edge research with commercial realities: lessons from Sony AI and beyond.",
      audiences: ["Executive Events", "MBA Programs", "Corporate Strategy"],
    },
    {
      title: "Computer Vision in Industry",
      description: "Practical applications of computer vision and perception systems in manufacturing, logistics, and healthcare.",
      audiences: ["Industry 4.0 Events", "Manufacturing Summits", "Healthcare Tech"],
    },
  ];

  const pastEvents = [
    "LOGIN Conference (biggest tech event in Baltics)",
    "Innovation Roundtable",
    "ETH Zürich & ETH Entrepreneurship Club",
    "Sony AI Conference",
    "VentureLab Engineering Ecosystem Event",
  ];

  return (
    <>
      <Helmet>
        <title>AI Keynote Speaker & Public Speaking | Dr. Justinas Mišeikis – Zurich, Europe</title>
        <meta name="description" content="Book Dr. Justinas Mišeikis as a keynote speaker for AI, robotics, computer vision, and innovation topics. Available for conferences, corporate events, and workshops across DACH and Europe." />
        <meta name="keywords" content="AI keynote speaker, robotics speaker Europe, AI conference speaker Zurich, technology keynote DACH, innovation speaker, computer vision speaker, deep tech speaker, corporate event speaker AI" />
        <link rel="canonical" href="https://jmiseikis.lovable.app/speaking" />
        <meta property="og:title" content="AI Keynote Speaker | Dr. Justinas Mišeikis" />
        <meta property="og:description" content="Book a keynote speaker on AI, robotics, and innovation for your conference or corporate event." />
        <meta property="og:image" content="https://jmiseikis.lovable.app/og-image.png" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-20">
              <Link to="/" className="text-xl font-bold tracking-tight hover:text-primary transition-colors">
                Dr. Justinas Mišeikis
              </Link>
              <Link to="/#contact">
                <Button variant="swiss" size="sm">Book a Speaker</Button>
              </Link>
            </div>
          </div>
        </nav>

        <section className="pt-32 pb-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <span className="block text-primary font-medium tracking-wider uppercase text-sm mb-4">
              Keynote Speaking & Public Speaking
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Insights That <span className="text-primary">Inspire Action</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
              Engaging keynotes and talks on AI strategy, robotics, computer vision, and innovation.
              Available for conferences, corporate events, panels, and workshops across Europe.
            </p>
          </div>
        </section>

        <section className="py-16 bg-secondary/30 px-4">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold mb-8">Speaking Topics</h2>
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
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto max-w-5xl">
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
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto max-w-3xl">
            <div className="bg-primary text-primary-foreground p-8 md:p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Looking for a speaker who bridges tech and business?</h2>
              <p className="text-primary-foreground/90 mb-8 text-lg">
                Available for keynotes, panels, workshops, and corporate events across Europe.
              </p>
              <Link to="/#contact">
                <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  Book a Speaker
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <footer className="py-8 border-t border-border px-4">
          <div className="container mx-auto text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Dr. Justinas Mišeikis. Zurich, Switzerland.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default SpeakingPage;
