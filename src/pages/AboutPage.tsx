import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Heart, Award, Sprout, HandshakeIcon } from "lucide-react";

const team = [
  { name: "Rajesh Kumar", role: "Founder & CEO", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh" },
  { name: "Priya Sharma", role: "Head of Operations", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya" },
  { name: "Anil Reddy", role: "CTO", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anil" },
  { name: "Lakshmi Devi", role: "Farmer Relations", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lakshmi" },
];

const values = [
  {
    icon: Heart,
    title: "Farmer First",
    description: "Every decision we make starts with one question: How does this help farmers?",
  },
  {
    icon: HandshakeIcon,
    title: "Fair Trade",
    description: "We believe in transparent pricing and fair compensation for agricultural produce.",
  },
  {
    icon: Sprout,
    title: "Sustainability",
    description: "Promoting sustainable farming practices and reducing food waste in the supply chain.",
  },
  {
    icon: Award,
    title: "Quality",
    description: "Ensuring fresh, quality produce reaches consumers directly from the farm.",
  },
];

const milestones = [
  { year: "2022", event: "AgriMart founded in Hyderabad" },
  { year: "2023", event: "Reached 10,000 registered farmers" },
  { year: "2023", event: "Expanded to 5 states across India" },
  { year: "2024", event: "Launched retailer bulk ordering platform" },
  { year: "2024", event: "100,000+ successful transactions" },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              About AgriMart
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're on a mission to revolutionize agricultural trade in India by connecting farmers directly 
              with consumers and retailers, ensuring fair prices and fresh produce for all.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card variant="elevated" className="p-8">
                <Target className="w-12 h-12 text-primary mb-4" />
                <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                <p className="text-muted-foreground">
                  To empower Indian farmers by providing direct market access, eliminating middlemen, 
                  and ensuring they receive fair prices for their hard work. We aim to create a 
                  transparent and efficient agricultural marketplace.
                </p>
              </Card>
              <Card variant="elevated" className="p-8">
                <Users className="w-12 h-12 text-primary mb-4" />
                <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
                <p className="text-muted-foreground">
                  A future where every farmer has access to technology-driven market solutions, 
                  every consumer enjoys farm-fresh produce at fair prices, and the agricultural 
                  supply chain is sustainable and waste-free.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="text-center p-6">
                  <value.icon className="w-10 h-10 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Journey</h2>
            <div className="max-w-2xl mx-auto">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-4 mb-6">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-primary" />
                    {index < milestones.length - 1 && (
                      <div className="w-0.5 h-full bg-primary/30 mt-1" />
                    )}
                  </div>
                  <div className="pb-6">
                    <span className="text-sm font-semibold text-primary">{milestone.year}</span>
                    <p className="text-foreground">{milestone.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {team.map((member, index) => (
                <Card key={index} className="text-center p-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 bg-muted"
                  />
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-4xl font-bold text-primary">15,000+</p>
                <p className="text-muted-foreground">Registered Farmers</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary">50,000+</p>
                <p className="text-muted-foreground">Happy Customers</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary">8</p>
                <p className="text-muted-foreground">States Covered</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary">₹5Cr+</p>
                <p className="text-muted-foreground">Farmer Earnings</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
