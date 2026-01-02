import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
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
  HelpCircle,
  Clock,
  IndianRupee,
  Filter,
  X,
  Info,
  MessageSquare
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { MarketPrices } from "@/components/market/MarketPrices";

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
  farmerId?: string;
  location?: string;
  coordinates?: { lat: number; lng: number };
  createdAt: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

type ActiveView = "marketplace" | "orders" | "profile" | "market-prices" | "messages";

function SidebarLink({
  icon: Icon,
  label,
  active,
  onClick
}: {
  icon: any;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${active
        ? "bg-primary text-primary-foreground shadow-md scale-[1.02]"
        : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
        }`}
      onClick={onClick}
    >
      <Icon className="w-5 h-5" />
      <span className="font-semibold">{label}</span>
    </div>
  );
}

export default function UserDashboard() {
  const { user, userRole, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { latitude, longitude, loading: locationLoading, error: locationError, getLocation, calculateDistance, hasLocation } = useGeolocation();

  const [products, setProducts] = useState<Product[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>("marketplace");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNearby, setShowNearby] = useState(false);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  // Checkout State
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [shippingDetails, setShippingDetails] = useState({
    name: "",
    phone: "",
    email: "",
    houseDetails: "",
    areaName: "",
    street: "",
    location: "", // For reverse geocoding
    coordinates: { lat: 0, lng: 0 }
  });
  const [placingOrder, setPlacingOrder] = useState(false);
  const [noReturnAccepted, setNoReturnAccepted] = useState(false);

  // Advanced Filters State
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedSort, setSelectedSort] = useState("newest");

  // Profile Edit State
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const clearFilters = () => {
    setSelectedCategory("All");
    setPriceRange([0, 5000]);
    setSelectedSort("newest");
    setSearchQuery("");
    setShowNearby(false);
  };

  const fetchProducts = async () => {
    try {
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
        // data.cart is [{ product: Product, quantity: number }]
        // data.wishlist is [Product]
        setCart(data.cart || []);
        setWishlist(data.wishlist?.map((p: any) => p._id) || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/orders/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    if (user) {
      fetchUserUserData();
      fetchOrders();
      fetchNotifications();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/orders/my-orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

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
    toast({ title: "Removed from cart" });
    await syncCart(newCart);
  };



  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setUpdatingProfile(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: newPassword })
      });

      if (response.ok) {
        toast({ title: "Success", description: "Password updated successfully" });
        setEditProfileOpen(false);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await response.json();
        toast({ title: "Error", description: data.message || "Failed to update profile", variant: "destructive" });
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast({ title: "Error", description: "Failed to connect to server", variant: "destructive" });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesPrice;
    })
    .filter((product) => {
      if (!showNearby) return true;
      if (!hasLocation) return false;
      if (!product.coordinates || typeof product.coordinates.lat !== 'number' || typeof product.coordinates.lng !== 'number') return false;
      const distance = calculateDistance(product.coordinates.lat, product.coordinates.lng);
      return distance !== null && distance <= 10;
    })
    .sort((a, b) => {
      if (showNearby && hasLocation) {
        const distA = (a.coordinates && typeof a.coordinates.lat === 'number') ? (calculateDistance(a.coordinates.lat, a.coordinates.lng) || Infinity) : Infinity;
        const distB = (b.coordinates && typeof b.coordinates.lat === 'number') ? (calculateDistance(b.coordinates.lat, b.coordinates.lng) || Infinity) : Infinity;
        return distA - distB;
      }

      if (selectedSort === "price-low") return a.price - b.price;
      if (selectedSort === "price-high") return b.price - a.price;
      if (selectedSort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

      return 0;
    });

  const wishlistProducts = products.filter(p => wishlist.includes(p._id));

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const calculateShippingCharges = () => {
    if (cartTotal > 700 || cart.length === 0) return 0;

    // 1. Distance Factor (Origin & Destination)
    let totalDistance = 0;
    let itemsWithLocation = 0;
    cart.forEach(item => {
      if (item.product.coordinates && shippingDetails.coordinates.lat) {
        const dist = calculateDistance(item.product.coordinates.lat, item.product.coordinates.lng);
        if (dist !== null) {
          totalDistance += dist;
          itemsWithLocation++;
        }
      }
    });

    const avgDistance = itemsWithLocation > 0 ? totalDistance / itemsWithLocation : 5;
    const distanceFee = avgDistance * 2; // ₹2 per km

    // 2. Weight & Volumetric Pricing (Simulated)
    // Factor: Weight based on total quantity (Assuming 1 unit = 1kg)
    const totalWeight = cart.reduce((sum, item) => sum + item.quantity, 0);
    const weightFee = totalWeight * 1.5; // Base weight handling

    // 3. Surcharges & Service Fees
    // Including Fuel Surcharge, Peak Handling, and Residential Delivery
    const surcharges = 45;

    // 4. Insurance (Declared Value Fee)
    // 1.5% of total order value
    const insuranceFee = cartTotal * 0.015;

    const totalCalculated = distanceFee + weightFee + surcharges + insuranceFee;

    // Limit shipping charges to 120 rupees as requested
    return Math.min(Math.round(totalCalculated), 120);
  };

  const shippingCharges = calculateShippingCharges();
  const totalWithShipping = cartTotal + shippingCharges;

  const handleUseCurrentLocation = () => {
    if (!hasLocation) {
      getLocation();
    }
    if (latitude && longitude) {
      setShippingDetails(prev => ({
        ...prev,
        coordinates: { lat: latitude, lng: longitude }
      }));
      // Simulating reverse geocoding
      setShippingDetails(prev => ({
        ...prev,
        location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)} (Current Location)`
      }));
    }
  };

  const handlePlaceOrder = async () => {
    if (!shippingDetails.name || !shippingDetails.phone || !shippingDetails.houseDetails) {
      toast({ title: "Error", description: "Please fill in all delivery details", variant: "destructive" });
      return;
    }

    if (!noReturnAccepted) {
      toast({ title: "Policy Agreement", description: "Please accept the no-return/exchange policy to continue.", variant: "destructive" });
      return;
    }

    setPlacingOrder(true);
    try {
      const token = localStorage.getItem('token');
      const orderData = {
        items: cart.map(item => {
          const productAny = item.product as any;
          const farmerId = productAny.farmerId || productAny.farmer || productAny._id; // Fallback to product ID is wrong but prevents crash, validation will catch it
          console.log(`Mapping item: ${item.product.name}, Farmer ID: ${farmerId}`);
          return {
            product: item.product._id,
            farmer: farmerId,
            quantity: item.quantity,
            price: item.product.price
          };
        }),
        shippingAddress: shippingDetails,
        subtotal: cartTotal,
        shippingCharges: shippingCharges,
        totalAmount: totalWithShipping
      };

      console.log('Placing Order Payload:', orderData);


      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        toast({ title: "Success", description: "Order placed successfully! Cash on Delivery confirmed." });
        setCart([]);
        setCheckoutOpen(false);
        setShowCart(false);
        fetchOrders(); // Refresh order history
      } else {
        const error = await response.json();
        toast({ title: "Error", description: error.message || "Failed to place order", variant: "destructive" });
      }
    } catch (error) {
      console.error('Order error:', error);
      toast({ title: "Error", description: "Failed to connect to server", variant: "destructive" });
    } finally {
      setPlacingOrder(false);
    }
  };

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

  const renderContent = () => {
    switch (activeView) {
      case "marketplace":
        return (
          <div className="space-y-6 pt-16 lg:pt-0">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">
                Fresh <span className="text-primary">Marketplace</span>
              </h1>
              <p className="text-muted-foreground">Browse organic produce directly from farmers</p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search produce, farmers..."
                  className="pl-10 h-12 rounded-xl border-primary/10 focus:border-primary/30"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant={showNearby ? "default" : "outline"}
                className="h-12 gap-2 hover:bg-primary/90 rounded-xl"
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

            {/* Products Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground">Fetching fresh produce...</p>
              </div>
            ) : (showNearby && !hasLocation) ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground">Finding nearby farmers...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground">
                  {showNearby ? "No products found within 10km of your location" : "No products found matching your search"}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <Card key={product._id} className="overflow-hidden group hover:shadow-2xl transition-all duration-500 border-primary/5 rounded-3xl group">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <button
                        className={`absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center hover:bg-white transition-all shadow-lg ${wishlist.includes(product._id) ? "text-destructive" : "text-muted-foreground"}`}
                        onClick={() => toggleWishlist(product._id)}
                      >
                        <Heart className={`w-5 h-5 ${wishlist.includes(product._id) ? "fill-current" : ""}`} />
                      </button>
                      <Badge className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-md text-foreground border-none shadow-sm font-bold px-3 py-1">
                        {product.category}
                      </Badge>
                      {hasLocation && product.coordinates && (
                        <div className="absolute top-4 left-4 flex gap-2">
                          <Badge className="bg-white/80 backdrop-blur-md text-primary border-none shadow-sm">
                            <Navigation className="w-3 h-3 mr-1" />
                            {calculateDistance(product.coordinates.lat, product.coordinates.lng)?.toFixed(1)} km
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-bold">4.8</span>
                        <span className="text-xs text-muted-foreground">(24 reviews)</span>
                      </div>
                      <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-3 h-3 text-primary" />
                        </div>
                        <p className="text-xs font-medium text-muted-foreground italic">By {product.farmerName}</p>
                      </div>

                      {product.location && (
                        <div className="flex items-center gap-1.5 mb-3 text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">{product.location}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-4">
                        <div className="flex items-center gap-1 bg-primary/5 text-primary px-2 py-1 rounded-full border border-primary/10">
                          <Clock className="w-3 h-3" />
                          Uploaded: {new Date(product.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                          <Package className="w-3 h-3" />
                          {product.quantityAvailable} {product.unit} left
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <div>
                          <span className="text-2xl font-black text-primary">₹{product.price}</span>
                          <span className="text-xs text-muted-foreground ml-1">/{product.unit}</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addToCart(product)}
                          className="bg-primary hover:bg-primary/90 rounded-xl px-5 py-5 font-bold shadow-lg shadow-primary/20"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
      case "orders":
        return (
          <div className="space-y-6 pt-16 lg:pt-0">
            <h2 className="text-3xl font-bold">My <span className="text-primary">Orders</span></h2>
            {ordersLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : orders.length === 0 ? (
              <Card className="py-20 text-center bg-muted/20 border-dashed rounded-3xl">
                <Package className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">No orders found</p>
                <Button className="mt-4 rounded-xl" onClick={() => setActiveView("marketplace")}>
                  Explore Marketplace
                </Button>
              </Card>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <Card key={order._id} className="rounded-3xl border-primary/10 overflow-hidden">
                    <CardHeader className="bg-primary/5 border-b border-primary/10 flex flex-row items-center justify-between py-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded-xl border">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Order ID: {order._id.slice(-8)}</p>
                          <p className="text-sm font-black">{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
                        </div>
                      </div>
                      <Badge className={
                        order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                          order.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' :
                            'bg-blue-100 text-blue-700'
                      }>
                        {order.status}
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-4">
                              <img src={item.product?.image} alt={item.product?.name} className="w-16 h-16 object-cover rounded-xl border" />
                              <div>
                                <p className="font-bold">{item.product?.name || "Product Removed"}</p>
                                <p className="text-sm text-muted-foreground">{item.quantity} x ₹{item.price}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="bg-muted/30 rounded-2xl p-4 space-y-2">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Shipping Address</p>
                          <p className="text-sm font-bold">{order.shippingAddress.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.shippingAddress.houseDetails}, {order.shippingAddress.street}, {order.shippingAddress.areaName}
                          </p>
                          <p className="text-xs text-muted-foreground">Phone: {order.shippingAddress.phone}</p>
                          <div className="pt-2 border-t mt-2 flex justify-between items-end">
                            <div>
                              <p className="text-[10px] text-muted-foreground font-bold uppercase">Payment</p>
                              <p className="text-xs font-bold text-primary">Cash on Delivery</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-muted-foreground font-bold uppercase">Total</p>
                              <p className="text-xl font-black text-primary">₹{order.totalAmount}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
      case "profile":
        return (
          <div className="space-y-6 pt-16 lg:pt-0">
            <h2 className="text-3xl font-bold">Account <span className="text-primary">Settings</span></h2>
            <Card className="rounded-3xl overflow-hidden border-primary/10">
              <CardHeader className="bg-primary/5 border-b border-primary/10">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary border-4 border-white shadow-xl">
                    <User className="w-12 h-12" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{user?.name}</h3>
                    <p className="text-muted-foreground capitalize font-medium">{userRole} Account</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-8 pt-4 border-t">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Full Name</label>
                    <p className="text-lg font-medium">{user?.name || "Not set"}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Email Address</label>
                    <p className="text-lg font-medium">{user?.email}</p>
                  </div>
                </div>
                <div className="pt-6">
                  <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-3 rounded-xl h-12 px-6 border-primary/20 hover:bg-primary/5 hover:text-primary">
                        <Settings className="w-4 h-4" />
                        Edit Profile Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label>Name (Read-only)</Label>
                          <Input value={user?.name} disabled className="bg-muted text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                          <Label>Email (Read-only)</Label>
                          <Input value={user?.email} disabled className="bg-muted text-muted-foreground" />
                        </div>
                        <div className="space-y-2 pt-4 border-t">
                          <Label>New Password</Label>
                          <Input
                            type="password"
                            placeholder="Min 6 characters"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Confirm New Password</Label>
                          <Input
                            type="password"
                            placeholder="Re-enter password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="submit"
                          className="w-full"
                          onClick={handleUpdatePassword}
                          disabled={updatingProfile || !newPassword}
                        >
                          {updatingProfile && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                          Save Password
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case "market-prices":
        return (
          <div className="animate-fade-in space-y-8">
            <div className="mb-2">
              <h1 className="text-4xl font-black text-foreground mb-2">Market <span className="text-primary text-5xl">Analysis</span></h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                Compare current market rates with application prices
              </p>
            </div>
            <MarketPrices />
          </div>
        );
      case "messages":
        return (
          <div className="space-y-6 pt-16 lg:pt-0">
            <h2 className="text-3xl font-bold">My <span className="text-primary">Messages</span></h2>
            {messages.length === 0 ? (
              <Card className="py-20 text-center bg-muted/20 border-dashed rounded-3xl">
                <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">No new notifications</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <Card key={msg._id} className={`rounded-3xl border-l-8 ${msg.isRead ? 'border-primary/20' : 'border-primary shadow-xl'} overflow-hidden`}>
                    <CardContent className="p-6 flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${msg.type === 'Packing' ? 'bg-blue-100 text-blue-600' : 'bg-primary/10 text-primary'}`}>
                        {msg.type === 'Packing' ? <Package className="w-6 h-6" /> : <Info className="w-6 h-6" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className={`text-lg ${msg.isRead ? 'text-muted-foreground' : 'font-black text-foreground'}`}>{msg.message}</p>
                          <span className="text-xs text-muted-foreground font-bold whitespace-nowrap ml-4">
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mt-3 flex gap-3">
                          <Badge variant="outline" className="rounded-lg">{msg.type}</Badge>
                          <Button variant="link" size="sm" className="h-auto p-0 text-primary font-bold" onClick={() => setActiveView('orders')}>Track Order</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-background border-r hidden lg:block z-40">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20 transition-all group-hover:scale-110 group-hover:-rotate-6">
              <Leaf className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-black tracking-tight">
              Agri<span className="text-primary">Mart</span>
            </span>
          </Link>
        </div>

        <nav className="px-4 space-y-2 mt-8">
          <SidebarLink icon={Store} label="Marketplace" active={activeView === "marketplace"} onClick={() => setActiveView("marketplace")} />
          <SidebarLink icon={IndianRupee} label="Market Prices" active={activeView === "market-prices"} onClick={() => setActiveView("market-prices")} />
          <SidebarLink icon={Package} label="My Orders" active={activeView === "orders"} onClick={() => setActiveView("orders")} />
          <SidebarLink icon={MessageSquare} label="Messages" active={activeView === "messages"} onClick={() => setActiveView("messages")} />
          <SidebarLink icon={User} label="My Profile" active={activeView === "profile"} onClick={() => setActiveView("profile")} />
          <Link to="/help/user">
            <SidebarLink icon={HelpCircle} label="Help Centre" />
          </Link>
        </nav>

        <div className="absolute bottom-8 left-4 right-4 space-y-3">
          <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 mb-4">
            <p className="text-[10px] font-bold text-primary uppercase mb-1">Support Available</p>
            <p className="text-xs text-muted-foreground leading-tight">Need help with your orders? Our team is here.</p>
          </div>
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:ml-64 min-h-screen relative flex flex-col">
        {/* Floating Actions (Top Right) */}
        <div className="absolute top-6 right-6 z-30 flex items-center gap-4">
          {/* Advanced Filters Button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative bg-white/50 backdrop-blur-xl hover:bg-primary/10 hover:text-primary rounded-2xl transition-all shadow-xl shadow-black/5 border border-white/40 h-12 w-12"
              >
                <Filter className={`w-5 h-5 ${(selectedCategory !== "All" || priceRange[0] > 0 || priceRange[1] < 5000) ? "text-primary" : ""}`} />
                {(selectedCategory !== "All" || priceRange[0] > 0 || priceRange[1] < 5000) && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    !
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-6 rounded-3xl border-primary/10 shadow-2xl backdrop-blur-xl bg-white/95" align="end">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-xl">Filters</h4>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-primary font-bold hover:bg-primary/5" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="rounded-xl border-primary/10 h-10">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-primary/10">
                      {["All", "Vegetables", "Fruits", "Grains", "Dairy", "Spices", "Organic", "Oil", "Leaves"].map(cat => (
                        <SelectItem key={cat} value={cat} className="rounded-lg">{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Price Range</Label>
                    <span className="text-xs font-bold text-primary">₹{priceRange[0]} - ₹{priceRange[1]}</span>
                  </div>
                  <Slider
                    defaultValue={[0, 5000]}
                    max={5000}
                    step={50}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="py-4"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Sort By</Label>
                  <Select value={selectedSort} onValueChange={setSelectedSort}>
                    <SelectTrigger className="rounded-xl border-primary/10 h-10">
                      <SelectValue placeholder="Sort order" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-primary/10">
                      <SelectItem value="newest" className="rounded-lg">Newest First</SelectItem>
                      <SelectItem value="price-low" className="rounded-lg">Price: Low to High</SelectItem>
                      <SelectItem value="price-high" className="rounded-lg">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="icon"
            className="relative bg-white/50 backdrop-blur-xl hover:bg-primary/10 hover:text-primary rounded-2xl transition-all shadow-xl shadow-black/5 border border-white/40 h-12 w-12"
            onClick={() => setShowWishlist(true)}
          >
            <Heart className={`w-5 h-5 ${wishlist.length > 0 ? "fill-destructive text-destructive" : ""}`} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-destructive text-destructive-foreground text-[10px] font-black rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                {wishlist.length}
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative bg-white/50 backdrop-blur-xl hover:bg-primary/10 hover:text-primary rounded-2xl transition-all shadow-xl shadow-black/5 border border-white/40 h-12 w-12"
            onClick={() => setShowCart(true)}
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-primary text-primary-foreground text-[10px] font-black rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                {cartCount}
              </span>
            )}
          </Button>

          <div className="flex items-center gap-3 bg-white/50 backdrop-blur-xl pl-2 pr-4 py-2 rounded-2xl border border-white/40 shadow-xl shadow-black/5 ml-2 hover:bg-white transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform">
              <User className="w-5 h-5" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-black leading-none">{user?.name || "Guest"}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 uppercase font-bold">{userRole}</p>
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
          {renderContent()}
        </div>
      </main>

      {/* Cart Sidebar Overlay */}
      {showCart && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowCart(false)}>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500" onClick={(e) => e.stopPropagation()}>
            <div className="p-8 border-b flex items-center justify-between bg-primary text-primary-foreground">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black">Your Cart</h2>
                  <p className="text-xs text-white/70 font-bold">{cartCount} Items Selected</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="hover:bg-white/20 text-white rounded-xl" onClick={() => setShowCart(false)}>
                <Plus className="rotate-45 w-6 h-6" />
              </Button>
            </div>

            <div className="flex-1 p-8 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6">
                    <ShoppingCart className="w-10 h-10 text-primary/30" />
                  </div>
                  <p className="text-xl font-bold text-muted-foreground">Your cart is empty</p>
                  <Button variant="link" className="text-primary font-bold" onClick={() => setShowCart(false)}>Start Shopping Now</Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.map((item) => (
                    <div key={item.product._id} className="flex gap-4 p-5 border-primary/5 bg-muted/30 rounded-3xl hover:bg-muted/50 transition-colors shadow-sm border">
                      <img src={item.product.image} alt={item.product.name} className="w-24 h-24 object-cover rounded-2xl shadow-md border-2 border-white" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-lg">{item.product.name}</h3>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/40 hover:text-destructive hover:bg-destructive/10 rounded-lg" onClick={() => removeFromCart(item.product._id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-primary font-black text-lg">₹{item.product.price}<span className="text-xs text-muted-foreground font-medium ml-1">/{item.product.unit}</span></p>
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center gap-3 bg-white border border-primary/10 rounded-xl p-1 shadow-inner">
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/5 rounded-lg" onClick={() => updateCartQuantity(item.product._id, -1)}>
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-black">{item.quantity}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/5 rounded-lg" onClick={() => updateCartQuantity(item.product._id, 1)}>
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="ml-auto font-black text-primary">₹{item.product.price * item.quantity}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-8 border-t bg-muted/10">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Total Payable</span>
                  <span className="font-black text-4xl text-primary">₹{cartTotal}</span>
                </div>
                <Button
                  className="w-full h-16 text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 rounded-2xl"
                  size="lg"
                  onClick={() => {
                    setShowCart(false);
                    setCheckoutOpen(true);
                  }}
                >
                  Place Order Now
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto rounded-3xl z-[1000]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Delivery Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  placeholder="Receiver's name"
                  value={shippingDetails.name}
                  onChange={(e) => setShippingDetails({ ...shippingDetails, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Number</Label>
                <Input
                  placeholder="10-digit mobile"
                  value={shippingDetails.phone}
                  onChange={(e) => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                placeholder="email@example.com"
                value={shippingDetails.email}
                onChange={(e) => setShippingDetails({ ...shippingDetails, email: e.target.value })}
              />
            </div>

            <div className="space-y-2 border-t pt-4">
              <Label className="flex items-center justify-between">
                <span>Location</span>
                <Button variant="link" size="sm" className="h-auto p-0 text-primary" onClick={handleUseCurrentLocation}>
                  <Navigation className="w-3 h-3 mr-1" /> Use Current Location
                </Button>
              </Label>
              <Input
                placeholder="GPS Coordinates or Location Name"
                value={shippingDetails.location}
                onChange={(e) => setShippingDetails({ ...shippingDetails, location: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>House/Flat No, Building Name</Label>
              <Input
                placeholder="e.g., Flat 402, Green Apartments"
                value={shippingDetails.houseDetails}
                onChange={(e) => setShippingDetails({ ...shippingDetails, houseDetails: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Street name, Landmark</Label>
                <Input
                  placeholder="e.g., MG Road, Near Park"
                  value={shippingDetails.street}
                  onChange={(e) => setShippingDetails({ ...shippingDetails, street: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Area, Colony</Label>
                <Input
                  placeholder="e.g., Indiranagar"
                  value={shippingDetails.areaName}
                  onChange={(e) => setShippingDetails({ ...shippingDetails, areaName: e.target.value })}
                />
              </div>
            </div>

            <div className="bg-primary/5 p-4 rounded-2xl space-y-2 border border-primary/10">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order Subtotal:</span>
                <span className="font-bold">₹{cartTotal}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Shipping Charges:</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="text-primary hover:text-primary/70 transition-colors">
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-4 rounded-2xl shadow-2xl border-primary/10 bg-white/95 backdrop-blur-md">
                      <div className="space-y-3">
                        <h4 className="font-black text-xs uppercase tracking-widest text-primary">Shipping Breakdown</h4>
                        <div className="space-y-1.5 text-[10px] font-medium text-muted-foreground">
                          <p className="flex justify-between"><span>• Distance (Zones):</span> <span className="text-foreground">Factor Considered</span></p>
                          <p className="flex justify-between"><span>• Weight & Dimensions:</span> <span className="text-foreground">Calculated</span></p>
                          <p className="flex justify-between"><span>• Handling & Surcharges:</span> <span className="text-foreground">Included</span></p>
                          <p className="flex justify-between"><span>• Value Insurance:</span> <span className="text-foreground">Applied</span></p>
                        </div>
                        <div className="pt-2 border-t border-primary/5">
                          <p className="text-[10px] font-bold text-primary italic">Note: Platform capped maximum shipping at ₹120 for customer benefit.</p>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <span className={`font-bold ${shippingCharges === 0 ? "text-emerald-600" : ""}`}>
                  {shippingCharges === 0 ? "FREE" : `₹${shippingCharges}`}
                </span>
              </div>
              {cartTotal <= 700 && (
                <p className="text-[10px] text-primary font-bold">Add ₹{701 - cartTotal} more for FREE delivery!</p>
              )}
              <div className="flex justify-between text-lg pt-2 border-t border-primary/10">
                <span className="font-black">Total Payable:</span>
                <span className="font-black text-primary">₹{totalWithShipping}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-xl border border-dashed text-xs text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-primary" />
                Payment Mode: Only Cash on Delivery available
              </div>
              <div
                className="flex items-start gap-3 p-4 bg-destructive/5 rounded-xl border border-destructive/10 cursor-pointer hover:bg-destructive/10 transition-colors"
                onClick={() => setNoReturnAccepted(!noReturnAccepted)}
              >
                <Checkbox
                  id="no-return-policy"
                  checked={noReturnAccepted}
                  onCheckedChange={(checked) => setNoReturnAccepted(checked as boolean)}
                  className="mt-0.5 border-destructive/30 data-[state=checked]:bg-destructive data-[state=checked]:text-white"
                />
                <div className="space-y-1">
                  <Label htmlFor="no-return-policy" className="text-xs font-black text-destructive cursor-pointer">
                    I AGREE TO NO RETURN/EXCHANGE POLICY
                  </Label>
                  <p className="text-[10px] text-destructive/70 font-bold uppercase leading-tight">
                    Confirm that you have checked the weights and quality before placing this order.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              className="w-full h-12 text-lg font-black shadow-xl shadow-primary/20"
              onClick={handlePlaceOrder}
              disabled={placingOrder}
            >
              {placingOrder && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Confirm Order (₹{totalWithShipping})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Wishlist Sidebar Overlay */}
      {showWishlist && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowWishlist(false)}>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500" onClick={(e) => e.stopPropagation()}>
            <div className="p-8 border-b flex items-center justify-between bg-destructive text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                  <Heart className="w-6 h-6 fill-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black">Your Wishlist</h2>
                  <p className="text-xs text-white/70 font-bold">{wishlist.length} Items Saved</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="hover:bg-white/20 text-white rounded-xl" onClick={() => setShowWishlist(false)}>
                <Plus className="rotate-45 w-6 h-6" />
              </Button>
            </div>

            <div className="flex-1 p-8 overflow-y-auto">
              {wishlistProducts.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-24 h-24 rounded-full bg-destructive/5 flex items-center justify-center mx-auto mb-6">
                    <Heart className="w-10 h-10 text-destructive/30" />
                  </div>
                  <p className="text-xl font-bold text-muted-foreground">Your wishlist is empty</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {wishlistProducts.map((product) => (
                    <div key={product._id} className="flex gap-4 p-5 border-destructive/5 bg-muted/30 rounded-3xl hover:bg-muted/50 transition-colors shadow-sm border">
                      <img src={product.image} alt={product.name} className="w-24 h-24 object-cover rounded-2xl shadow-md border-2 border-white" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg">{product.name}</h3>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/40 hover:text-destructive hover:bg-destructive/10 rounded-lg" onClick={() => toggleWishlist(product._id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-primary font-black text-lg mb-4">₹{product.price}<span className="text-xs text-muted-foreground font-medium ml-1">/{product.unit}</span></p>
                        <Button size="sm" className="w-full bg-primary hover:bg-primary/90 rounded-xl font-bold shadow-lg shadow-primary/20" onClick={() => {
                          addToCart(product);
                          setShowWishlist(false);
                          setShowCart(true);
                        }}>
                          Move to Cart
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
