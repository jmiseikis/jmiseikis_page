import { Quote } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      quote: "Justinas brings a rare combination of deep technical expertise and strategic business acumen. His ability to translate complex AI research into actionable commercial strategies has been invaluable.",
      author: "Technology Executive",
      role: "Fortune 500 Company",
      company: "Global Tech Leader",
    },
    {
      quote: "Working with Justinas transformed how we approach AI product development. His insights from Sony AI helped us avoid common pitfalls and accelerate our time to market significantly.",
      author: "Startup Founder",
      role: "CEO & Co-founder",
      company: "AI Robotics Startup",
    },
    {
      quote: "As a keynote speaker, Justinas delivered exactly what our audience needed: technical depth without jargon, strategic frameworks with real-world examples. Highly recommended.",
      author: "Event Organizer",
      role: "Conference Director",
      company: "Swiss Robotics Day",
    },
    {
      quote: "His mentorship during our growth phase was crucial. Justinas helped us build a world-class deep tech team and establish partnerships with major industry players.",
      author: "CTO",
      role: "Chief Technology Officer",
      company: "Industrial AI Company",
    },
  ];

  return (
    <section id="testimonials" className="section-padding bg-secondary/30">
      <div className="container px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-16 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              What People <span className="text-primary">Say</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Feedback from partners, clients, and event organizers across the innovation ecosystem
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-card p-8 border-2 border-border hover:border-primary transition-all duration-300 group"
              >
                <Quote className="w-10 h-10 text-primary mb-6 group-hover:scale-110 transition-transform" />
                <blockquote className="text-lg mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div className="border-t-2 border-border pt-4">
                  <div className="font-bold text-foreground">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  <div className="text-sm text-primary font-medium mt-1">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Partner Logos Placeholder */}
          <div className="mt-16 pt-16 border-t-2 border-border">
            <div className="text-center mb-8">
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                Trusted By Leading Organizations
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-50">
              {['Sony AI', 'ETH Zürich', 'F&P Robotics', 'Quantic'].map((org, index) => (
                <div key={index} className="text-center font-bold text-xl text-muted-foreground">
                  {org}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
