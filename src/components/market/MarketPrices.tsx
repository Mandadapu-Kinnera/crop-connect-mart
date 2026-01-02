import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, TrendingUp, TrendingDown, Minus, RefreshCw, Filter, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface CommodityPrice {
    id: string;
    commodity: string;
    category: string;
    variety: string;
    market: string;
    state: string;
    minPrice: number;
    maxPrice: number;
    modalPrice: number;
    trend: "up" | "down" | "stable";
    lastUpdated: string;
}

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const CATEGORIES = ["Grains & Cereals", "Vegetable", "Fruit", "Crops", "Organic", "Spices", "Oil", "Leaves"];

const COMMODITIES = [
    // Vegetables
    { name: "Tomato", category: "Vegetable", varieties: ["Hybrid", "Local", "Plum"] },
    { name: "Onion", category: "Vegetable", varieties: ["Red", "White", "Nashik"] },
    { name: "Potato", category: "Vegetable", varieties: ["Jyoti", "Kufri", "Chandramukhi"] },
    { name: "Carrot", category: "Vegetable", varieties: ["Orange", "Red", "Local"] },
    { name: "Cabbage", category: "Vegetable", varieties: ["Green", "Hybrid", "Local"] },
    { name: "Cauliflower", category: "Vegetable", varieties: ["Snowball", "Local"] },
    { name: "Brinjal", category: "Vegetable", varieties: ["Round", "Long", "Hybrid"] },
    { name: "Lady Finger", category: "Vegetable", varieties: ["Okra", "Desi"] },
    { name: "Green Peas", category: "Vegetable", varieties: ["Local", "Hybrid"] },
    { name: "Bottle Gourd", category: "Vegetable", varieties: ["Long", "Round"] },
    { name: "Bitter Gourd", category: "Vegetable", varieties: ["Desi", "Hybrid"] },
    { name: "Spinach", category: "Vegetable", varieties: ["Palak", "Hybrid"] },
    { name: "Beetroot", category: "Vegetable", varieties: ["Dark Red", "Local"] },
    { name: "Ridge Gourd", category: "Vegetable", varieties: ["Desi", "Hybrid"] },
    { name: "Snake Gourd", category: "Vegetable", varieties: ["Long", "Local"] },
    { name: "Drumstick", category: "Vegetable", varieties: ["Hybrid", "Local"] },
    { name: "Pumpkin", category: "Vegetable", varieties: ["Yellow", "Green"] },
    { name: "Sweet Corn", category: "Vegetable", varieties: ["Hybrid", "Golden"] },
    { name: "Cluster Beans", category: "Vegetable", varieties: ["Guar", "Desi"] },
    { name: "Capsicum", category: "Vegetable", varieties: ["Green", "Red", "Yellow"] },
    { name: "Cucumber", category: "Vegetable", varieties: ["Desi", "Hybrid"] },
    { name: "Radish", category: "Vegetable", varieties: ["White Long", "Red"] },
    { name: "Turnip", category: "Vegetable", varieties: ["Local", "Hybrid"] },
    { name: "Lettuce", category: "Vegetable", varieties: ["Iceberg", "Romaine"] },
    { name: "Spring Onion", category: "Vegetable", varieties: ["Local", "Green"] },
    { name: "Green Chilli", category: "Vegetable", varieties: ["Guntur", "Jwala", "Bird Eye"] },

    // Fruits
    { name: "Mango", category: "Fruit", varieties: ["Alphonso", "Kesar", "Banganapalli"] },
    { name: "Apple", category: "Fruit", varieties: ["Shimla", "Kashmiri", "Kinnaur"] },
    { name: "Banana", category: "Fruit", varieties: ["Cavendish", "Robusta", "Yelakki"] },
    { name: "Papaya", category: "Fruit", varieties: ["Hybrid", "Taiwan", "Desi"] },
    { name: "Orange", category: "Fruit", varieties: ["Nagpur", "Kino"] },
    { name: "Sweet Lime", category: "Fruit", varieties: ["Mosambi", "Local"] },
    { name: "Pomegranate", category: "Fruit", varieties: ["Bhagwa", "Ganesh"] },
    { name: "Watermelon", category: "Fruit", varieties: ["Kiran", "Sugar Queen"] },
    { name: "Muskmelon", category: "Fruit", varieties: ["Netted", "Smooth"] },
    { name: "Pineapple", category: "Fruit", varieties: ["Queen", "Giant Kew"] },
    { name: "Guava", category: "Fruit", varieties: ["Allahabad Safeda", "L-49"] },
    { name: "Grapes", category: "Fruit", varieties: ["Thomspon Seedless", "Bangalore Blue"] },
    { name: "Strawberry", category: "Fruit", varieties: ["Camarosa", "Sweet Charlie"] },
    { name: "Blueberry", category: "Fruit", varieties: ["Highbush", "Rabbiteye"] },
    { name: "Custard Apple", category: "Fruit", varieties: ["Sitafal", "Hybrid"] },
    { name: "Sapota", category: "Fruit", varieties: ["Chikoo", "Cricket Ball"] },
    { name: "Jackfruit", category: "Fruit", varieties: ["Desi", "Yellow"] },
    { name: "Kiwi", category: "Fruit", varieties: ["Hayward", "Gold"] },
    { name: "Pear", category: "Fruit", varieties: ["Baggugosha", "Nashpati"] },
    { name: "Plum", category: "Fruit", varieties: ["Santa Rosa", "Kala Amritsari"] },
    { name: "Peach", category: "Fruit", varieties: ["July Elberta", "Redhaven"] },
    { name: "Litchi", category: "Fruit", varieties: ["Shahi", "China"] },
    { name: "Fig", category: "Fruit", varieties: ["Poona", "Local"] },
    { name: "Avocado", category: "Fruit", varieties: ["Hass", "Local"] },
    { name: "Dragon Fruit", category: "Fruit", varieties: ["Red", "White"] },
    { name: "Lemon", category: "Fruit", varieties: ["Local", "Seedless", "Hybrid"] },
    { name: "Palm Fruit", category: "Fruit", varieties: ["Ice Apple", "Munjalu", "Targola"] },

    // Grains & Cereals
    { name: "Rice", category: "Grains & Cereals", varieties: ["Basmati", "Sona Masoori", "IR-64"] },
    { name: "Wheat", category: "Grains & Cereals", varieties: ["Lokwan", "Sharbati", "Sonalika"] },
    { name: "Maize", category: "Grains & Cereals", varieties: ["Corn", "Hybrid"] },
    { name: "Barley", category: "Grains & Cereals", varieties: ["Local", "Improved"] },
    { name: "Oats", category: "Grains & Cereals", varieties: ["Common", "Steel Cut"] },
    { name: "Jowar", category: "Grains & Cereals", varieties: ["Sorghum", "Maldandi"] },
    { name: "Bajra", category: "Grains & Cereals", varieties: ["Pearl Millet", "Hybrid"] },
    { name: "Ragi", category: "Grains & Cereals", varieties: ["Finger Millet", "Indaf"] },
    { name: "Foxtail Millet", category: "Grains & Cereals", varieties: ["Kangni", "Navane"] },
    { name: "Little Millet", category: "Grains & Cereals", varieties: ["Kutki", "Saame"] },
    { name: "Proso Millet", category: "Grains & Cereals", varieties: ["Chena", "Baragu"] },
    { name: "Barnyard Millet", category: "Grains & Cereals", varieties: ["Sanwa", "Oodalu"] },
    { name: "Kodo Millet", category: "Grains & Cereals", varieties: ["Varagu", "Kodra"] },
    { name: "Quinoa", category: "Grains & Cereals", varieties: ["White", "Red", "Tri-color"] },

    // Spices & Organic
    { name: "Red Chilli", category: "Spices", varieties: ["Dry", "Whole Red"] },
    { name: "Red Chilli Powder", category: "Spices", varieties: ["Fine Ground", "Kashmiri"] },
    { name: "Turmeric", category: "Spices", varieties: ["Salem", "Erode", "Nizamabad"] },
    { name: "Honey", category: "Organic", varieties: ["Wild Forest", "Multiflower"] },
    { name: "Cotton", category: "Crops", varieties: ["Long Staple", "Medium Staple"] }
];
const generateMarketPrices = (state: string): CommodityPrice[] => {
    const prices: CommodityPrice[] = [];
    let id = 1;

    COMMODITIES.forEach((comm) => {
        comm.varieties.forEach((variety) => {
            const basePrice = Math.floor(Math.random() * (comm.category === "Organic" ? 8000 : 4000)) + 800;
            const variance = Math.floor(basePrice * 0.15);

            prices.push({
                id: String(id++),
                commodity: comm.name,
                category: comm.category,
                variety,
                market: `${state} Main Mandi`,
                state,
                minPrice: basePrice - variance,
                maxPrice: basePrice + variance,
                modalPrice: basePrice,
                trend: ["up", "down", "stable"][Math.floor(Math.random() * 3)] as "up" | "down" | "stable",
                lastUpdated: new Date().toLocaleTimeString(),
            });
        });
    });

    return prices;
};

export function MarketPrices() {
    const [prices, setPrices] = useState<CommodityPrice[]>([]);
    const [priceUnit, setPriceUnit] = useState<"Quintal" | "Kg">("Quintal");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedState, setSelectedState] = useState(INDIAN_STATES[0]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [loading, setLoading] = useState(false);
    const [lastRefreshed, setLastRefreshed] = useState(new Date());

    const loadPrices = () => {
        setLoading(true);
        // Simulate API delay
        setTimeout(() => {
            setPrices(generateMarketPrices(selectedState));
            setLoading(false);
            setLastRefreshed(new Date());
        }, 800);
    };

    useEffect(() => {
        loadPrices();
    }, [selectedState]);

    const filteredPrices = prices.filter((price) => {
        const matchesSearch =
            price.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
            price.variety.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "All" || price.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case "up": return <ArrowUpRight className="w-4 h-4 text-emerald-500" />;
            case "down": return <ArrowDownRight className="w-4 h-4 text-rose-500" />;
            default: return <Minus className="w-4 h-4 text-slate-400" />;
        }
    };

    const formatPrice = (price: number) => {
        const value = priceUnit === "Kg" ? price / 100 : price;
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: priceUnit === "Kg" ? 2 : 0,
        }).format(value);
    };

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                            Live Mandi Prices
                        </CardTitle>
                        <CardDescription>
                            Track real-time agricultural prices across 28 Indian states
                        </CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl gap-2 h-10 border-primary/20 hover:bg-primary/5"
                        onClick={loadPrices}
                        disabled={loading}
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh Data
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
                    <div className="relative md:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search product..."
                            className="pl-10 h-11 rounded-xl bg-white/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="h-11 rounded-xl bg-white/50 border border-input px-3"
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                    >
                        {INDIAN_STATES.map(state => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>
                    <select
                        className="h-11 rounded-xl bg-white/50 border border-input px-3"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="All">All Categories</option>
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <select
                        className="h-11 rounded-xl bg-white/50 border border-input px-3"
                        value={priceUnit}
                        onChange={(e) => setPriceUnit(e.target.value as "Quintal" | "Kg")}
                    >
                        <option value="Quintal">Per Quintal</option>
                        <option value="Kg">Per Kg</option>
                    </select>
                </div>
            </CardHeader>

            <CardContent className="px-0 mt-6">
                <div className="rounded-3xl border border-primary/5 bg-white/50 backdrop-blur-sm overflow-hidden min-h-[400px]">
                    <Table>
                        <TableHeader className="bg-primary/5">
                            <TableRow>
                                <TableHead className="font-bold">Commodity</TableHead>
                                <TableHead className="font-bold">Variety</TableHead>
                                <TableHead className="font-bold">Category</TableHead>
                                <TableHead className="font-bold text-right">Market Price (per {priceUnit.toLowerCase()})</TableHead>
                                <TableHead className="font-bold">Trend</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <RefreshCw className="w-8 h-8 animate-spin text-primary/40" />
                                            <p className="text-muted-foreground animate-pulse">Fetching latest mandi data...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredPrices.length > 0 ? (
                                filteredPrices.map((price) => (
                                    <TableRow key={price.id} className="hover:bg-primary/5 transition-colors group">
                                        <TableCell className="font-semibold py-4">{price.commodity}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-normal">
                                                {price.variety}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                                                {price.category}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="inline-flex flex-col items-end">
                                                <span className="font-bold text-lg text-primary">{formatPrice(price.modalPrice)}</span>
                                                <div className="flex gap-2 text-[10px] text-muted-foreground mt-0.5">
                                                    <span>Min: {formatPrice(price.minPrice)}</span>
                                                    <span>Max: {formatPrice(price.maxPrice)}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-white shadow-sm border border-slate-100 w-fit">
                                                {getTrendIcon(price.trend)}
                                                <span className={`text-xs font-bold uppercase ${price.trend === 'up' ? 'text-emerald-600' :
                                                    price.trend === 'down' ? 'text-rose-600' : 'text-slate-500'
                                                    }`}>
                                                    {price.trend}
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <p className="text-muted-foreground">No data found for this selection.</p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="mt-4 flex justify-between items-center text-[10px] text-muted-foreground px-4">
                    <p>* Prices are per {priceUnit.toLowerCase()} {priceUnit === 'Quintal' ? '(100Kg)' : ''}. Data refreshed at {lastRefreshed.toLocaleTimeString()}</p>
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Connection: Stable
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
