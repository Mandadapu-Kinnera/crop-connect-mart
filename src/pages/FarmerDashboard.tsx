import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Leaf,
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  Settings,
  HelpCircle,
  History,
  Plus,
  Loader2,
  LogOut,
  Clock,
  AlertCircle,
  IndianRupee,
  User,
  Mail,
  Phone,
  X,
  Trash2,
  Edit,
  Eye,
  Camera,
  MapPin,
  Locate,
  RefreshCw,
  Clock3,
  PackageCheck
} from "lucide-react";
import { MarketPrices } from "@/components/market/MarketPrices";



type ActiveView = "services" | "orders" | "clients" | "messages" | "history" | "settings" | "market-prices";

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  unit: string;

  quantityAvailable: number;
  image: string;
  location?: string;
  coordinates?: { lat: number; lng: number };
  createdAt: string;
}

function SidebarLink({
  icon: Icon,
  label,
  active,
  count,
  onClick
}: {
  icon: any;
  label: string;
  active?: boolean;
  count?: number;
  onClick?: () => void;
}) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-2.5 rounded-lg cursor-pointer transition-colors ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
      </div>
      {count !== undefined && count > 0 && (
        <Badge variant={active ? "secondary" : "secondary"} className="h-5 px-2">{count}</Badge>
      )}
    </div>
  );
}


export default function FarmerDashboard() {
  const { user, userRole, signOut, farmerStatus, rejectionReason, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [editProductOpen, setEditProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>("services");
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);


  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    category: "Vegetables",
    price: "",
    unit: "kg",
    quantityAvailable: "",
    image: "",
    location: "",
    coordinates: { lat: 17.3850, lng: 78.4867 }, // Default to Hyderabad
  });
  const [isLocating, setIsLocating] = useState(false);

  // Profile Edit State
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      if (data && data.display_name) {
        // Extract a shorter name if possible, e.g., suburb or city
        const address = data.address;
        const shortName = address.suburb || address.town || address.city || address.county || data.display_name.split(',')[0];
        setNewProduct(prev => ({ ...prev, location: shortName, coordinates: { lat, lng } }));
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast({ title: "Location Error", description: "Could not fetch address details", variant: "destructive" });
    }
  };

  const handleGetLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await reverseGeocode(latitude, longitude);
          setIsLocating(false);
          toast({ title: "Location Found", description: "Coordinates updated successfully." });
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast({ title: "Location Error", description: "Please enable location services or enter manually.", variant: "destructive" });
          setIsLocating(false);
        }
      );
    } else {
      toast({ title: "Not Supported", description: "Geolocation is not supported by your browser.", variant: "destructive" });
      setIsLocating(false);
    }
  };



  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/products/my-products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
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

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/orders/farmer-orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching farmer orders:', error);
    } finally {
      setOrdersLoading(false);
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
        console.log("Raw notifications fetched:", data);

        // Diagnostic toast
        toast({
          title: "System Synchronization",
          description: `Fetched ${data.length} items. Role: ${userRole}. Status: ${farmerStatus}`,
          variant: data.length === 0 ? "destructive" : "default"
        });

        // Separate Notifications (Messages) from Activities (History)
        setMessages(data.filter((n: any) => n.type?.toLowerCase() !== 'activity'));
        setHistory(data.filter((n: any) => n.type?.toLowerCase() === 'activity').map((n: any) => ({
          id: n._id,
          event: n.message,
          time: new Date(n.createdAt).toLocaleString()
        })));
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        toast({ title: "Order Updated", description: `Order status changed to ${status}` });
        fetchOrders();
        fetchNotifications(); // Refresh both messages and history from server persistent data
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast({ title: "Update Failed", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (farmerStatus === "approved") {
      setShowWelcomeBanner(true);
      fetchProducts();
      fetchOrders();
      fetchNotifications();
    }
  }, [farmerStatus]);

  const testConnectivity = async () => {
    try {
      toast({ title: "Testing...", description: "Connecting to backend at 127.0.0.1:5000" });
      const response = await fetch('/api/products');
      if (response.ok) {
        toast({ title: "Success!", description: "Connected to backend successfully. Products fetched." });
      } else {
        toast({ title: "Server Error", description: `Server responded with ${response.status}`, variant: "destructive" });
      }
    } catch (error: any) {
      console.error('Diagnostic Error:', error);
      toast({ title: "Connection Failed", description: `Cannot reach 127.0.0.1:5000. Error: ${error.message}`, variant: "destructive" });
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please upload an image smaller than 5MB", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (editProductOpen) {
          setSelectedProduct(prev => prev ? { ...prev, image: reader.result as string } : null);
        } else {
          setNewProduct({ ...newProduct, image: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.quantityAvailable || !newProduct.image || !newProduct.location) {
      toast({ title: "Missing fields", description: "Please fill all required fields and select a location.", variant: "destructive" });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Sending Product Info:', {
        name: newProduct.name,
        imageLength: newProduct.image?.length || 0,
        token: token ? 'Provided' : 'Missing'
      });
      // Using 127.0.0.1 to avoid potential localhost resolution issues on Windows
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price),

          quantityAvailable: parseFloat(newProduct.quantityAvailable),
          location: newProduct.location,
          coordinates: newProduct.coordinates
        })
      });

      if (response.ok) {
        toast({ title: "Product Added", description: "Your product has been listed successfully." });
        setAddProductOpen(false);
        setNewProduct({
          name: "",
          description: "",
          category: "Vegetables",
          price: "",
          unit: "kg",
          quantityAvailable: "",

          image: "",
          location: "",
          coordinates: { lat: 17.3850, lng: 78.4867 }
        });
        fetchProducts();
      } else {
        const data = await response.json();
        console.error('Product Add Failed Response:', data);
        toast({ title: "Error", description: data.message || "Failed to add product", variant: "destructive" });
      }
    } catch (error: any) {
      console.error('Product Add Fetch Error:', error);
      // Detailed error for debugging
      const errorMessage = error.message || "Unknown network error";
      toast({
        title: "Connection Failed",
        description: `Could not reach the server (${errorMessage}). Please ensure the backend is running and you have a stable connection.`,
        variant: "destructive"
      });
    }
  };

  const handleEditProduct = async () => {
    if (!selectedProduct) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/products/${selectedProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(selectedProduct)
      });

      if (response.ok) {
        toast({ title: "Product Updated", description: "Changes saved successfully." });
        setEditProductOpen(false);
        fetchProducts();
      }
    } catch (error: any) {
      console.error('Product Edit Fetch Error:', error);
      toast({
        title: "Connection Error",
        description: `Could not reach server: ${error.message}. Please check if the backend is running.`,
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({ title: "Product Deleted", description: "Product has been removed from marketplace." });
        fetchProducts();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete product", variant: "destructive" });
    }
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

  // Farmer application status checks
  if (farmerStatus === "pending") {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-yellow-600 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Approval Pending</h1>
          <p className="text-muted-foreground mb-6">
            Your farmer profile is currently under review by our administration. This usually takes 24-48 hours. We'll notify you via email once approved.
          </p>
          <div className="space-y-3">
            <Button variant="outline" className="w-full" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
            <Link to="/help/farmer" className="text-sm text-primary hover:underline">
              Contact Support
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (farmerStatus === "rejected") {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 border-destructive/20">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Registration Rejected</h1>
          <div className="bg-destructive/5 p-4 rounded-lg mb-6 text-left">
            <p className="text-sm font-semibold text-destructive mb-1">Reason for Rejection:</p>
            <p className="text-sm text-muted-foreground">{rejectionReason || "Documents provided were unclear or invalid."}</p>
          </div>
          <p className="text-sm text-muted-foreground mb-8">
            Please review the reason above and contact our support team to appeal or re-submit your application.
          </p>
          <div className="space-y-3">
            <Button className="w-full" onClick={() => navigate("/farmer/register")}>
              Re-submit Application
            </Button>
            <Button variant="outline" className="w-full" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
            <Link to="/help/farmer" className="text-sm text-primary hover:underline">
              Visit Help Centre
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case "services":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">My Inventory</h2>
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground">Manage your products and listings</p>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] text-primary" onClick={testConnectivity}>Check Server</Button>
                </div>
              </div>
              <Dialog open={addProductOpen} onOpenChange={setAddProductOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/95 shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4 mr-2" />
                    List New Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>List New Produce</DialogTitle>
                  </DialogHeader>
                  <div className="grid md:grid-cols-2 gap-6 py-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Product Name</Label>
                        <Input
                          placeholder="Fresh Green Chillies..."
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          placeholder="Grown organically in our farm..."
                          className="h-32"
                          value={newProduct.description}
                          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <select
                            className="w-full h-10 px-3 border rounded-md bg-background text-sm"
                            value={newProduct.category}
                            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                          >
                            <option>Vegetables</option>
                            <option>Fruits</option>
                            <option>Grains</option>
                            <option>Dairy</option>
                            <option>Organic</option>
                            <option>Oil</option>
                            <option>Leaves</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label>Unit</Label>
                          <select
                            className="w-full h-10 px-3 border rounded-md bg-background text-sm"
                            value={newProduct.unit}
                            onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                          >
                            <option>kg</option>
                            <option>gram</option>
                            <option>bunch</option>
                            <option>piece</option>
                            <option>dozen</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4 pt-2 border-t mt-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-semibold">Product Location</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 text-primary hover:text-primary hover:bg-primary/10"
                            onClick={handleGetLocation}
                            disabled={isLocating}
                          >
                            {isLocating ? (
                              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                            ) : (
                              <Locate className="h-3 w-3 mr-2" />
                            )}
                            Trace My GPS
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Latitude</Label>
                            <Input
                              type="number"
                              step="any"
                              placeholder="e.g. 17.3850"
                              value={newProduct.coordinates.lat}
                              onChange={(e) => {
                                const lat = parseFloat(e.target.value);
                                setNewProduct(prev => ({
                                  ...prev,
                                  coordinates: { ...prev.coordinates, lat: isNaN(lat) ? 0 : lat }
                                }));
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Longitude</Label>
                            <Input
                              type="number"
                              step="any"
                              placeholder="e.g. 78.4867"
                              value={newProduct.coordinates.lng}
                              onChange={(e) => {
                                const lng = parseFloat(e.target.value);
                                setNewProduct(prev => ({
                                  ...prev,
                                  coordinates: { ...prev.coordinates, lng: isNaN(lng) ? 0 : lng }
                                }));
                              }}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Address / Area Name</Label>
                          <div className="relative">
                            <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              value={newProduct.location}
                              onChange={(e) => setNewProduct(prev => ({ ...prev, location: e.target.value }))}
                              placeholder="e.g. Medchal, Hyderabad"
                              className="pl-9"
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            Enter coordinates manually or click <strong>Trace My GPS</strong> above to auto-detect.
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full h-8 text-xs"
                            onClick={() => reverseGeocode(newProduct.coordinates.lat, newProduct.coordinates.lng)}
                          >
                            Update Address from Coordinates
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Product Image</Label>
                        <div
                          className="border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all overflow-hidden relative group"
                          onClick={() => document.getElementById('product-image-upload')?.click()}
                        >
                          {newProduct.image ? (
                            <>
                              <img src={newProduct.image} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Camera className="text-white w-8 h-8" />
                              </div>
                            </>
                          ) : (
                            <>
                              <Camera className="w-8 h-8 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Click to upload product photo</span>
                            </>
                          )}
                          <input
                            id="product-image-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Price (₹)</Label>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Stock Quantity</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={newProduct.quantityAvailable}
                            onChange={(e) => setNewProduct({ ...newProduct, quantityAvailable: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="pt-4">
                        <Button className="w-full h-12 text-lg" onClick={handleAddProduct}>
                          Publish to Marketplace
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading your inventory...</p>
              </div>
            ) : products.length === 0 ? (
              <Card className="border-dashed py-20 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Package className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">No Products Yet</h3>
                <p className="text-muted-foreground mb-6">Start by listing your first farm produce</p>
                <Button onClick={() => setAddProductOpen(true)}>List Your First Item</Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <Card key={product._id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-primary/10">
                    <div className="relative h-48">
                      <img src={product.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <Badge className="absolute top-2 right-2 bg-white/80 backdrop-blur-md text-foreground border-none shadow-sm font-bold">{product.category}</Badge>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{product.name}</h3>
                        <p className="text-primary font-bold">₹{product.price}/{product.unit}</p>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">Stock: {product.quantityAvailable} {product.unit}</span>
                          <span>Uploaded: {new Date(product.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:text-primary hover:bg-primary/10"
                            onClick={() => {
                              setSelectedProduct(product);
                              setEditProductOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteProduct(product._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Edit Product Dialog */}
            <Dialog open={editProductOpen} onOpenChange={setEditProductOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Product Details</DialogTitle>
                </DialogHeader>
                {selectedProduct && (
                  <div className="grid md:grid-cols-2 gap-6 py-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Product Name</Label>
                        <Input
                          value={selectedProduct.name}
                          onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          className="h-32"
                          value={selectedProduct.description}
                          onChange={(e) => setSelectedProduct({ ...selectedProduct, description: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <select
                          className="w-full h-10 px-3 border rounded-md bg-background text-sm"
                          value={selectedProduct.category}
                          onChange={(e) => setSelectedProduct({ ...selectedProduct, category: e.target.value })}
                        >
                          <option>Vegetables</option>
                          <option>Fruits</option>
                          <option>Grains</option>
                          <option>Dairy</option>
                          <option>Organic</option>
                          <option>Oil</option>
                          <option>Leaves</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Image</Label>
                        <div
                          className="border-2 rounded-xl h-40 overflow-hidden relative cursor-pointer"
                          onClick={() => document.getElementById('edit-image-upload')?.click()}
                        >
                          <img src={selectedProduct.image} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Camera className="text-white w-6 h-6" />
                          </div>
                          <input id="edit-image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Price</Label>
                          <Input
                            type="number"
                            value={selectedProduct.price}
                            onChange={(e) => setSelectedProduct({ ...selectedProduct, price: parseFloat(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Stock</Label>
                          <Input
                            type="number"
                            value={selectedProduct.quantityAvailable}
                            onChange={(e) => setSelectedProduct({ ...selectedProduct, quantityAvailable: parseFloat(e.target.value) })}
                          />
                        </div>
                      </div>
                      <Button className="w-full" onClick={handleEditProduct}>Update Listing</Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        );
      case "orders":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Customer Orders</h2>
              <Button variant="outline" size="sm" onClick={fetchOrders} className="gap-2">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </Button>
            </div>
            {ordersLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : orders.length === 0 ? (
              <Card className="border-dashed py-20 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">No Orders Yet</h3>
                <p className="text-muted-foreground">When customers buy your products, they will appear here</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order._id} className="overflow-hidden border-primary/10">
                    <div className="bg-primary/5 px-6 py-4 border-b border-primary/10 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border">
                          <Plus className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Order Reference</p>
                          <p className="text-sm font-black">{order._id.slice(-8)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`bg-white ${order.status === 'Packed' ? 'text-blue-600 border-blue-200' : ''}`}>
                          {order.status}
                        </Badge>
                        {(order.status === 'Confirmed' || order.status === 'Pending') && (
                          <Button
                            size="sm"
                            className="h-8 bg-blue-600 hover:bg-blue-700 text-xs gap-1.5"
                            onClick={() => updateOrderStatus(order._id, 'Packed')}
                          >
                            <PackageCheck className="w-3.5 h-3.5" /> Mark as Packed
                          </Button>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <p className="text-xs font-bold text-muted-foreground uppercase">Sold Items</p>
                            <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-bold animate-pulse">
                              Deadline: 24-48 Hours
                            </span>
                          </div>
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-4 items-center bg-muted/30 p-3 rounded-2xl">
                              <img src={item.product?.image} className="w-12 h-12 rounded-lg object-cover" alt="" />
                              <div>
                                <p className="font-bold text-sm">{item.product?.name}</p>
                                <p className="text-xs text-muted-foreground">Qty: {item.quantity} {item.product?.unit}</p>
                              </div>
                              <div className="ml-auto text-right">
                                <p className="font-bold text-primary">₹{item.price * item.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-4 border-l pl-8">
                          <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Customer Details</p>
                            <p className="font-bold">{order.shippingAddress.name}</p>
                            <p className="text-sm text-muted-foreground">{order.shippingAddress.phone}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Delivery Address</p>
                            <p className="text-sm text-muted-foreground leading-snug">
                              {order.shippingAddress.houseDetails}, {order.shippingAddress.street},<br />
                              {order.shippingAddress.areaName}
                            </p>
                          </div>
                          <div className="pt-4 border-t flex justify-between items-center">
                            <span className="text-xs font-bold uppercase text-muted-foreground">Order Date</span>
                            <span className="text-xs font-black">{new Date(order.createdAt).toLocaleString()}</span>
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
      case "messages":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Notification Center</h2>
              <Button variant="ghost" size="sm" onClick={fetchNotifications} className="gap-2">
                <RefreshCw className="w-4 h-4" /> Refresh
              </Button>
            </div>
            {messages.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No new notifications</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <Card key={msg._id} className={`border-l-4 ${msg.isRead ? 'border-primary/20' : 'border-primary shadow-md'}`}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={`p-2 rounded-xl ${msg.type === 'Order' ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'}`}>
                        {msg.type === 'Order' ? <ShoppingCart className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className={`text-sm ${msg.isRead ? 'text-muted-foreground' : 'font-bold'}`}>{msg.message}</p>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-4">
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {msg.type === 'Order' && (
                          <div className="mt-2 flex gap-2">
                            <Button variant="link" size="sm" className="h-auto p-0 text-[10px]" onClick={() => setActiveView('orders')}>View Order Details</Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
      case "history":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Tracked Activities</h2>
              <Button variant="ghost" size="sm" onClick={fetchNotifications} className="gap-2">
                <RefreshCw className="w-4 h-4" /> Refresh
              </Button>
            </div>
            {history.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Clock3 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No recent activity tracked</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {history.map((item) => (
                      <div key={item.id} className="p-4 flex justify-between items-center hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <div>
                            <p className="font-semibold text-sm">{item.event}</p>
                            <p className="text-xs text-muted-foreground">Status Logged Successfully</p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">{item.time}</span>
                      </div>
                    ))}
                    <div className="p-4 flex justify-between items-center opacity-50">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                        <div>
                          <p className="font-semibold text-sm">Store Opened</p>
                          <p className="text-xs text-muted-foreground">Onboarding Complete</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">Historical Baseline</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
      case "settings":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Account Settings</h2>
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Personal Details</Label>
                  <div className="grid md:grid-cols-2 gap-4 mt-2">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Full Name</p>
                      <p className="font-semibold">{user?.name}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-semibold">{user?.email}</p>
                    </div>
                  </div>
                </div>
                <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Edit className="w-4 h-4" />
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
              </CardContent>
            </Card>
          </div>
        );
      case "market-prices":
        return (
          <div className="animate-fade-in space-y-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-black text-foreground">Market <span className="text-primary">Intelligence</span></h2>
              <p className="text-muted-foreground text-sm uppercase font-bold tracking-widest">Pricing data for 28 states</p>
            </div>
            <MarketPrices />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-background border-r hidden lg:block z-40">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 transition-all group-hover:scale-110 group-hover:-rotate-3">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">
              Agri<span className="text-primary">Mart</span>
            </span>
          </Link>
        </div>

        <nav className="px-4 space-y-1.5 mt-4">
          <SidebarLink icon={Package} label="Inventory" active={activeView === "services"} onClick={() => setActiveView("services")} />
          <SidebarLink icon={ShoppingCart} label="Orders" active={activeView === "orders"} onClick={() => { setActiveView("orders"); fetchOrders(); }} />
          <SidebarLink icon={MessageSquare} label="Messages" active={activeView === "messages"} onClick={() => { setActiveView("messages"); fetchNotifications(); }} />
          <SidebarLink icon={IndianRupee} label="Market Prices" active={activeView === "market-prices"} onClick={() => setActiveView("market-prices")} />
          <SidebarLink icon={History} label="History" active={activeView === "history"} onClick={() => { setActiveView("history"); fetchNotifications(); }} />
          <Link to="/help/farmer">
            <SidebarLink icon={HelpCircle} label="Help Centre" />
          </Link>
          <div className="pt-4 mt-4 border-t px-2">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase px-2 mb-2 block">Configuration</Label>
            <SidebarLink icon={Settings} label="Settings" active={activeView === "settings"} onClick={() => setActiveView("settings")} />
          </div>
        </nav>

        <div className="absolute bottom-6 left-4 right-4">
          <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:ml-64 min-h-screen flex flex-col pt-4">
        <header className="px-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-none capitalize">{(activeView === 'services' ? 'Inventory' : activeView) + " Dashboard"}</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage your farm operations seamlessly</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success" className="h-8 px-4 rounded-full border-primary/20 bg-primary/5 text-primary">Verified Seller</Badge>
          </div>
        </header>

        <div className="px-6 flex-1 max-w-7xl w-full mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
