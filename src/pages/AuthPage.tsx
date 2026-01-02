import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Mail, Lock, User, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userRole, signIn, signUp, loading: authLoading } = useAuth();

  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "signup");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Redirect if already logged in or handle pre-filled data
  useEffect(() => {
    if (!authLoading && user) {
      if (userRole === "admin") {
        navigate("/admin");
      } else if (userRole === "farmer") {
        navigate("/farmer/dashboard");
      } else {
        navigate("/dashboard");
      }
    }

    // Pre-fill data if available in URL
    const nameParam = searchParams.get("name");
    const emailParam = searchParams.get("email");
    if (nameParam || emailParam) {
      setFormData(prev => ({
        ...prev,
        name: nameParam || prev.name,
        email: emailParam || prev.email
      }));
    }
  }, [user, userRole, authLoading, navigate, searchParams]);

  const isFarmerSignup = !!(!isLogin && searchParams.get("role") === "farmer" && (searchParams.get("email") || searchParams.get("name")));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(formData.email, formData.password);
      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
      }
    } else {
      const role = searchParams.get("role") || "user";
      const { error } = await signUp(formData.email, formData.password, formData.name, role as any);
      if (error) {
        toast({
          title: "Signup Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account created!",
          description: "Welcome to AgriMart!",
        });
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="fixed inset-0 -z-10 opacity-40">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-glow">
            <Leaf className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold">Agri<span className="text-primary">Mart</span></span>
        </div>

        <Card variant="elevated" className="animate-scale-in">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">{isLogin ? "Welcome back" : "Create an account"}</CardTitle>
            <CardDescription>
              {isLogin ? "Enter your credentials to access your account" : "Enter your details to create your AgriMart account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      className="pl-10"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      readOnly={isFarmerSignup}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    readOnly={isFarmerSignup}
                  />
                </div>
                {isFarmerSignup && (
                  <p className="text-[10px] text-muted-foreground mt-1 px-1">
                    * These details are locked to match your registration form.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" className="pl-10 pr-10" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required minLength={6} />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Please wait..." : isLogin ? "Log In" : "Create Account"}
              </Button>
            </form>


            <div className="mt-6 text-center text-sm">
              {isLogin ? (
                <>Don't have an account? <button onClick={() => setIsLogin(false)} className="text-primary font-medium hover:underline">Sign up</button></>
              ) : (
                <>Already have an account? <button onClick={() => setIsLogin(true)} className="text-primary font-medium hover:underline">Log in</button></>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
