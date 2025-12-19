import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sprout, Store, Users } from "lucide-react";

const roles = [
  {
    icon: Sprout,
    title: "I'm a Farmer",
    description: "List your produce, set your prices, and connect with buyers directly.",
    href: "/farmer/register",
    buttonText: "Start Selling",
  },
  {
    icon: Users,
    title: "I'm a Consumer",
    description: "Browse fresh produce from local farms and order directly.",
    href: "/auth?mode=signup&role=buyer",
    buttonText: "Start Buying",
  },
];

export function CTASection() {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your <span className="text-primary">Agricultural Trade</span>?
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of farmers and buyers already using AgriMart for fair, transparent trade.
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {roles.map((role, index) => (
            <div
              key={role.title}
              className="bg-background rounded-3xl p-8 shadow-elevated text-center animate-fade-up hover:-translate-y-2 transition-transform"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <role.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{role.title}</h3>
              <p className="text-muted-foreground mb-6">{role.description}</p>
              <Button variant="outline" className="w-full" asChild>
                <Link to={role.href}>
                  {role.buttonText}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            Already have an account?{" "}
            <Link to="/auth" className="text-primary font-medium hover:underline">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
