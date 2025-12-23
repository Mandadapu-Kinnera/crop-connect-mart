import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

const mockUsers = [
  { id: "1", full_name: "Demo User", email: "user@agrimart.com", created_at: new Date().toISOString(), user_roles: [{ role: "user" }] },
  { id: "2", full_name: "Demo Farmer", email: "farmer@agrimart.com", created_at: new Date().toISOString(), user_roles: [{ role: "farmer" }] },
  { id: "3", full_name: "Admin User", email: "admin@agrimart.com", created_at: new Date().toISOString(), user_roles: [{ role: "admin" }] },
];

const mockProducts = [
  { id: "1", name: "Fresh Tomatoes", category: "Vegetables", price: 40, unit: "kg", is_active: true, farmer_name: "Ramesh Kumar" },
  { id: "2", name: "Organic Rice", category: "Grains", price: 80, unit: "kg", is_active: true, farmer_name: "Suresh Patil" },
  { id: "3", name: "Alphonso Mangoes", category: "Fruits", price: 350, unit: "dozen", is_active: true, farmer_name: "Suresh Patil" },
];

const mockOrders = [
  { id: "1", order_number: "ORD-001", total_amount: 450, status: "delivered", created_at: new Date().toISOString(), buyer: "Demo User" },
  { id: "2", order_number: "ORD-002", total_amount: 1200, status: "pending", created_at: new Date().toISOString(), buyer: "Demo User" },
];

type ActiveView = "dashboard" | "requests" | "farmers" | "users" | "products" | "orders";

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
  
  const [farmers, setFarmers] = useState(initialFarmers);
  const [users] = useState(mockUsers);
  const [products] = useState(mockProducts);
  const [orders] = useState(mockOrders);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");
  
  const [selectedFarmer, setSelectedFarmer] = useState<any>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || userRole !== "admin")) {
      navigate("/auth");
    }
  }, [user, userRole, authLoading, navigate]);

  const handleApproveFarmer = (farmer: any) => {
    setFarmers(farmers.map(f => 
      f.id === farmer.id 
        ? { ...f, approval_status: "approved" }
        : f
    ));
    toast({
      title: "Farmer Approved",
      description: "The farmer has been approved and notified.",
    });
  };

  const handleRejectFarmer = () => {
    if (!selectedFarmer) return;
    
    setFarmers(farmers.map(f => 
      f.id === selectedFarmer.id 
        ? { ...f, approval_status: "rejected" }
        : f
    ));
    
    toast({
      title: "Farmer Rejected",
      description: "The farmer has been notified.",
    });
    setRejectDialogOpen(false);
    setSelectedFarmer(null);
    setRejectionReason("");
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
  const pendingFarmers = farmers.filter((f) => f.approval_status === "pending").length;
  const approvedFarmers = farmers.filter((f) => f.approval_status === "approved").length;
  const totalUsers = users.length;
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + o.total_amount, 0);

  const filteredFarmers = farmers.filter((farmer) => {
    const profile = farmer.profiles;
    const searchLower = searchQuery.toLowerCase();
    return (
      profile?.full_name?.toLowerCase().includes(searchLower) ||
      profile?.email?.toLowerCase().includes(searchLower) ||
      farmer.farm_name?.toLowerCase().includes(searchLower)
    );
  });

  const filteredUsers = users.filter((u) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(searchLower) ||
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
            {filteredFarmers.filter((f) => f.approval_status === "pending").length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                  <p className="text-muted-foreground">No pending farmer requests</p>
                </CardContent>
              </Card>
            ) : (
              filteredFarmers
                .filter((f) => f.approval_status === "pending")
                .map((farmer) => (
                  <Card key={farmer.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{farmer.profiles?.full_name || "Unknown"}</h3>
                            <Badge variant="secondary">{farmer.approval_status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{farmer.profiles?.email}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                            <div><span className="text-muted-foreground">Farm: </span>{farmer.farm_name || "N/A"}</div>
                            <div><span className="text-muted-foreground">Size: </span>{farmer.farm_size || "N/A"}</div>
                            <div><span className="text-muted-foreground">Experience: </span>{farmer.experience_years || 0} years</div>
                            <div><span className="text-muted-foreground">Registered: </span>{new Date(farmer.created_at).toLocaleDateString()}</div>
                          </div>
                          {farmer.crops_grown && farmer.crops_grown.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {farmer.crops_grown.map((crop: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs">{crop}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => { setSelectedFarmer(farmer); setRejectDialogOpen(true); }}>
                            <XCircle className="w-4 h-4 mr-1" />Reject
                          </Button>
                          <Button size="sm" onClick={() => handleApproveFarmer(farmer)}>
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
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Farm</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFarmers.map((farmer) => (
                    <tr key={farmer.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <p className="font-medium">{farmer.profiles?.full_name}</p>
                        <p className="text-sm text-muted-foreground">{farmer.profiles?.email}</p>
                      </td>
                      <td className="py-3 px-4">{farmer.farm_name || "N/A"}</td>
                      <td className="py-3 px-4">
                        <Badge variant={farmer.approval_status === "approved" ? "success" : farmer.approval_status === "rejected" ? "destructive" : "secondary"}>
                          {farmer.approval_status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{new Date(farmer.created_at).toLocaleDateString()}</td>
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
                    <tr key={u.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{u.full_name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{u.email}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="capitalize">{u.user_roles?.[0]?.role || "user"}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
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
            <h2 className="text-xl font-semibold">All Orders</h2>
            {orders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No orders yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order #</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Buyer</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{order.order_number}</td>
                        <td className="py-3 px-4">{order.buyer}</td>
                        <td className="py-3 px-4">₹{order.total_amount}</td>
                        <td className="py-3 px-4">
                          <Badge variant={order.status === "delivered" ? "success" : "secondary"}>{order.status}</Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveView("products")}>
                <CardContent className="p-6 text-center">
                  <Package className="w-10 h-10 mx-auto mb-3 text-green-600" />
                  <h3 className="font-semibold">Products</h3>
                  <p className="text-sm text-muted-foreground mt-1">View all listed products</p>
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
          <SidebarLink icon={Users} label="All Users" count={totalUsers} active={activeView === "users"} onClick={() => setActiveView("users")} />
          <SidebarLink icon={Package} label="Products" count={products.length} active={activeView === "products"} onClick={() => setActiveView("products")} />
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
               activeView === "farmers" ? "All Farmers" :
               activeView === "users" ? "All Users" :
               activeView === "products" ? "Products" : "Orders"}
            </h1>
            <p className="text-muted-foreground">
              {activeView === "dashboard" ? "Manage farmers, users, and platform analytics" : 
               `Manage and view ${activeView}`}
            </p>
          </div>
          <div className="relative mt-4 md:mt-0 w-full md:w-80">
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
    </div>
  );
}
