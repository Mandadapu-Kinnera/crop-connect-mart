import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useGeolocation } from "@/hooks/useGeolocation";
import { supabase } from "@/integrations/supabase/client";
import {
  Search,
  MapPin,
  ShoppingCart,
  Heart,
  Star,
  Package,
  Clock,
  CheckCircle,
  Truck,
  Settings,
  User,
  LogOut,
  Navigation,
  Loader2,
} from "lucide-react";
import vegetablesImage from "@/assets/vegetables-basket.jpg";
import fruitsImage from "@/assets/fruits-display.jpg";
import riceImage from "@/assets/rice-field.jpg";

// Placeholder products with coordinates
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

export default function UserDashboard() {
  const { user, userRole, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { latitude, longitude, loading: locationLoading, error: locationError, getLocation, calculateDistance, hasLocation } = useGeolocation();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showNearby, setShowNearby] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("buyer_id", user.id)
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      setOrders(data);
    }
  };

  const handleNearMeClick = () => {
    if (!hasLocation) {
      getLocation();
    }
    setShowNearby(true);
  };

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
        return matchesSearch && product.distance !== null && product.distance < 100; // Within 100km
      }
      return matchesSearch;
    })
    .sort((a, b) => {
      if (showNearby && a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }
      return 0;
    });

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
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome, <span className="text-primary">{user?.user_metadata?.full_name || "User"}</span>
              </h1>
              <p className="text-muted-foreground">
                Browse fresh produce from verified farmers
              </p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Button variant="outline" size="sm" onClick={() => navigate("/settings")}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
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
                      <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background">
                        <Heart className="w-4 h-4" />
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
                        <Button size="sm">
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
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
