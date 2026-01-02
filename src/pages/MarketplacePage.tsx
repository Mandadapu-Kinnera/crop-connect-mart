import { useState, useEffect } from "react";
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
  Navigation,
  Loader2,
  Clock,
  Package,
} from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import vegetablesImage from "@/assets/vegetables-basket.jpg";
import fruitsImage from "@/assets/fruits-display.jpg";
import riceImage from "@/assets/rice-field.jpg";

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  quantityAvailable: number;
  image: string;
  farmerName: string;
  location?: string;
  coordinates?: { lat: number; lng: number };
  createdAt: string;
}

const categories = ["All", "Vegetables", "Fruits", "Grains", "Dairy", "Spices", "Organic", "Oil", "Leaves"];

interface CartItem {
  product: Product;
  quantity: number;
}

export default function MarketplacePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showNearby, setShowNearby] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);

  const { latitude, longitude, loading: locationLoading, error: locationError, getLocation, calculateDistance, hasLocation } = useGeolocation();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data.cart || []);
        setWishlist(data.wishlist?.map((p: any) => p._id) || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    if (user) {
      fetchUserUserData();
    }
  }, [user]);

  useEffect(() => {
    if (locationError) {
      toast({
        title: "Location Error",
        description: locationError,
        variant: "destructive"
      });
      setShowNearby(false);
    }
  }, [locationError, toast]);

  const handleNearMeClick = () => {
    if (showNearby) {
      setShowNearby(false);
      return;
    }

    if (!hasLocation) {
      getLocation();
    }
    setShowNearby(true);
  };

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.farmerName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .filter((product) => {
      if (!showNearby) return true;
      if (!hasLocation) return false;
      if (!product.coordinates || typeof product.coordinates.lat !== 'number' || typeof product.coordinates.lng !== 'number') return false;
      const distance = calculateDistance(product.coordinates.lat, product.coordinates.lng);
      return distance !== null && distance <= 10; // 10km radius
    })
    .sort((a, b) => {
      if (!showNearby || !hasLocation) return 0;
      const distA = (a.coordinates && typeof a.coordinates.lat === 'number') ? (calculateDistance(a.coordinates.lat, a.coordinates.lng) || Infinity) : Infinity;
      const distB = (b.coordinates && typeof b.coordinates.lat === 'number') ? (calculateDistance(b.coordinates.lat, b.coordinates.lng) || Infinity) : Infinity;
      return distA - distB;
    });

  const syncWishlist = async (newWishlist: string[]) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/user/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ wishlist: newWishlist })
      });
    } catch (error) {
      console.error('Error syncing wishlist:', error);
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      toast({ title: "Please login", description: "You need to be logged in to save items", variant: "destructive" });
      navigate("/auth");
      return;
    }
    let newWishlist;
    if (wishlist.includes(productId)) {
      newWishlist = wishlist.filter(id => id !== productId);
      setWishlist(newWishlist);
      toast({ title: "Removed from wishlist" });
    } else {
      newWishlist = [...wishlist, productId];
      setWishlist(newWishlist);
      toast({ title: "Added to wishlist" });
    }
    await syncWishlist(newWishlist);
  };

  const syncCart = async (newCart: CartItem[]) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/user/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cart: newCart.map(item => ({
            product: item.product._id,
            quantity: item.quantity
          }))
        })
      });
    } catch (error) {
      console.error('Error syncing cart:', error);
    }
  };

  const addToCart = async (product: Product) => {
    if (!user) {
      toast({ title: "Please login", description: "You need to be logged in to add items to cart", variant: "destructive" });
      navigate("/auth");
      return;
    }
    let newCart;
    const existingItem = cart.find(item => item.product._id === product._id);
    if (existingItem) {
      newCart = cart.map(item =>
        item.product._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, { product, quantity: 1 }];
    }
    setCart(newCart);
    toast({ title: "Added to cart", description: `${product.name} added to your cart` });
    await syncCart(newCart);
  };

  const updateCartQuantity = async (productId: string, delta: number) => {
    const newCart = cart.map(item => {
      if (item.product._id === productId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0);

    setCart(newCart);
    await syncCart(newCart);
  };

  const removeFromCart = async (productId: string) => {
    const newCart = cart.filter(item => item.product._id !== productId);
    setCart(newCart);
    toast({ title: "Removed from cart" });
    await syncCart(newCart);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistProducts = products.filter(p => wishlist.includes(p._id));

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
            <span className="hidden md:inline">{user?.name || "User"}</span>
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
    <div className="min-h-screen bg-background pt-20">
      {user ? <LoggedInHeader /> : <Header showLinks={false} />}

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
                    <div key={item.product._id} className="flex gap-4 p-3 border rounded-lg">
                      <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.product.name}</h3>
                        <p className="text-sm text-muted-foreground">₹{item.product.price}/{item.product.unit}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateCartQuantity(item.product._id, -1)}>
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateCartQuantity(item.product._id, 1)}>
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto text-destructive" onClick={() => removeFromCart(item.product._id)}>
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
                    <div key={product._id} className="flex gap-4 p-3 border rounded-lg">
                      <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1">
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">₹{product.price}/{product.unit}</p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" onClick={() => addToCart(product)}>Add to Cart</Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => toggleWishlist(product._id)}>
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
            <Button
              variant={showNearby ? "default" : "outline"}
              className="h-12 gap-2"
              onClick={handleNearMeClick}
              disabled={locationLoading}
            >
              {locationLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
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
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-muted-foreground text-lg">Fetching fresh produce...</p>
            </div>
          ) : (showNearby && !hasLocation) ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-muted-foreground text-lg">Finding nearby farmers...</p>
            </div>
          ) : (
            <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
              {filteredProducts.map((product) => (
                <Card key={product._id} variant="elevated" className="overflow-hidden group">
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <button
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors ${wishlist.includes(product._id) ? "text-destructive" : ""}`}
                      onClick={() => toggleWishlist(product._id)}
                    >
                      <Heart className={`w-4 h-4 ${wishlist.includes(product._id) ? "fill-current" : ""}`} />
                    </button>
                    {product.quantityAvailable === 0 && (
                      <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
                        <Badge variant="secondary">Out of Stock</Badge>
                      </div>
                    )}
                    <Badge className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-md text-foreground border-none shadow-sm font-bold">
                      {product.category}
                    </Badge>
                    {hasLocation && product.coordinates && (
                      <Badge className="absolute top-3 left-3 bg-white/80 backdrop-blur-md text-primary border-none shadow-sm">
                        <Navigation className="w-3 h-3 mr-1" />
                        {calculateDistance(product.coordinates.lat, product.coordinates.lng)?.toFixed(1)} km
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 fill-warning text-warning" />
                      <span className="text-sm font-medium">4.8</span>
                      <span className="text-sm text-muted-foreground">(24)</span>
                    </div>
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-1">{product.farmerName}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                      <MapPin className="w-3 h-3" />
                      {product.location}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-4">
                      <div className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" />
                        {new Date(product.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full">
                        <Package className="w-3 h-3" />
                        {product.quantityAvailable} {product.unit} left
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-primary">₹{product.price}</span>
                        <span className="text-sm text-muted-foreground">/{product.unit}</span>
                      </div>
                      <Button size="sm" disabled={product.quantityAvailable === 0} onClick={() => product.quantityAvailable > 0 && addToCart(product)}>
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                {showNearby ? "No fresh produce found within 10km." : "No products found matching your criteria."}
              </p>
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
