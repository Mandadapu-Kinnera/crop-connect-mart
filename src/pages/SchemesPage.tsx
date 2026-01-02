import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ExternalLink, FileText, IndianRupee } from "lucide-react";

interface Scheme {
  id: string;
  name: string;
  description: string;
  eligibility: string;
  benefits: string;
  category: string;
  state: string;
  url: string;
}

const governmentSchemes: Scheme[] = [
  {
    id: "1",
    name: "PM-KISAN",
    description: "Pradhan Mantri Kisan Samman Nidhi provides income support of ₹6,000 per year to all farmer families.",
    eligibility: "All landholding farmer families",
    benefits: "₹6,000 per year in three installments",
    category: "Income Support",
    state: "All India",
    url: "https://pmkisan.gov.in/",
  },
  {
    id: "2",
    name: "PM Fasal Bima Yojana",
    description: "Crop insurance scheme to provide financial support to farmers suffering crop loss/damage.",
    eligibility: "All farmers growing notified crops",
    benefits: "Insurance coverage for crop loss",
    category: "Insurance",
    state: "All India",
    url: "https://pmfby.gov.in/",
  },
  {
    id: "3",
    name: "Kisan Credit Card",
    description: "Provides farmers with affordable credit for their agricultural needs.",
    eligibility: "All farmers, fishermen, animal husbandry farmers",
    benefits: "Credit at 4% interest rate",
    category: "Credit",
    state: "All India",
    url: "https://www.india.gov.in/spotlight/kisan-credit-card",
  },
  {
    id: "4",
    name: "Soil Health Card Scheme",
    description: "Provides soil health cards to farmers with crop-wise nutrient recommendations.",
    eligibility: "All farmers",
    benefits: "Free soil testing and recommendations",
    category: "Agricultural Support",
    state: "All India",
    url: "https://soilhealth.dac.gov.in/",
  },
  {
    id: "5",
    name: "e-NAM",
    description: "Electronic National Agriculture Market for transparent price discovery and online trading.",
    eligibility: "All farmers and traders",
    benefits: "Better price realization, reduced marketing costs",
    category: "Market Access",
    state: "All India",
    url: "https://enam.gov.in/",
  },
  {
    id: "6",
    name: "Rythu Bandhu (Telangana)",
    description: "Investment support scheme providing ₹10,000 per acre per year to farmers.",
    eligibility: "All landholding farmers in Telangana",
    benefits: "₹10,000 per acre per year",
    category: "Income Support",
    state: "Telangana",
    url: "https://treasury.telangana.gov.in/",
  },
];

const SchemesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredSchemes, setFilteredSchemes] = useState<Scheme[]>(governmentSchemes);

  const categories = ["All", ...new Set(governmentSchemes.map((s) => s.category))];

  useEffect(() => {
    let result = governmentSchemes;

    if (searchTerm) {
      result = result.filter(
        (scheme) =>
          scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          scheme.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "All") {
      result = result.filter((scheme) => scheme.category === selectedCategory);
    }

    setFilteredSchemes(result);
  }, [searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen flex flex-col bg-background pt-20">
      <Header showLinks={false} />
      <main className="flex-1">
        <section className="py-12 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Government Schemes for Farmers
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore central and state government schemes designed to support farmers with financial aid, insurance, and resources.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-3xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search schemes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSchemes.map((scheme) => (
                <Card key={scheme.id} variant="elevated" className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{scheme.name}</CardTitle>
                      <Badge variant="secondary">{scheme.category}</Badge>
                    </div>
                    <CardDescription>{scheme.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Eligibility</p>
                          <p className="text-sm text-muted-foreground">{scheme.eligibility}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <IndianRupee className="w-4 h-4 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Benefits</p>
                          <p className="text-sm text-muted-foreground">{scheme.benefits}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="mt-2">{scheme.state}</Badge>
                    </div>
                    <Button className="w-full mt-4" variant="outline" asChild>
                      <a href={scheme.url} target="_blank" rel="noopener noreferrer">
                        Learn More <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredSchemes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No schemes found matching your criteria.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SchemesPage;
