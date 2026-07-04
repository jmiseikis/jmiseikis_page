import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const SwissTechPulseAbout = () => (
  <div className="min-h-screen bg-white text-[#0E0E10]">
    <Helmet>
      <title>About Swiss Tech Pulse — Sources & Methodology</title>
      <meta name="description" content="How the Swiss Tech Pulse feed is built: sources, aggregation, and editorial process." />
      <link rel="canonical" href="https://jmiseikis.lovable.app/resources/swiss-tech-pulse/about" />
    </Helmet>
    <Navigation />
    <main className="container mx-auto px-4 pt-28 pb-16 max-w-3xl">
      <h1 className="font-anton uppercase text-5xl md:text-6xl leading-none">
        About <span className="text-[#EC1313]">Swiss Tech Pulse</span>
      </h1>
      <div className="mt-8 space-y-5 font-barlow text-[17px] leading-relaxed text-[#0E0E10]/85">
        <p>
          I built Swiss Tech Pulse to keep myself honest. Every week I get asked what is happening in the Swiss
          startup ecosystem, and every week I have to piece the answer together from a dozen different sources. So I
          automated it — for me, and for you.
        </p>
        <p>
          The feed aggregates commercial register entries (SHAB / Zefix), the leading editorial outlets
          (Startupticker, EU-Startups Switzerland, Tech.eu), university spin-off pages (ETH, EPFL, Venture Kick), and
          the industry associations. Every item links back to its original source — always verify with the original.
        </p>
        <p>
          Summaries are generated with Claude Sonnet from the original headlines and my own extraction pipeline. I
          never reproduce source article text; you always get the link. Items I am not confident about land in a
          review queue that only I can see.
        </p>
        <p>
          Have a source I should add, or an item I got wrong?{" "}
          <Link to="/#contact" className="text-[#EC1313] hover:underline">Get in touch</Link>.
        </p>
      </div>
    </main>
    <Footer />
  </div>
);

export default SwissTechPulseAbout;