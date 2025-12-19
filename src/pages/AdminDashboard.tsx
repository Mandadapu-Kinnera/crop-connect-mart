import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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
  AlertCircle,
  Eye,
} from "lucide-react";

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
  
  const [selectedFarmer, setSelectedFarmer] = useState<any>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || userRole !== "admin")) {
      navigate("/auth");
    }
  }, [user, userRole, authLoading, navigate]);

  useEffect(() => {
    if (user && userRole === "admin") {
      fetchAllData();
    }
  }, [user, userRole]);

  const fetchAllData = async () => {
    setLoading(true);
    
    // Fetch all farmer profiles with user info
    const { data: farmersData } = await supabase
      .from("farmer_profiles")
      .select("*, profiles!farmer_profiles_user_id_fkey(*)")
      .order("created_at", { ascending: false });
    
    if (farmersData) setFarmers(farmersData);
    
    // Fetch all user profiles
    const { data: usersData } = await supabase
      .from("profiles")
      .select("*, user_roles(*)")
      .order("created_at", { ascending: false });
    
    if (usersData) setUsers(usersData);
    
    // Fetch all products
    const { data: productsData } = await supabase
      .from("products")
      .select("*, profiles!products_farmer_id_fkey(*)")
      .order("created_at", { ascending: false });
    
    if (productsData) setProducts(productsData);
    
    // Fetch all orders
    const { data: ordersData } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    
    if (ordersData) setOrders(ordersData);
    
    setLoading(false);
  };

  const handleApproveFarmer = async (farmer: any) => {
    const { error } = await supabase
      .from("farmer_profiles")
      .update({
        approval_status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: user?.id,
      })
      .eq("id", farmer.id);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to approve farmer.",
        variant: "destructive",
      });
    } else {
      // Send notification to farmer
      await supabase.from("notifications").insert({
        user_id: farmer.user_id,
        title: "Registration Approved!",
        message: "Congratulations! Your farmer registration has been approved. You can now list your products on AgriMart.",
        type: "success",
      });
      
      toast({
        title: "Farmer Approved",
        description: "The farmer has been approved and notified.",
      });
      fetchAllData();
    }
  };

  const handleRejectFarmer = async () => {
    if (!selectedFarmer) return;
    
    const { error } = await supabase
      .from("farmer_profiles")
      .update({
        approval_status: "rejected",
        rejection_reason: rejectionReason,
      })
      .eq("id", selectedFarmer.id);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to reject farmer.",
        variant: "destructive",
      });
    } else {
      // Send notification to farmer
      await supabase.from("notifications").insert({
        user_id: selectedFarmer.user_id,
        title: "Registration Not Approved",
        message: `Your farmer registration was not approved. Reason: ${rejectionReason}`,
        type: "error",
      });
      
      toast({
        title: "Farmer Rejected",
        description: "The farmer has been notified.",
      });
      setRejectDialogOpen(false);
      setSelectedFarmer(null);
      setRejectionReason("");
      fetchAllData();
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
  const pendingFarmers = farmers.filter((f) => f.approval_status === "pending").length;
  const approvedFarmers = farmers.filter((f) => f.approval_status === "approved").length;
  const totalUsers = users.length;
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

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
          <SidebarLink icon={Shield} label="Dashboard" active />
          <SidebarLink icon={Sprout} label="Farmer Requests" count={pendingFarmers} />
          <SidebarLink icon={Users} label="All Users" count={totalUsers} />
          <SidebarLink icon={Package} label="Products" count={products.length} />
          <SidebarLink icon={ShoppingCart} label="Orders" count={totalOrders} />
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
            <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage farmers, users, and platform analytics
            </p>
          </div>
          <div className="relative mt-4 md:mt-0 w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search users, farmers..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
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
          <Card>
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
          <Card>
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
          <Card>
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

        {/* Tabs */}
        <Tabs defaultValue="requests" className="space-y-4">
          <TabsList>
            <TabsTrigger value="requests">
              Farmer Requests
              {pendingFarmers > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 px-1.5">
                  {pendingFarmers}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="farmers">All Farmers</TabsTrigger>
            <TabsTrigger value="users">All Users</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          {/* Farmer Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
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
                          <p className="text-sm text-muted-foreground mb-1">
                            {farmer.profiles?.email}
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                            <div>
                              <span className="text-muted-foreground">Farm: </span>
                              {farmer.farm_name || "N/A"}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Size: </span>
                              {farmer.farm_size || "N/A"}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Experience: </span>
                              {farmer.experience_years || 0} years
                            </div>
                            <div>
                              <span className="text-muted-foreground">Registered: </span>
                              {new Date(farmer.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          {farmer.crops_grown && farmer.crops_grown.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {farmer.crops_grown.map((crop: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {crop}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedFarmer(farmer);
                              setRejectDialogOpen(true);
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApproveFarmer(farmer)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>

          {/* All Farmers Tab */}
          <TabsContent value="farmers" className="space-y-4">
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
                        <Badge
                          variant={
                            farmer.approval_status === "approved"
                              ? "success"
                              : farmer.approval_status === "rejected"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {farmer.approval_status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(farmer.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* All Users Tab */}
          <TabsContent value="users" className="space-y-4">
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
                      <td className="py-3 px-4 text-sm">{u.email}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="capitalize">
                          {u.user_roles?.[0]?.role || "user"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
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
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{order.order_number}</td>
                        <td className="py-3 px-4">₹{order.total_amount}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={order.status === "delivered" ? "success" : "secondary"}
                          >
                            {order.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
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
              className="mt-2"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason for rejection..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectFarmer}>
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sidebar Link Component
function SidebarLink({ 
  icon: Icon, 
  label, 
  active, 
  count 
}: { 
  icon: any; 
  label: string; 
  active?: boolean; 
  count?: number;
}) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
        active 
          ? "bg-primary/10 text-primary" 
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="flex-1">{label}</span>
      {count !== undefined && count > 0 && (
        <Badge variant="secondary" className="h-5 px-1.5 text-xs">
          {count}
        </Badge>
      )}
    </button>
  );
}
