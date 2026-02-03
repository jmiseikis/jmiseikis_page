import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Advisory from "@/components/Advisory";
import Speaking from "@/components/Speaking";
import Publications from "@/components/Publications";
import Resources from "@/components/Resources";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <Hero />
        <About />
        <Advisory />
        <Speaking />
        <Publications />
        <Resources />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
