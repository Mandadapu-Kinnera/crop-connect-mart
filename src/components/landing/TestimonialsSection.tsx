import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Ramesh Kumar",
    role: "Farmer, Andhra Pradesh",
    content: "AgriMart changed my life. I now sell directly to restaurants in the city and earn 40% more than before. No more depending on middlemen!",
    rating: 5,
    avatar: "RK",
  },
  {
    name: "Priya Sharma",
    role: "Restaurant Owner, Hyderabad",
    content: "Fresh vegetables delivered straight from farms. The quality is amazing and prices are much better than wholesale markets.",
    rating: 5,
    avatar: "PS",
  },
  {
    name: "Suresh Reddy",
    role: "Farmer, Telangana",
    content: "The smart pricing feature helped me understand market rates. I set competitive prices and my sales increased by 60% in just 3 months.",
    rating: 5,
    avatar: "SR",
  },
  {
    name: "Anita Devi",
    role: "Retailer, Karnataka",
    content: "Bulk buying directly from farmers saves me time and money. The negotiation feature makes it easy to get the best deals.",
    rating: 5,
    avatar: "AD",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by Farmers & Buyers Across India
          </h2>
          <p className="text-lg text-primary-foreground/80">
            Real stories from real people who transformed their agricultural trade with AgriMart.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.name}
              className="bg-primary-foreground/10 border-primary-foreground/20 backdrop-blur-sm animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <Quote className="w-8 h-8 text-primary-foreground/40 mb-4" />
                <p className="text-primary-foreground/90 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-semibold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-primary-foreground/60">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mt-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
