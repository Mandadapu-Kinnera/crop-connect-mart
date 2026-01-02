import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, Phone, Mail, MessageCircle, FileText, ShoppingCart, User, Shield } from "lucide-react";

const faqs = [
  {
    category: "Getting Started",
    icon: User,
    questions: [
      {
        q: "How do I register as a farmer on AgriMart?",
        a: "Click on 'Join as Farmer' from the homepage, fill in your personal details, farm information, and upload required documents. Our team will verify your profile within 24-48 hours.",
      },
      {
        q: "What documents are required for farmer registration?",
        a: "You'll need to provide: Aadhaar card, land ownership documents or lease agreement, bank account details, and a recent photograph.",
      },
      {
        q: "Can I use AgriMart without registering?",
        a: "You can browse products without registration, but you need to create an account to place orders or list products for sale.",
      },
    ],
  },
  {
    category: "Buying & Selling",
    icon: ShoppingCart,
    questions: [
      {
        q: "How do I list my produce for sale?",
        a: "After logging in, go to your dashboard and click 'Add Product'. Fill in the product details, upload clear photos, set your price, and specify available quantity.",
      },
      {
        q: "Can I negotiate prices with farmers?",
        a: "Yes! You can use our in-app chat feature to discuss prices directly with farmers. Many farmers are open to negotiation for bulk orders.",
      },
      {
        q: "What payment methods are accepted?",
        a: "We support UPI, net banking, credit/debit cards, and cash on delivery for eligible orders.",
      },
    ],
  },
  {
    category: "Orders & Delivery",
    icon: FileText,
    questions: [
      {
        q: "How can I track my order?",
        a: "Go to 'My Orders' in your account dashboard. You'll see real-time status updates from order confirmation to delivery.",
      },
      {
        q: "What if I receive damaged or wrong products?",
        a: "Contact our support team within 24 hours of delivery with photos of the issue. We'll arrange for a refund or replacement.",
      },
      {
        q: "Is there a minimum order value?",
        a: "Minimum order value varies by seller. Check the product listing for specific requirements.",
      },
    ],
  },
  {
    category: "Account & Security",
    icon: Shield,
    questions: [
      {
        q: "How do I reset my password?",
        a: "Click 'Forgot Password' on the login page, enter your registered email/phone, and follow the instructions sent to you.",
      },
      {
        q: "Is my personal information secure?",
        a: "Yes, we use industry-standard encryption to protect your data. We never share your personal information with third parties without consent.",
      },
      {
        q: "How do I delete my account?",
        a: "Contact our support team at support@agrimart.com with your account deletion request. We'll process it within 7 working days.",
      },
    ],
  },
];

const HelpCenterPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFaqs = faqs
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.a.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((category) => category.questions.length > 0);

  return (
    <div className="min-h-screen flex flex-col bg-background pt-20">
      <Header showLinks={false} />
      <main className="flex-1">
        <section className="py-12 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Help Center
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Find answers to common questions or reach out to our support team.
              </p>
            </div>

            <div className="max-w-xl mx-auto mb-12">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search for help..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 py-6 text-lg"
                />
              </div>
            </div>

            {/* Contact Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <Phone className="w-10 h-10 text-primary mx-auto mb-3" />
                <CardTitle className="text-lg mb-2">Call Us</CardTitle>
                <p className="text-muted-foreground mb-3">Mon-Sat, 9 AM - 6 PM</p>
                <a href="tel:1800-123-4567" className="text-primary font-semibold">
                  1800-123-4567
                </a>
              </Card>
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <Mail className="w-10 h-10 text-primary mx-auto mb-3" />
                <CardTitle className="text-lg mb-2">Email Us</CardTitle>
                <p className="text-muted-foreground mb-3">We reply within 24 hours</p>
                <a href="mailto:support@agrimart.com" className="text-primary font-semibold">
                  support@agrimart.com
                </a>
              </Card>
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <MessageCircle className="w-10 h-10 text-primary mx-auto mb-3" />
                <CardTitle className="text-lg mb-2">Live Chat</CardTitle>
                <p className="text-muted-foreground mb-3">Chat with our team</p>
                <Button variant="outline">Start Chat</Button>
              </Card>
            </div>

            {/* FAQs */}
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>

              {filteredFaqs.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No results found for "{searchTerm}"</p>
                </Card>
              ) : (
                filteredFaqs.map((category, index) => (
                  <Card key={index} className="mb-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <category.icon className="w-5 h-5 text-primary" />
                        {category.category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible>
                        {category.questions.map((faq, faqIndex) => (
                          <AccordionItem key={faqIndex} value={`item-${index}-${faqIndex}`}>
                            <AccordionTrigger className="text-left">
                              {faq.q}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                              {faq.a}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HelpCenterPage;
