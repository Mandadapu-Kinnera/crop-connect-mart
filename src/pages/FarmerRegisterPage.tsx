import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Leaf, 
  ArrowLeft, 
  User, 
  Phone, 
  MapPin, 
  Wheat,
  Upload,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const steps = [
  { id: 1, title: "Personal Info" },
  { id: 2, title: "Farm Details" },
  { id: 3, title: "Verification" },
];

export default function FarmerRegisterPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    state: "",
    district: "",
    farmSize: "",
    crops: "",
    experience: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Registration Submitted!",
        description: "Your application is under review. We'll notify you within 24-48 hours.",
      });
      navigate("/");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 opacity-40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-2xl">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-glow">
            <Leaf className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold">
            Agri<span className="text-primary">Mart</span>
          </span>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 max-w-md">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                currentStep > step.id
                  ? "bg-primary text-primary-foreground"
                  : currentStep === step.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}>
                {currentStep > step.id ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  step.id
                )}
              </div>
              <span className="ml-2 text-sm font-medium hidden sm:block">{step.title}</span>
              {index < steps.length - 1 && (
                <div className={`w-12 sm:w-20 h-0.5 mx-2 ${
                  currentStep > step.id ? "bg-primary" : "bg-muted"
                }`} />
              )}
            </div>
          ))}
        </div>

        <Card variant="elevated" className="animate-scale-in">
          <CardHeader>
            <CardTitle className="text-2xl">
              {currentStep === 1 && "Personal Information"}
              {currentStep === 2 && "Farm Details"}
              {currentStep === 3 && "Verification"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Tell us about yourself so buyers can reach you"}
              {currentStep === 2 && "Share details about your farm and produce"}
              {currentStep === 3 && "Upload documents for verification"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {currentStep === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        className="pl-10"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        className="pl-10"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        placeholder="e.g., Telangana"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district">District</Label>
                      <Input
                        id="district"
                        placeholder="e.g., Warangal"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Full Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Textarea
                        id="address"
                        placeholder="Enter your complete address"
                        className="pl-10 min-h-[80px]"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="farmSize">Farm Size (in acres)</Label>
                    <Input
                      id="farmSize"
                      type="number"
                      placeholder="e.g., 5"
                      value={formData.farmSize}
                      onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="crops">Main Crops Grown</Label>
                    <div className="relative">
                      <Wheat className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="crops"
                        placeholder="e.g., Rice, Tomatoes, Chillies"
                        className="pl-10"
                        value={formData.crops}
                        onChange={(e) => setFormData({ ...formData, crops: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Farming Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      placeholder="e.g., 10"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">About Your Farm</Label>
                    <Textarea
                      id="description"
                      placeholder="Tell buyers about your farming practices, certifications, etc."
                      className="min-h-[100px]"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </>
              )}

              {currentStep === 3 && (
                <>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer">
                      <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                      <p className="font-medium mb-1">Upload Aadhaar Card</p>
                      <p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
                    </div>

                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer">
                      <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                      <p className="font-medium mb-1">Upload Land Documents</p>
                      <p className="text-sm text-muted-foreground">Pattadar passbook or land records</p>
                    </div>

                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer">
                      <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                      <p className="font-medium mb-1">Upload Farm Photos (Optional)</p>
                      <p className="text-sm text-muted-foreground">Show buyers your farm</p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Your documents will be verified within 24-48 hours. We ensure all data is kept secure and private.
                  </p>
                </>
              )}

              <div className="flex gap-4 pt-4">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setCurrentStep(currentStep - 1)}
                  >
                    Previous
                  </Button>
                )}
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading
                    ? "Submitting..."
                    : currentStep === 3
                    ? "Submit Application"
                    : "Continue"}
                </Button>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already registered?{" "}
              <Link to="/auth" className="text-primary font-medium hover:underline">
                Log in here
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
