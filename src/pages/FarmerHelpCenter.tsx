import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Sprout,
    HelpCircle,
    MessageSquare,
    PlusCircle,
    CheckCircle2,
    XCircle,
    ChevronRight,
    Send,
    Loader2,
    User,
    Bot,
    ArrowLeft
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const FARMER_FAQS = [
    {
        title: "How to Start?",
        content: "Register using the 'Join as Farmer' button. Once you submit your personal and farm details, our team will verify your documents.",
        icon: Sprout
    },
    {
        title: "Registration Guide",
        content: "You need a valid Aadhaar Card and Land Records. Upload clear photos in the verification step. Ensure your email matches across all forms.",
        icon: PlusCircle
    },
    {
        title: "Handling Approval",
        content: "Once approved, your dashboard will unlock. You'll see a welcome banner and can start adding products immediately.",
        icon: CheckCircle2
    },
    {
        title: "What if Rejected?",
        content: "If rejected, check the 'Reason for Rejection' on your dashboard. You can update your details or contact support for clarification.",
        icon: XCircle
    },
    {
        title: "Adding Items",
        content: "Go to your dashboard, click 'Add Product', set the price, category, and quantity. Approved items will be visible to all customers.",
        icon: HelpCircle
    }
];

export default function FarmerHelpCenter() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([
        { role: "bot", text: "Hello! I am your AgriMart assistant. How can I help you today with your farmer account?" }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = input.trim();
        setMessages(prev => [...prev, { role: "user", text: userMessage }]);
        setInput("");
        setIsTyping(true);

        try {
            // Simple logic for farmer-specific help
            setTimeout(() => {
                let response = "I'm sorry, I couldn't find a specific answer for that. Please contact our support team at support@agrimart.com.";

                if (userMessage.toLowerCase().includes("register")) {
                    response = "To register, go to the homepage and click 'Join as Farmer'. You'll need Aadhaar and Land documents.";
                } else if (userMessage.toLowerCase().includes("approve")) {
                    response = "Approvals usually take 24-48 hours. Our admin team will review your submitted documents.";
                } else if (userMessage.toLowerCase().includes("rejected")) {
                    response = "If your application is rejected, look for the 'Reason for Rejection' on your dashboard. You can re-submit after fixing the issues.";
                } else if (userMessage.toLowerCase().includes("add")) {
                    response = "To add items, go to your Farmer Dashboard and click the '+' or 'Add Product' button.";
                } else if (userMessage.toLowerCase().includes("status")) {
                    response = "You can check your status on the dashboard. It will show 'Pending', 'Approved', or 'Rejected'.";
                }

                setMessages(prev => [...prev, { role: "bot", text: response }]);
                setIsTyping(false);
            }, 1000);
        } catch (error) {
            setIsTyping(false);
        }
    };

    return (
        <div className="min-h-screen bg-muted/30">
            <main className="container mx-auto px-4 py-8">
                <Link
                    to="/farmer/dashboard"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* FAQ Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold mb-2">Farmer Help Centre</h1>
                            <p className="text-muted-foreground text-lg">Everything you need to know about selling on AgriMart.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {FARMER_FAQS.map((faq, i) => (
                                <Card key={i} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="flex flex-row items-center gap-3 pb-2">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <faq.icon className="w-5 h-5 text-primary" />
                                        </div>
                                        <CardTitle className="text-lg">{faq.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{faq.content}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <Card className="bg-primary/5 border-primary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-primary">
                                    <Badge className="bg-primary">New</Badge>
                                    Seller Guidelines
                                </CardTitle>
                                <CardDescription>Follow these tips to sell faster</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-4 items-start">
                                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs shrink-0 mt-0.5">1</div>
                                    <p className="text-sm">Use high-quality images of your produce in natural light.</p>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs shrink-0 mt-0.5">2</div>
                                    <p className="text-sm">Be honest about the quantity and weight of the items.</p>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs shrink-0 mt-0.5">3</div>
                                    <p className="text-sm">Keep your phone nearby to respond to customer inquiries.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Chatbot Section */}
                    <div className="lg:col-span-1">
                        <Card className="h-[600px] flex flex-col sticky top-24 shadow-xl border-primary/10">
                            <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                        <Bot className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">AgriBot Assistant</CardTitle>
                                        <p className="text-xs text-primary-foreground/80">Online | Farmer Support</p>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1 p-0 overflow-hidden relative">
                                <div className="h-full p-4 overflow-y-auto" ref={scrollRef}>
                                    <div className="space-y-4">
                                        {messages.map((m, i) => (
                                            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${m.role === "user"
                                                    ? "bg-primary text-primary-foreground rounded-tr-none"
                                                    : "bg-muted text-foreground rounded-tl-none border border-border"
                                                    }`}>
                                                    {m.text}
                                                </div>
                                            </div>
                                        ))}
                                        {isTyping && (
                                            <div className="flex justify-start">
                                                <div className="bg-muted text-foreground rounded-2xl rounded-tl-none px-4 py-2 border border-border">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>

                            <div className="p-4 border-t bg-card">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Ask AgriBot..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                                        className="flex-1"
                                    />
                                    <Button size="icon" onClick={handleSendMessage} disabled={isTyping || !input.trim()}>
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-2 text-center italic">
                                    Powered by AgriMart AI
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
