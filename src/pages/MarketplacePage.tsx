import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  MapPin, 
  Filter, 
  Grid3X3, 
  List, 
  Star, 
  ShoppingCart,
  Heart,
  Leaf,
  Home,
  Store,
  User,
  LogOut,
  Trash2,
  Plus,
  Minus,
} from "lucide-react";
import vegetablesImage from "@/assets/vegetables-basket.jpg";
import fruitsImage from "@/assets/fruits-display.jpg";
import riceImage from "@/assets/rice-field.jpg";

const products = [
  {
    id: "1",
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
    id: "2",
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
    id: "3",
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
    id: "4",
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
    id: "5",
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
    id: "6",
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

interface CartItem {
  product: typeof products[0];
  quantity: number;
}

export default function MarketplacePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.farmer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleWishlist = (productId: string) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter(id => id !== productId));
      toast({ title: "Removed from wishlist" });
    } else {
      setWishlist([...wishlist, productId]);
      toast({ title: "Added to wishlist" });
    }
  };

  const addToCart = (product: typeof products[0]) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    toast({ title: "Added to cart", description: `${product.name} added to your cart` });
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.product.id === productId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
    toast({ title: "Removed from cart" });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Logged-in user header
  const LoggedInHeader = () => (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
      <nav className="container mx-auto flex items-center justify-between py-4 px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-glow transition-transform group-hover:scale-110">
            <Leaf className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">
            Agri<span className="text-primary">Mart</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
          <Link to="/marketplace" className="flex items-center gap-2 text-sm font-medium text-primary">
            <Store className="w-4 h-4" />
            Marketplace
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => { setShowWishlist(true); setShowCart(false); }}
          >
            <Heart className={`w-5 h-5 ${wishlist.length > 0 ? "fill-destructive text-destructive" : ""}`} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => { setShowCart(true); setShowWishlist(false); }}
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Button>

          <Button variant="ghost" size="sm" className="gap-2">
            <User className="w-4 h-4" />
            <span className="hidden md:inline">{user?.user_metadata?.full_name || "User"}</span>
          </Button>

          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Logout</span>
          </Button>
        </div>
      </nav>
    </header>
  );

  return (
    <div className="min-h-screen bg-background">
      {user ? <LoggedInHeader /> : <Header />}
      
      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowCart(false)}>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-background shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Your Cart ({cartCount})</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowCart(false)}>×</Button>
            </div>
            <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex gap-4 p-3 border rounded-lg">
                      <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.product.name}</h3>
                        <p className="text-sm text-muted-foreground">₹{item.product.price}/{item.product.unit}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateCartQuantity(item.product.id, -1)}>
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateCartQuantity(item.product.id, 1)}>
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto text-destructive" onClick={() => removeFromCart(item.product.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-background">
                <div className="flex justify-between mb-4">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-xl">₹{cartTotal}</span>
                </div>
                <Button className="w-full" size="lg">Proceed to Checkout</Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Wishlist Sidebar */}
      {showWishlist && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowWishlist(false)}>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-background shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Your Wishlist ({wishlist.length})</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowWishlist(false)}>×</Button>
            </div>
            <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(100vh - 100px)" }}>
              {wishlistProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Your wishlist is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {wishlistProducts.map((product) => (
                    <div key={product.id} className="flex gap-4 p-3 border rounded-lg">
                      <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1">
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">₹{product.price}/{product.unit}</p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" onClick={() => addToCart(product)}>Add to Cart</Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => toggleWishlist(product.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
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
                  <button 
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors ${wishlist.includes(product.id) ? "text-destructive" : ""}`}
                    onClick={() => toggleWishlist(product.id)}
                  >
                    <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? "fill-current" : ""}`} />
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
                    <Button size="sm" disabled={!product.inStock} onClick={() => product.inStock && addToCart(product)}>
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
