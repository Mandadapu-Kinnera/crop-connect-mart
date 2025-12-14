import { Card, CardContent } from "@/components/ui/card";
import { 
  Handshake, 
  MapPin, 
  MessageSquare, 
  TrendingUp, 
  Shield, 
  Globe,
  Truck,
  LineChart
} from "lucide-react";

const features = [
  {
    icon: Handshake,
    title: "Direct Trade",
    description: "Connect farmers directly with buyers, eliminating middlemen and ensuring fair prices for everyone.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: MapPin,
    title: "Location-Based Discovery",
    description: "Find farmers near you with GPS-enabled search. Fresh produce, shorter delivery times.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: MessageSquare,
    title: "Real-Time Negotiation",
    description: "In-app messaging for price negotiation. Agree on terms directly with farmers or buyers.",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: TrendingUp,
    title: "Smart Pricing",
    description: "AI-powered price suggestions based on local mandi rates and market demand.",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    icon: Shield,
    title: "Verified Profiles",
    description: "All farmers and buyers are verified. Trade with confidence on a trusted platform.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    description: "Available in English, Hindi, Telugu, and more regional languages for easy access.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Truck,
    title: "Order Tracking",
    description: "Real-time order status updates from farm to delivery. Know exactly where your produce is.",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: LineChart,
    title: "Analytics Dashboard",
    description: "Track sales, demand patterns, and earnings. Make data-driven decisions for your farm.",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need for <span className="text-primary">Fair Trade</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A complete digital marketplace designed specifically for farmers and buyers to trade agricultural produce efficiently.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              variant="elevated"
              className="animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
