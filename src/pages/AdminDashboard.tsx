import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Leaf,
  Users,
  Sprout,
  Package,
  ShoppingCart,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Loader2,
  LogOut,
  TrendingUp,
  User,
  Mail,
  Phone,
  MapPin,
  Wheat,
  ExternalLink,
} from "lucide-react";

// Mock data
const initialFarmers = [
  {
    id: "1",
    user_id: "farmer-001",
    farm_name: "Green Valley Farm",
    farm_size: "10 acres",
    experience_years: 15,
    crops_grown: ["Tomatoes", "Rice", "Wheat"],
    approval_status: "pending",
    created_at: new Date().toISOString(),
    profiles: { full_name: "Ramesh Kumar", email: "ramesh@example.com" },
  },
  {
    id: "2",
    user_id: "farmer-002",
    farm_name: "Sunrise Farms",
    farm_size: "25 acres",
    experience_years: 20,
    crops_grown: ["Mangoes", "Bananas"],
    approval_status: "approved",
    created_at: new Date().toISOString(),
    profiles: { full_name: "Suresh Patil", email: "suresh@example.com" },
  },
];

const mockUsers: any[] = [];
const mockProducts: any[] = [];
const mockOrders: any[] = [];

type ActiveView = "dashboard" | "requests" | "farmers" | "users" | "products" | "orders" | "uploads";

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

export default function AdminDashboard() {
  const { user, userRole, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [farmers, setFarmers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");

  const [selectedFarmer, setSelectedFarmer] = useState<any>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || userRole !== "admin")) {
      navigate("/auth");
      return;
    }
    fetchFarmers();
    fetchUsers();
    fetchProducts();
    fetchOrders();
  }, [user, userRole, authLoading, navigate]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/orders", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/users", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const fetchFarmers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/farmers", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Admin Dashboard: Received Farmers", data);
        setFarmers(data);
      }
    } catch (error) {
      console.error("Failed to fetch farmers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchFarmers();
    fetchUsers();
    fetchProducts();
    fetchOrders();
  };

  const handleApproveFarmer = async () => {
    console.log("Approving farmer:", selectedFarmer);
    if (!selectedFarmer) {
      toast({ title: "No farmer selected", variant: "destructive" });
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/farmers/${selectedFarmer._id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: "approved" })
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setFarmers(farmers.map(f => f._id === selectedFarmer._id ? updatedProfile : f));
        toast({
          title: "Farmer Approved",
          description: "The farmer has been approved and notified.",
        });
        setApproveDialogOpen(false);
        setSelectedFarmer(null);
      } else {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to approve farmer");
      }
    } catch (error: any) {
      console.error("Approve Error:", error);
      toast({
        title: "Operation failed",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    }
  };

  const handleRejectFarmer = async () => {
    if (!selectedFarmer) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/farmers/${selectedFarmer._id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          status: "rejected",
          rejectionReason: rejectionReason
        })
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setFarmers(farmers.map(f => f._id === selectedFarmer._id ? updatedProfile : f));
        toast({
          title: "Farmer Rejected",
          description: "The farmer has been notified.",
        });
        setRejectDialogOpen(false);
        setSelectedFarmer(null);
        setRejectionReason("");
      } else {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to reject farmer");
      }
    } catch (error: any) {
      console.error("Reject Error:", error);
      toast({
        title: "Operation failed",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate stats
  const pendingFarmers = farmers.filter((f) => f.status?.toLowerCase() === "pending" || f.status?.toLowerCase() === "incomplete").length;
  const approvedFarmers = farmers.filter((f) => f.status === "approved").length;
  const totalUsers = users.length;
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((o) => o.status === "Delivered" || o.status === "Pending") // Basic revenue including pending COD
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const filteredFarmers = farmers.filter((farmer) => {
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = farmer.name?.toLowerCase().includes(searchLower);
    const emailMatch = farmer.email?.toLowerCase().includes(searchLower);
    const cropsMatch = farmer.crops?.toLowerCase().includes(searchLower);
    const phoneMatch = farmer.phone?.toLowerCase().includes(searchLower);

    return !searchQuery || nameMatch || emailMatch || cropsMatch || phoneMatch;
  });

  const filteredUsers = users.filter((u) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      u.name?.toLowerCase().includes(searchLower) ||
      u.email?.toLowerCase().includes(searchLower)
    );
  });

  const filteredProducts = products.filter((p) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(searchLower) ||
      p.category?.toLowerCase().includes(searchLower)
    );
  });

  const renderContent = () => {
    switch (activeView) {
      case "requests":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Pending Farmer Requests</h2>
            {filteredFarmers.filter((f) => f.status?.toLowerCase() === "pending" || f.status?.toLowerCase() === "incomplete").length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                  <p className="text-muted-foreground">No pending farmer requests</p>
                </CardContent>
              </Card>
            ) : (
              filteredFarmers
                .filter((f) => f.status?.toLowerCase() === "pending" || f.status?.toLowerCase() === "incomplete")
                .map((farmer) => (
                  <Card key={farmer._id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{farmer.name || "Unknown"}</h3>
                            <Badge variant={farmer.status?.toLowerCase() === 'incomplete' ? "outline" : "secondary"}>
                              {farmer.status?.toLowerCase() === 'pending' ? 'Under Review' :
                                farmer.status?.toLowerCase() === 'incomplete' ? 'Profile Incomplete' : farmer.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{farmer.email}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                            <div><span className="text-muted-foreground">Location: </span>{farmer.district || "N/A"}, {farmer.state || "N/A"}</div>
                            <div><span className="text-muted-foreground">Size: </span>{farmer.farmSize || "N/A"} acres</div>
                            <div><span className="text-muted-foreground">Experience: </span>{farmer.experience || 0} years</div>
                            <div><span className="text-muted-foreground">Requested: </span>{new Date(farmer.submittedAt).toLocaleDateString()} at {new Date(farmer.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                          {farmer.crops && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">{farmer.crops}</Badge>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setSelectedFarmer(farmer); setReviewDialogOpen(true); }}
                            title={farmer.status === 'incomplete' ? "Review basic user information" : "Review full application"}
                          >
                            Review
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => { setSelectedFarmer(farmer); setRejectDialogOpen(true); }}
                          >
                            <XCircle className="w-4 h-4 mr-1" />Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => { setSelectedFarmer(farmer); setApproveDialogOpen(true); }}
                            title={farmer.status?.toLowerCase() === 'incomplete' ? "Warning: Full profile data is missing" : "Approve application"}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />Approve
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        );

      case "farmers":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">All Farmers</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Contact</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Crops</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Exp</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Registered</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFarmers.map((farmer) => (
                    <tr key={farmer._id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <p className="font-medium">{farmer.name}</p>
                        <p className="text-sm text-muted-foreground">{farmer.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm">{farmer.phone || "N/A"}</p>
                        <p className="text-xs text-muted-foreground">{farmer.district ? `${farmer.district}, ${farmer.state}` : "No address"}</p>
                      </td>
                      <td className="py-3 px-4 text-sm">{farmer.crops || "N/A"}</td>
                      <td className="py-3 px-4 text-sm">{farmer.experience ? `${farmer.experience}y` : "N/A"}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${farmer.status?.toLowerCase() === "approved" ? "bg-green-500" :
                            farmer.status?.toLowerCase() === "rejected" ? "bg-red-500" :
                              farmer.status?.toLowerCase() === "pending" ? "bg-yellow-500" :
                                "bg-gray-400"
                            }`}></span>
                          <Badge variant={farmer.status?.toLowerCase() === "approved" ? "success" : farmer.status?.toLowerCase() === "rejected" ? "destructive" : farmer.status?.toLowerCase() === "incomplete" ? "outline" : "secondary"}>
                            {farmer.status?.toLowerCase() === 'pending' ? 'Under Review' :
                              farmer.status?.toLowerCase() === 'incomplete' ? 'Profile Incomplete' : farmer.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{new Date(farmer.submittedAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setSelectedFarmer(farmer); setReviewDialogOpen(true); }}
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "users":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">All Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{u.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{u.email}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="capitalize">{u.role || "user"}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "products":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">All Products</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                      <Badge variant={product.is_active ? "success" : "secondary"}>
                        {product.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price:</span>
                        <span>₹{product.price}/{product.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Farmer:</span>
                        <span>{product.farmer_name}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case "orders":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">All Platform Orders</h2>
            {orders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No orders placed yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order._id} className="overflow-hidden border-primary/10">
                    <CardHeader className="bg-primary/5 py-3 border-b border-primary/10 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">COD</Badge>
                        <p className="text-xs font-black">ORDER: {order._id.slice(-8)}</p>
                      </div>
                      <Badge className={
                        order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' :
                          order.status === 'Cancelled' ? 'bg-rose-100 text-rose-700 hover:bg-rose-100' :
                            order.status === 'Packed' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200' :
                              'bg-amber-100 text-amber-700 hover:bg-amber-100'
                      }>
                        {order.status}
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="grid md:grid-cols-3 divide-x divide-primary/10">
                        <div className="p-4 space-y-3">
                          <p className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-1">
                            <User className="w-3 h-3" /> Customer
                          </p>
                          <div>
                            <p className="font-bold text-sm">{order.user?.name || order.shippingAddress.name}</p>
                            <p className="text-xs text-muted-foreground">{order.user?.email || order.shippingAddress.email}</p>
                            <p className="text-xs text-muted-foreground mt-1">{order.shippingAddress.phone}</p>
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          <p className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-1">
                            <Wheat className="w-3 h-3" /> Farmer Items
                          </p>
                          <div className="space-y-2">
                            {order.items.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between text-xs">
                                <span>{item.product?.name} ({item.quantity})</span>
                                <span className="text-muted-foreground">by {item.farmer?.name || "Farmer"}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          <p className="text-[10px] font-black text-muted-foreground uppercase">Revenue Breakup</p>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Subtotal:</span>
                              <span>₹{order.subtotal}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Shipping:</span>
                              <span>+ ₹{order.shippingCharges}</span>
                            </div>
                            <div className="flex justify-between font-black text-primary pt-1 border-t">
                              <span>Total:</span>
                              <span>₹{order.totalAmount}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-2 bg-muted/20 border-t border-primary/5 flex justify-between items-center text-[10px] text-muted-foreground">
                        <span>Placed on: {new Date(order.createdAt).toLocaleString()}</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-2 h-2" />
                          {order.shippingAddress.areaName}, {order.shippingAddress.houseDetails}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case "uploads":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Farmer Data Uploading</h2>
              <Badge variant="secondary">{products.length} Items Listed</Badge>
            </div>
            <div className="grid gap-4">
              {products.map((product) => (
                <Card key={product._id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-32 h-32 bg-muted">
                        <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold">{product.name}</h3>
                              <Badge variant="outline">{product.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Uploaded by: <span className="font-medium text-foreground">{product.farmerName}</span></p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-primary">₹{product.price}/{product.unit}</p>
                            <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(product.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 text-sm line-clamp-1 text-muted-foreground">
                          {product.description}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveView("requests")}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Requests</p>
                      <p className="text-2xl font-bold text-warning">{pendingFarmers}</p>
                    </div>
                    <Clock className="w-8 h-8 text-warning" />
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveView("farmers")}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Approved Farmers</p>
                      <p className="text-2xl font-bold text-green-600">{approvedFarmers}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveView("users")}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                      <p className="text-2xl font-bold">{totalUsers}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveView("orders")}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                      <p className="text-2xl font-bold">{totalOrders}</p>
                    </div>
                    <ShoppingCart className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                      <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveView("requests")}>
                <CardContent className="p-6 text-center">
                  <Sprout className="w-10 h-10 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold">Farmer Requests</h3>
                  <p className="text-sm text-muted-foreground mt-1">Review pending approvals</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveView("users")}>
                <CardContent className="p-6 text-center">
                  <Users className="w-10 h-10 mx-auto mb-3 text-blue-600" />
                  <h3 className="font-semibold">Manage Users</h3>
                  <p className="text-sm text-muted-foreground mt-1">View all platform users</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveView("uploads")}>
                <CardContent className="p-6 text-center">
                  <Package className="w-10 h-10 mx-auto mb-3 text-green-600" />
                  <h3 className="font-semibold">Farmer Uploads</h3>
                  <p className="text-sm text-muted-foreground mt-1">View all data uploading activity</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveView("orders")}>
                <CardContent className="p-6 text-center">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-3 text-purple-600" />
                  <h3 className="font-semibold">Orders</h3>
                  <p className="text-sm text-muted-foreground mt-1">View all orders</p>
                </CardContent>
              </Card>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r hidden lg:block">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">
              Agri<span className="text-primary">Mart</span>
            </span>
          </Link>
          <Badge variant="secondary" className="mt-2">Admin Panel</Badge>
        </div>

        <nav className="px-4 space-y-1">
          <SidebarLink icon={Shield} label="Dashboard" active={activeView === "dashboard"} onClick={() => setActiveView("dashboard")} />
          <SidebarLink icon={Sprout} label="Farmer Requests" count={pendingFarmers} active={activeView === "requests"} onClick={() => setActiveView("requests")} />
          <SidebarLink icon={Wheat} label="Registered Farmers" count={farmers.length} active={activeView === "farmers"} onClick={() => setActiveView("farmers")} />
          <SidebarLink icon={Users} label="All Users" count={totalUsers} active={activeView === "users"} onClick={() => setActiveView("users")} />
          <SidebarLink icon={Package} label="Farmer Uploads" count={products.length} active={activeView === "uploads"} onClick={() => setActiveView("uploads")} />
          <SidebarLink icon={ShoppingCart} label="Orders" count={totalOrders} active={activeView === "orders"} onClick={() => setActiveView("orders")} />
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button variant="outline" className="w-full" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              {activeView === "dashboard" ? "Admin Dashboard" :
                activeView === "requests" ? "Farmer Requests" :
                  activeView === "farmers" ? "Registered Farmers" :
                    activeView === "users" ? "All Users" :
                      activeView === "products" ? "Products" : "Orders"}
            </h1>
            <p className="text-muted-foreground">
              {activeView === "dashboard" ? "Manage farmers, users, and platform analytics" :
                activeView === "farmers" ? "View and manage all registered farmers and their status" :
                  `Manage and view ${activeView}`}
            </p>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-4 mt-4 md:mt-0">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <Clock className="w-4 h-4 mr-2" />Refresh
            </Button>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {renderContent()}
      </main>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Farmer Application</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>Reason for Rejection</Label>
            <Textarea
              placeholder="Please provide a reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRejectFarmer}>Reject Application</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Approval</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Are you sure you want to approve <strong>{selectedFarmer?.name}</strong>?
              This will allow them to access the farmer dashboard and list products.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleApproveFarmer}>Confirm & Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">Review Farmer Application</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={selectedFarmer?.status?.toLowerCase() === 'incomplete' ? "outline" : "secondary"}>
                    {selectedFarmer?.status?.toLowerCase() === 'pending' ? 'Under Review' :
                      selectedFarmer?.status?.toLowerCase() === 'incomplete' ? 'Profile Incomplete' : selectedFarmer?.status}
                  </Badge>
                  {selectedFarmer?.submittedAt && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Submitted: {new Date(selectedFarmer.submittedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>
          {selectedFarmer && (
            <div className="py-6 space-y-8">
              {/* Section 1: Contact Information */}
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 px-1 flex items-center gap-2">
                  <User className="w-4 h-4" /> Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 p-4 rounded-xl border border-border">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Full Name</Label>
                    <p className="font-semibold text-lg">{selectedFarmer.name}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Email Address</Label>
                    <div className="flex items-center gap-1.5 font-medium">
                      <Mail className="w-4 h-4 text-primary" />
                      {selectedFarmer.email}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Phone Number</Label>
                    <div className="flex items-center gap-1.5 font-medium">
                      <Phone className="w-4 h-4 text-primary" />
                      {selectedFarmer.phone || "N/A"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Location</Label>
                    <div className="flex items-center gap-1.5 font-medium">
                      <MapPin className="w-4 h-4 text-primary" />
                      {selectedFarmer.district || "N/A"}, {selectedFarmer.state || "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Farm Details */}
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 px-1 flex items-center gap-2">
                  <Wheat className="w-4 h-4" /> Farm & Experience Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 p-4 rounded-xl border border-border">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Farm Size (Acres)</Label>
                    <p className="font-semibold">{selectedFarmer.farmSize || "N/A"} Acres</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Years of Experience</Label>
                    <p className="font-semibold">{selectedFarmer.experience || 0} Years</p>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-xs text-muted-foreground">Primary Crops</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedFarmer.crops ? (
                        selectedFarmer.crops.split(',').map((crop: string, i: number) => (
                          <Badge key={i} variant="secondary" className="bg-primary/5 hover:bg-primary/10 text-primary border-primary/20">
                            {crop.trim()}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm">N/A</p>
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-xs text-muted-foreground">About the Farm</Label>
                    <p className="text-sm leading-relaxed text-muted-foreground italic bg-background/50 p-3 rounded-lg border border-border/50">
                      "{selectedFarmer.description || "No description provided."}"
                    </p>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-xs text-muted-foreground">Detailed Address</Label>
                    <p className="text-sm font-medium">{selectedFarmer.address || "N/A"}</p>
                  </div>
                </div>
              </div>


              {/* Section 3: Verification Documents */}
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 px-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Verification Documents
                  </div>
                  <Badge variant="outline" className="text-[10px] font-normal">
                    ID: {selectedFarmer._id.substring(0, 8)}...
                  </Badge>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/10 p-4 rounded-xl border border-dashed border-border">
                  <div className="space-y-3">
                    <Label className="text-xs text-muted-foreground uppercase flex items-center justify-between">
                      Aadhaar Card Proof
                      {selectedFarmer.aadhaarProof && <span className="text-[10px] lowercase text-green-600">(Ready to Review)</span>}
                    </Label>
                    {selectedFarmer.aadhaarProof ? (
                      <div className="group relative border rounded-xl overflow-hidden bg-black/5 aspect-[4/3] flex items-center justify-center transition-all hover:ring-2 hover:ring-primary/20">
                        <img
                          src={selectedFarmer.aadhaarProof}
                          alt="Aadhaar Proof"
                          className="max-w-full max-h-full object-contain"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button size="sm" variant="secondary" onClick={() => window.open(selectedFarmer.aadhaarProof, '_blank')}>
                            <ExternalLink className="w-4 h-4 mr-2" /> View Fullscreen
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-dashed rounded-xl p-8 text-center text-muted-foreground bg-muted/20 aspect-[4/3] flex flex-col items-center justify-center">
                        <Shield className="w-10 h-10 mb-2 opacity-20" />
                        <p className="text-xs">No Aadhaar proof uploaded</p>
                        <p className="text-[10px] mt-1 opacity-50">Profile may be incomplete</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs text-muted-foreground uppercase flex items-center justify-between">
                      Land Records Proof
                      {selectedFarmer.landDocProof && <span className="text-[10px] lowercase text-green-600">(Ready to Review)</span>}
                    </Label>
                    {selectedFarmer.landDocProof ? (
                      <div className="group relative border rounded-xl overflow-hidden bg-black/5 aspect-[4/3] flex items-center justify-center transition-all hover:ring-2 hover:ring-primary/20">
                        <img
                          src={selectedFarmer.landDocProof}
                          alt="Land Records Proof"
                          className="max-w-full max-h-full object-contain"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button size="sm" variant="secondary" onClick={() => window.open(selectedFarmer.landDocProof, '_blank')}>
                            <ExternalLink className="w-4 h-4 mr-2" /> View Fullscreen
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-dashed rounded-xl p-8 text-center text-muted-foreground bg-muted/20 aspect-[4/3] flex flex-col items-center justify-center">
                        <Shield className="w-10 h-10 mb-2 opacity-20" />
                        <p className="text-xs">No land record uploaded</p>
                        <p className="text-[10px] mt-1 opacity-50">Profile may be incomplete</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>Close</Button>
            <Button variant="destructive" onClick={() => { setReviewDialogOpen(false); setRejectDialogOpen(true); }}>
              Reject
            </Button>
            <Button onClick={() => { setReviewDialogOpen(false); setApproveDialogOpen(true); }}>
              Approve Farmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}
