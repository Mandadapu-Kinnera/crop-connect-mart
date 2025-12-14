import { Badge } from "@/components/ui/badge";
import { UserPlus, Package, MessageCircle, Truck } from "lucide-react";
import farmerImage from "@/assets/farmer-portrait.jpg";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Register & Verify",
    description: "Create your account as a farmer, buyer, or retailer. Get verified to start trading.",
  },
  {
    number: "02",
    icon: Package,
    title: "List or Browse",
    description: "Farmers list their produce with prices. Buyers browse fresh items from local farms.",
  },
  {
    number: "03",
    icon: MessageCircle,
    title: "Negotiate & Order",
    description: "Chat directly, negotiate prices, and place orders with mutual agreement.",
  },
  {
    number: "04",
    icon: Truck,
    title: "Deliver & Pay",
    description: "Track your order, receive fresh produce, and complete secure payment.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-muted/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Image */}
          <div className="relative animate-fade-up">
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-elevated">
              <img
                src={farmerImage}
                alt="Happy farmer with fresh produce"
                className="w-full h-[500px] object-cover"
              />
            </div>
            {/* Decorative */}
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-primary/20 rounded-3xl -z-10" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-accent/20 rounded-3xl -z-10" />
          </div>

          {/* Right - Content */}
          <div>
            <Badge variant="secondary" className="mb-4">
              Simple Process
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              How <span className="text-primary">AgriMart</span> Works
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              A straightforward 4-step process to connect farmers with buyers and ensure fair, transparent trade.
            </p>

            {/* Steps */}
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className="flex gap-4 animate-slide-in-right"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-accent">{step.number}</span>
                      <h3 className="font-semibold text-lg">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
