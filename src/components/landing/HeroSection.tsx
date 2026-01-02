import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Users, Leaf, ShieldCheck } from "lucide-react";
import heroImage from "@/assets/hero-produce.jpg";

const stats = [
  { label: "Active Farmers", value: "50,000+", icon: Users },
  { label: "Produce Listed", value: "1M+", icon: Leaf },
  { label: "Fair Price Guarantee", value: "100%", icon: ShieldCheck },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Fresh organic produce from local farmers"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/95 via-foreground/80 to-foreground/40" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-2xl">
          <Badge variant="accent" className="mb-6 animate-fade-up">
            <TrendingUp className="w-3 h-3 mr-1" />
            Trusted by 50,000+ farmers across India
          </Badge>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-background mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Farm Fresh, <br />
            <span className="text-primary">Direct to You</span>
          </h1>

          <p className="text-lg md:text-xl text-background/80 mb-8 leading-relaxed animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Connect directly with local farmers. No middlemen, fair prices, and the freshest produce delivered from farm to your table.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Button size="xl" variant="accent" asChild>
              <Link to="/marketplace">
                Explore Marketplace
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button size="xl" variant="hero-outline" asChild>
              <Link to="/farmer/register">
                Join as Farmer
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            {stats.map((stat) => (
              <div key={stat.label} className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <stat.icon className="w-5 h-5 text-primary" />
                  <span className="text-2xl md:text-3xl font-bold text-background">{stat.value}</span>
                </div>
                <span className="text-sm text-background/60">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
}
