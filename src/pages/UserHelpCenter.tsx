import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    ShoppingBag,
    Search,
    CreditCard,
    Truck,
    MessageSquare,
    Send,
    Loader2,
    Bot,
    ArrowLeft,
    ChevronRight,
    HelpCircle
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const USER_FAQS = [
    {
        title: "How to Order?",
        content: "Browse products, select your quantity, and click 'Add to Cart'. Go to your cart and proceed to checkout with your address.",
        icon: ShoppingBag
    },
    {
        title: "Browsing Items",
        content: "Use the search bar or category filters to find fresh produce. You can see the farmer's name and location on each item.",
        icon: Search
    },
    {
        title: "Payment Methods",
        content: "We support UPI, Net Banking, and Debit/Credit cards. Your payment info is secure and encrypted.",
        icon: CreditCard
    },
    {
        title: "Tracking Delivery",
        content: "Once ordered, you can track the status in 'My Orders' section of your dashboard. You'll receive updates as it ships.",
        icon: Truck
    },
    {
        title: "Support Policy",
        content: "If you have issues with an order, use the 'Contact Support' button in your dashboard or message the farmer directly.",
        icon: MessageSquare
    }
];

export default function UserHelpCenter() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([
        { role: "bot", text: "Hi! How can I help you today with your AgriMart shopping experience?" }
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
            setTimeout(() => {
                let response = "I'm not sure about that. Please contact support@agrimart.com for more detailed help.";

                if (userMessage.toLowerCase().includes("order")) {
                    response = "To place an order, add items to your cart and click 'Checkout'. Enter your delivery details and choose a payment method.";
                } else if (userMessage.toLowerCase().includes("payment")) {
                    response = "We accept UPI, cards, and net banking. Payments are handled via our secure payment gateway.";
                } else if (userMessage.toLowerCase().includes("track")) {
                    response = "You can track your orders in the 'My Orders' section of your User Dashboard.";
                } else if (userMessage.toLowerCase().includes("return") || userMessage.toLowerCase().includes("refund")) {
                    response = "Please reach out within 24 hours if items are damaged. We'll verify and process your refund.";
                } else if (userMessage.toLowerCase().includes("search")) {
                    response = "Use the search bar on the homepage or market page to find specific vegetables or fruits.";
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
                    to="/dashboard"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* FAQ Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold mb-2">Customer Help Centre</h1>
                            <p className="text-muted-foreground text-lg">Your guide to buying fresh produce directly from farmers.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {USER_FAQS.map((faq, i) => (
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
                                    <Badge className="bg-primary">Tip</Badge>
                                    Buying Guide
                                </CardTitle>
                                <CardDescription>Get the best out of AgriMart</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-4 items-start">
                                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs shrink-0 mt-0.5">1</div>
                                    <p className="text-sm">Check the 'Freshness' rating and Farmer's details before buying.</p>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs shrink-0 mt-0.5">2</div>
                                    <p className="text-sm">Buying in bulk often provides better shipping rates.</p>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs shrink-0 mt-0.5">3</div>
                                    <p className="text-sm">Verify your address and phone number to avoid delivery delays.</p>
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
                                        <CardTitle className="text-lg">Shop Assistant</CardTitle>
                                        <p className="text-xs text-primary-foreground/80">Online | Shopping Support</p>
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
                                        placeholder="Ask Shop Assistant..."
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
