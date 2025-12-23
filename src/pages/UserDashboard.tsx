import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  MapPin,
  ShoppingCart,
  Heart,
  Star,
  Package,
  User,
  LogOut,
  Navigation,
  Loader2,
  CheckCircle,
  Leaf,
  Home,
  Store,
  Settings,
  Trash2,
  Plus,
  Minus,
} from "lucide-react";
import vegetablesImage from "@/assets/vegetables-basket.jpg";
import fruitsImage from "@/assets/fruits-display.jpg";
import riceImage from "@/assets/rice-field.jpg";

// Mock products with coordinates
const sampleProducts = [
  {
    id: "1",
    name: "Fresh Organic Tomatoes",
    farmer_name: "Ramesh Kumar",
    location: "Warangal, Telangana",
    price: 40,
    unit: "kg",
    rating: 4.8,
    reviews: 156,
    image: vegetablesImage,
    category: "Vegetables",
    latitude: 17.9784,
    longitude: 79.5941,
  },
  {
    id: "2",
    name: "Alphonso Mangoes",
    farmer_name: "Suresh Patil",
    location: "Ratnagiri, Maharashtra",
    price: 350,
    unit: "dozen",
    rating: 4.9,
    reviews: 243,
    image: fruitsImage,
    category: "Fruits",
    latitude: 16.9902,
    longitude: 73.3120,
  },
  {
    id: "3",
    name: "Basmati Rice",
    farmer_name: "Harpreet Singh",
    location: "Karnal, Haryana",
    price: 120,
    unit: "kg",
    rating: 4.7,
    reviews: 89,
    image: riceImage,
    category: "Grains",
    latitude: 29.6857,
    longitude: 76.9905,
  },
  {
    id: "4",
    name: "Green Chillies",
    farmer_name: "Lakshmi Devi",
    location: "Guntur, AP",
    price: 80,
    unit: "kg",
    rating: 4.6,
    reviews: 67,
    image: vegetablesImage,
    category: "Vegetables",
    latitude: 16.3067,
    longitude: 80.4365,
  },
];

// Mock orders
const mockOrders = [
  {
    id: "1",
    order_number: "ORD-001",
    status: "delivered",
    total_amount: 450,
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    order_number: "ORD-002",
    status: "pending",
    total_amount: 280,
    created_at: new Date().toISOString(),
  },
];

interface CartItem {
  product: typeof sampleProducts[0];
  quantity: number;
}

export default function UserDashboard() {
  const { user, userRole, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { latitude, longitude, loading: locationLoading, error: locationError, getLocation, calculateDistance, hasLocation } = useGeolocation();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showNearby, setShowNearby] = useState(false);
  const [orders] = useState(mockOrders);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleNearMeClick = () => {
    if (!hasLocation) {
      getLocation();
    }
    setShowNearby(true);
  };

  const toggleWishlist = (productId: string) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter(id => id !== productId));
      toast({ title: "Removed from wishlist" });
    } else {
      setWishlist([...wishlist, productId]);
      toast({ title: "Added to wishlist" });
    }
  };

  const addToCart = (product: typeof sampleProducts[0]) => {
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

  const productsWithDistance = sampleProducts.map((product) => ({
    ...product,
    distance: hasLocation && product.latitude && product.longitude
      ? calculateDistance(product.latitude, product.longitude)
      : null,
  }));

  const filteredProducts = productsWithDistance
    .filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.farmer_name.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (showNearby && hasLocation) {
        return matchesSearch && product.distance !== null && product.distance < 100;
      }
      return matchesSearch;
    })
    .sort((a, b) => {
      if (showNearby && a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }
      return 0;
    });

  const wishlistProducts = sampleProducts.filter(p => wishlist.includes(p.id));

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Custom Dashboard Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
        <nav className="container mx-auto flex items-center justify-between py-4 px-4 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-glow transition-transform group-hover:scale-110">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">
              Agri<span className="text-primary">Mart</span>
            </span>
          </Link>

          {/* Dashboard Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2 text-sm font-medium text-primary">
              <Home className="w-4 h-4" />
              Dashboard
            </Link>
            <Link to="/marketplace" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
              <Store className="w-4 h-4" />
              Marketplace
            </Link>
          </div>

          {/* Right Side - Wishlist, Cart, User */}
          <div className="flex items-center gap-3">
            {/* Wishlist */}
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

            {/* Cart */}
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

            {/* User Menu */}
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

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
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

          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome, <span className="text-primary">{user?.user_metadata?.full_name || "User"}</span>
            </h1>
            <p className="text-muted-foreground">
              Browse fresh produce from verified farmers
            </p>
          </div>

          <Tabs defaultValue="marketplace" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
              <TabsTrigger value="orders">My Orders</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            {/* Marketplace Tab */}
            <TabsContent value="marketplace" className="space-y-6">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search produce, farmers..."
                    className="pl-10 h-12"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
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
              </div>

              {/* Location Status */}
              {showNearby && (
                <div className="flex items-center gap-2 text-sm">
                  {hasLocation ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-muted-foreground">
                        Showing products within 100km of your location
                      </span>
                    </>
                  ) : locationError ? (
                    <>
                      <MapPin className="w-4 h-4 text-destructive" />
                      <span className="text-destructive">{locationError}</span>
                    </>
                  ) : (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-muted-foreground">Getting your location...</span>
                    </>
                  )}
                </div>
              )}

              {/* Products Grid */}
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <Card key={product.id} variant="elevated" className="overflow-hidden group">
                    <div className="relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <button 
                        className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background ${wishlist.includes(product.id) ? "text-destructive" : ""}`}
                        onClick={() => toggleWishlist(product.id)}
                      >
                        <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? "fill-current" : ""}`} />
                      </button>
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
                      <h3 className="font-semibold mb-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-1">{product.farmer_name}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin className="w-3 h-3" />
                        {product.location}
                        {product.distance !== null && (
                          <span className="ml-1 text-primary">
                            ({product.distance.toFixed(1)} km)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xl font-bold text-primary">₹{product.price}</span>
                          <span className="text-sm text-muted-foreground">/{product.unit}</span>
                        </div>
                        <Button size="sm" onClick={() => addToCart(product)}>
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">No products found</p>
                </div>
              )}
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-4">
              <h2 className="text-xl font-semibold">My Orders</h2>
              
              {orders.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No orders yet</p>
                    <Button className="mt-4" onClick={() => navigate("/marketplace")}>
                      Browse Products
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{order.order_number}</span>
                        <Badge variant={order.status === "delivered" ? "success" : "secondary"}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Total: ₹{order.total_amount}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Full Name</label>
                    <p className="font-medium">{user?.user_metadata?.full_name || "Not set"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Account Type</label>
                    <Badge variant="secondary" className="ml-2 capitalize">{userRole}</Badge>
                  </div>
                  <Button variant="outline" className="mt-4">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
