import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MapPin, 
  Filter, 
  Grid3X3, 
  List, 
  Star, 
  ShoppingCart,
  Heart
} from "lucide-react";
import vegetablesImage from "@/assets/vegetables-basket.jpg";
import fruitsImage from "@/assets/fruits-display.jpg";
import riceImage from "@/assets/rice-field.jpg";

const products = [
  {
    id: 1,
    name: "Fresh Organic Tomatoes",
    farmer: "Ramesh Kumar",
    location: "Warangal, Telangana",
    price: 40,
    unit: "kg",
    rating: 4.8,
    reviews: 156,
    image: vegetablesImage,
    category: "Vegetables",
    inStock: true,
  },
  {
    id: 2,
    name: "Alphonso Mangoes",
    farmer: "Suresh Patil",
    location: "Ratnagiri, Maharashtra",
    price: 350,
    unit: "dozen",
    rating: 4.9,
    reviews: 243,
    image: fruitsImage,
    category: "Fruits",
    inStock: true,
  },
  {
    id: 3,
    name: "Basmati Rice (Premium)",
    farmer: "Harpreet Singh",
    location: "Karnal, Haryana",
    price: 120,
    unit: "kg",
    rating: 4.7,
    reviews: 89,
    image: riceImage,
    category: "Grains",
    inStock: true,
  },
  {
    id: 4,
    name: "Fresh Green Chillies",
    farmer: "Lakshmi Devi",
    location: "Guntur, Andhra Pradesh",
    price: 80,
    unit: "kg",
    rating: 4.6,
    reviews: 67,
    image: vegetablesImage,
    category: "Vegetables",
    inStock: true,
  },
  {
    id: 5,
    name: "Organic Bananas",
    farmer: "Mohan Reddy",
    location: "Anantapur, AP",
    price: 60,
    unit: "dozen",
    rating: 4.8,
    reviews: 124,
    image: fruitsImage,
    category: "Fruits",
    inStock: false,
  },
  {
    id: 6,
    name: "Pearl Millet (Bajra)",
    farmer: "Raju Yadav",
    location: "Jodhpur, Rajasthan",
    price: 45,
    unit: "kg",
    rating: 4.5,
    reviews: 45,
    image: riceImage,
    category: "Grains",
    inStock: true,
  },
];

const categories = ["All", "Vegetables", "Fruits", "Grains", "Dairy", "Spices"];

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.farmer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Fresh <span className="text-primary">Marketplace</span>
            </h1>
            <p className="text-muted-foreground">
              Browse fresh produce directly from verified farmers across India
            </p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search produce, farmers, or locations..."
                className="pl-10 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Location Filter */}
            <Button variant="outline" className="h-12 gap-2">
              <MapPin className="w-4 h-4" />
              Near Me
            </Button>

            {/* More Filters */}
            <Button variant="outline" className="h-12 gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>

            {/* View Toggle */}
            <div className="flex border rounded-lg overflow-hidden">
              <button
                className={`p-3 ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                className={`p-3 ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
                onClick={() => setViewMode("list")}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "secondary"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Products Grid */}
          <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
            {filteredProducts.map((product) => (
              <Card key={product.id} variant="elevated" className="overflow-hidden group">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
                      <Badge variant="secondary">Out of Stock</Badge>
                    </div>
                  )}
                  <Badge className="absolute bottom-3 left-3" variant="accent">
                    {product.category}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 fill-warning text-warning" />
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-sm text-muted-foreground">({product.reviews})</span>
                  </div>
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-1">{product.farmer}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                    <MapPin className="w-3 h-3" />
                    {product.location}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-primary">₹{product.price}</span>
                      <span className="text-sm text-muted-foreground">/{product.unit}</span>
                    </div>
                    <Button size="sm" disabled={!product.inStock}>
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
              <Button variant="outline" className="mt-4" onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
