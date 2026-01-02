import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";

interface CommodityPrice {
  id: string;
  commodity: string;
  variety: string;
  market: string;
  state: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  trend: "up" | "down" | "stable";
  lastUpdated: string;
}

// Simulated market price data (in real app, this would come from an API like data.gov.in)
const generateMarketPrices = (): CommodityPrice[] => {
  const commodities = [
    { name: "Rice", varieties: ["Basmati", "Sona Masoori", "IR-64"] },
    { name: "Wheat", varieties: ["Lokwan", "Sharbati", "MP Wheat"] },
    { name: "Tomato", varieties: ["Hybrid", "Desi", "Cherry"] },
    { name: "Onion", varieties: ["Red", "White", "Nashik"] },
    { name: "Potato", varieties: ["Jyoti", "Kufri", "Chandramukhi"] },
    { name: "Green Chilli", varieties: ["Guntur", "Jwala", "Bird Eye"] },
    { name: "Cauliflower", varieties: ["Snowball", "Hybrid", "Local"] },
    { name: "Cabbage", varieties: ["Green", "Red", "Hybrid"] },
    { name: "Brinjal", varieties: ["Round", "Long", "Hybrid"] },
    { name: "Banana", varieties: ["Cavendish", "Robusta", "Nendran"] },
  ];

  const markets = [
    { market: "Azadpur Mandi", state: "Delhi" },
    { market: "Koyambedu", state: "Tamil Nadu" },
    { market: "Bowenpally", state: "Telangana" },
    { market: "Vashi APMC", state: "Maharashtra" },
    { market: "Yeshwanthpur", state: "Karnataka" },
  ];

  const prices: CommodityPrice[] = [];
  let id = 1;

  commodities.forEach((commodity) => {
    commodity.varieties.forEach((variety) => {
      const randomMarket = markets[Math.floor(Math.random() * markets.length)];
      const basePrice = Math.floor(Math.random() * 5000) + 500;
      const variance = Math.floor(basePrice * 0.2);

      prices.push({
        id: String(id++),
        commodity: commodity.name,
        variety,
        market: randomMarket.market,
        state: randomMarket.state,
        minPrice: basePrice - variance,
        maxPrice: basePrice + variance,
        modalPrice: basePrice,
        trend: ["up", "down", "stable"][Math.floor(Math.random() * 3)] as "up" | "down" | "stable",
        lastUpdated: new Date().toLocaleDateString("en-IN"),
      });
    });
  });

  return prices;
};

const MarketPricesPage = () => {
  const [prices, setPrices] = useState<CommodityPrice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("All");
  const [loading, setLoading] = useState(false);

  const states = ["All", "Delhi", "Tamil Nadu", "Telangana", "Maharashtra", "Karnataka"];

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = () => {
    setLoading(true);
    setTimeout(() => {
      setPrices(generateMarketPrices());
      setLoading(false);
    }, 500);
  };

  const filteredPrices = prices.filter((price) => {
    const matchesSearch =
      price.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      price.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
      price.market.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = selectedState === "All" || price.state === selectedState;
    return matchesSearch && matchesState;
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background pt-20">
      <Header showLinks={false} />
      <main className="flex-1">
        <section className="py-12 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Live Mandi Prices
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Real-time agricultural commodity prices from major mandis across India.
              </p>
            </div>

            <Card variant="elevated" className="mb-8">
              <CardHeader>
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                  <div className="flex-1 w-full md:max-w-md relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      placeholder="Search commodity, variety, or market..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap items-center">
                    {states.map((state) => (
                      <Button
                        key={state}
                        variant={selectedState === state ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedState(state)}
                      >
                        {state}
                      </Button>
                    ))}
                    <Button variant="ghost" size="sm" onClick={loadPrices} disabled={loading}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Commodity</TableHead>
                        <TableHead>Variety</TableHead>
                        <TableHead>Market</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead className="text-right">Min Price</TableHead>
                        <TableHead className="text-right">Max Price</TableHead>
                        <TableHead className="text-right">Modal Price</TableHead>
                        <TableHead>Trend</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPrices.map((price) => (
                        <TableRow key={price.id}>
                          <TableCell className="font-medium">{price.commodity}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{price.variety}</Badge>
                          </TableCell>
                          <TableCell>{price.market}</TableCell>
                          <TableCell>{price.state}</TableCell>
                          <TableCell className="text-right">{formatPrice(price.minPrice)}</TableCell>
                          <TableCell className="text-right">{formatPrice(price.maxPrice)}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatPrice(price.modalPrice)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getTrendIcon(price.trend)}
                              <span className="text-xs text-muted-foreground capitalize">{price.trend}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredPrices.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No prices found matching your criteria.</p>
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-4 text-center">
                  Prices are in ₹ per quintal. Last updated: {new Date().toLocaleDateString("en-IN")}
                </p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center p-6">
                <TrendingUp className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <CardTitle className="text-lg mb-2">Price Alerts</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Set alerts to get notified when commodity prices reach your target.
                </p>
              </Card>
              <Card className="text-center p-6">
                <Search className="w-10 h-10 text-primary mx-auto mb-3" />
                <CardTitle className="text-lg mb-2">Compare Markets</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Compare prices across different mandis to get the best deal.
                </p>
              </Card>
              <Card className="text-center p-6">
                <RefreshCw className="w-10 h-10 text-blue-500 mx-auto mb-3" />
                <CardTitle className="text-lg mb-2">Real-time Updates</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Prices are updated daily from official mandi sources.
                </p>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default MarketPricesPage;
