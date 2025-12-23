import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
} from "lucide-react";

// Mock data
const mockProducts = [
  { id: "1", name: "Fresh Tomatoes", category: "Vegetables", price: 40, unit: "kg", quantity_available: 100, is_active: true },
  { id: "2", name: "Organic Rice", category: "Grains", price: 80, unit: "kg", quantity_available: 500, is_active: true },
];

const mockOrders = [
  { id: "1", order_number: "ORD-001", total_amount: 400, status: "delivered", created_at: new Date().toISOString(), buyer_name: "Rahul Sharma", items: ["Fresh Tomatoes x 10kg"] },
  { id: "2", order_number: "ORD-002", total_amount: 1200, status: "pending", created_at: new Date().toISOString(), buyer_name: "Priya Patel", items: ["Organic Rice x 15kg"] },
];

const mockClients = [
  { id: "1", name: "Rahul Sharma", email: "rahul@example.com", phone: "+91 98765 43210", orders: 5, total_spent: 2500 },
  { id: "2", name: "Priya Patel", email: "priya@example.com", phone: "+91 87654 32109", orders: 3, total_spent: 1800 },
  { id: "3", name: "Amit Kumar", email: "amit@example.com", phone: "+91 76543 21098", orders: 8, total_spent: 4200 },
];

const mockMessages = [
  { id: "1", sender: "Rahul Sharma", message: "When will my order be delivered?", time: "2 hours ago", unread: true },
  { id: "2", sender: "Priya Patel", message: "Do you have organic mangoes?", time: "5 hours ago", unread: true },
  { id: "3", sender: "Amit Kumar", message: "Thank you for the fresh vegetables!", time: "1 day ago", unread: false },
];

const mockHistory = [
  { id: "1", action: "Order Delivered", details: "ORD-001 delivered to Rahul Sharma", date: new Date().toISOString() },
  { id: "2", action: "Product Added", details: "Added Fresh Tomatoes to listings", date: new Date(Date.now() - 86400000).toISOString() },
  { id: "3", action: "Order Received", details: "New order ORD-002 from Priya Patel", date: new Date(Date.now() - 172800000).toISOString() },
];

type ActiveView = "services" | "orders" | "clients" | "messages" | "history" | "settings";

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
  const { user, signOut, isApprovedFarmer, farmerStatus, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [products, setProducts] = useState(mockProducts);
  const [orders] = useState(mockOrders);
  const [clients] = useState(mockClients);
  const [messages] = useState(mockMessages);
  const [history] = useState(mockHistory);
  const [loading, setLoading] = useState(false);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>("services");
  
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    category: "Vegetables",
    price: "",
    unit: "kg",
    quantity_available: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleAddProduct = () => {
    const product = {
      id: String(Date.now()),
      name: newProduct.name,
      category: newProduct.category,
      price: parseFloat(newProduct.price),
      unit: newProduct.unit,
      quantity_available: parseFloat(newProduct.quantity_available),
      is_active: true,
    };
    
    setProducts([product, ...products]);
    toast({
      title: "Product Added",
      description: "Your product has been listed successfully.",
    });
    setAddProductOpen(false);
    setNewProduct({
      name: "",
      description: "",
      category: "Vegetables",
      price: "",
      unit: "kg",
      quantity_available: "",
    });
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

  // Pending approval state
  if (farmerStatus === "pending") {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <Clock className="w-16 h-16 mx-auto text-warning mb-4" />
            <h2 className="text-2xl font-bold mb-2">Approval Pending</h2>
            <p className="text-muted-foreground mb-6">
              Your farmer registration is under review. You will be notified once approved by the admin.
            </p>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Rejected state
  if (farmerStatus === "rejected") {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
            <h2 className="text-2xl font-bold mb-2">Registration Rejected</h2>
            <p className="text-muted-foreground mb-6">
              Unfortunately, your farmer registration was not approved. Please contact support for more information.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate("/contact")}>
                Contact Support
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate stats
  const totalEarnings = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + o.total_amount, 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const activeProducts = products.filter((p) => p.is_active).length;
  const unreadMessages = messages.filter((m) => m.unread).length;

  const renderContent = () => {
    switch (activeView) {
      case "orders":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Orders</h2>
            {orders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No orders yet</p>
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{order.order_number}</p>
                        <p className="text-sm text-muted-foreground">{order.buyer_name}</p>
                      </div>
                      <Badge variant={order.status === "delivered" ? "success" : "secondary"}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {order.items.join(", ")}
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>₹{order.total_amount}</span>
                      <span className="text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        );

      case "clients":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">My Clients</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {clients.map((client) => (
                <Card key={client.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{client.name}</h3>
                        <p className="text-sm text-muted-foreground">{client.orders} orders</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        {client.email}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        {client.phone}
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-muted-foreground">Total Spent</span>
                        <span className="font-medium text-primary">₹{client.total_spent}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case "messages":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Messages</h2>
            {messages.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No messages yet</p>
                </CardContent>
              </Card>
            ) : (
              messages.map((msg) => (
                <Card key={msg.id} className={msg.unread ? "border-primary/50" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{msg.sender}</h3>
                            {msg.unread && <Badge variant="destructive" className="h-5">New</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{msg.message}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{msg.time}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        );

      case "history":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Activity History</h2>
            <div className="space-y-3">
              {history.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.action}</p>
                        <p className="text-sm text-muted-foreground">{item.details}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Settings</h2>
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input defaultValue={user?.user_metadata?.full_name || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input defaultValue={user?.email || ""} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div className="space-y-2">
                    <Label>Farm Name</Label>
                    <Input placeholder="Your farm name" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Farm Address</Label>
                  <Textarea placeholder="Enter your farm address" />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Earnings</p>
                      <p className="text-2xl font-bold">₹{totalEarnings.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <IndianRupee className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Products</p>
                      <p className="text-2xl font-bold">{activeProducts}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Orders</p>
                      <p className="text-2xl font-bold">{pendingOrders}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                      <p className="text-2xl font-bold">{orders.length}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Products */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">My Products</h2>
                <Dialog open={addProductOpen} onOpenChange={setAddProductOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Product</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Product Name</Label>
                        <Input
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                          placeholder="e.g., Fresh Tomatoes"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={newProduct.description}
                          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                          placeholder="Describe your product..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <select
                            className="w-full h-10 px-3 border rounded-md bg-background"
                            value={newProduct.category}
                            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                          >
                            <option>Vegetables</option>
                            <option>Fruits</option>
                            <option>Grains</option>
                            <option>Dairy</option>
                            <option>Spices</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label>Unit</Label>
                          <select
                            className="w-full h-10 px-3 border rounded-md bg-background"
                            value={newProduct.unit}
                            onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                          >
                            <option>kg</option>
                            <option>dozen</option>
                            <option>piece</option>
                            <option>litre</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Price (₹)</Label>
                          <Input
                            type="number"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Quantity Available</Label>
                          <Input
                            type="number"
                            value={newProduct.quantity_available}
                            onChange={(e) => setNewProduct({ ...newProduct, quantity_available: e.target.value })}
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <Button className="w-full" onClick={handleAddProduct}>
                        Add Product
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {products.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No products listed yet</p>
                    <Button onClick={() => setAddProductOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Product
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => (
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
                        <div className="flex items-center justify-between text-sm">
                          <span>₹{product.price}/{product.unit}</span>
                          <span className="text-muted-foreground">
                            Stock: {product.quantity_available} {product.unit}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
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
        </div>
        
        <nav className="px-4 space-y-1">
          <SidebarLink icon={Package} label="My Services" active={activeView === "services"} onClick={() => setActiveView("services")} />
          <SidebarLink icon={ShoppingCart} label="Orders" count={pendingOrders} active={activeView === "orders"} onClick={() => setActiveView("orders")} />
          <SidebarLink icon={Users} label="Clients" active={activeView === "clients"} onClick={() => setActiveView("clients")} />
          <SidebarLink icon={MessageSquare} label="Messages" count={unreadMessages} active={activeView === "messages"} onClick={() => setActiveView("messages")} />
          <SidebarLink icon={History} label="History" active={activeView === "history"} onClick={() => setActiveView("history")} />
          <Link to="/help">
            <SidebarLink icon={HelpCircle} label="Help Center" />
          </Link>
          <SidebarLink icon={Settings} label="Settings" active={activeView === "settings"} onClick={() => setActiveView("settings")} />
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
              {activeView === "services" ? `Welcome, ${user?.user_metadata?.full_name || "Farmer"}` :
               activeView === "orders" ? "Orders" :
               activeView === "clients" ? "My Clients" :
               activeView === "messages" ? "Messages" :
               activeView === "history" ? "Activity History" : "Settings"}
            </h1>
            <p className="text-muted-foreground">
              {activeView === "services" ? "Manage your products and orders" :
               activeView === "orders" ? "View and manage your orders" :
               activeView === "clients" ? "View your customer base" :
               activeView === "messages" ? "Chat with your customers" :
               activeView === "history" ? "View your activity log" : "Manage your profile"}
            </p>
          </div>
        </div>

        {renderContent()}
      </main>
    </div>
  );
}
