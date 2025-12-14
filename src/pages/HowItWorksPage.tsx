import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Package, ShoppingCart, Truck } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Register & Create Profile",
    description: "Sign up as a farmer, consumer, or retailer. Complete your profile with location and preferences.",
  },
  {
    icon: Package,
    title: "List or Browse Produce",
    description: "Farmers list their fresh produce with prices. Buyers browse categories and search for items.",
  },
  {
    icon: ShoppingCart,
    title: "Negotiate & Order",
    description: "Connect directly with farmers. Negotiate prices and place orders with secure transactions.",
  },
  {
    icon: Truck,
    title: "Delivery & Payment",
    description: "Track your order in real-time. Receive fresh produce and complete secure payment.",
  },
];

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                How AgriMart Works
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A simple 4-step process to connect farmers directly with buyers, ensuring fair prices and fresh produce.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <Card key={index} variant="elevated" className="relative">
                  <CardContent className="pt-8 pb-6 text-center">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <step.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Benefits for Everyone</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center p-6">
                <h3 className="text-xl font-semibold text-primary mb-3">For Farmers</h3>
                <ul className="text-muted-foreground space-y-2">
                  <li>• Direct access to buyers</li>
                  <li>• Better prices for produce</li>
                  <li>• No middleman fees</li>
                  <li>• Real-time market insights</li>
                </ul>
              </Card>
              <Card className="text-center p-6">
                <h3 className="text-xl font-semibold text-primary mb-3">For Consumers</h3>
                <ul className="text-muted-foreground space-y-2">
                  <li>• Fresh farm produce</li>
                  <li>• Lower prices</li>
                  <li>• Know your farmer</li>
                  <li>• Quality assurance</li>
                </ul>
              </Card>
              <Card className="text-center p-6">
                <h3 className="text-xl font-semibold text-primary mb-3">For Retailers</h3>
                <ul className="text-muted-foreground space-y-2">
                  <li>• Bulk purchasing options</li>
                  <li>• Consistent supply</li>
                  <li>• Competitive pricing</li>
                  <li>• Invoice management</li>
                </ul>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorksPage;
